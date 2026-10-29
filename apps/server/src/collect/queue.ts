// Kö och hastighetsbegränsning för externa anrop
// Domän: flertalet
// Status: intern verktygsmodul för artig hämtning
// Anropsbudget: max 1 anrop per sekund per domän
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import { logger } from '../lib/logger.js';

interface QueuedTask<T> {
  fn: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

/**
 * Global hastighetsbegränsare per domän.
 * Garanterar sekventiella anrop och minst 1000 ms mellan anrop mot samma domän.
 */
export class DomainRateLimiter {
  private lastCallTimes = new Map<string, number>();
  private queues = new Map<string, QueuedTask<unknown>[]>();
  private isProcessing = new Map<string, boolean>();
  private readonly minIntervalMs: number;

  constructor(minIntervalMs = 1000) {
    this.minIntervalMs = minIntervalMs;
  }

  /**
   * Lägger till ett anrop i kön för en viss domän och returnerar ett promise.
   */
  async schedule<T>(domain: string, task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const queue = this.queues.get(domain) || [];
      queue.push({
        fn: task as () => Promise<unknown>,
        resolve: resolve as (val: unknown) => void,
        reject,
      });
      this.queues.set(domain, queue);

      if (!this.isProcessing.get(domain)) {
        this.processQueue(domain);
      }
    });
  }

  private async processQueue(domain: string): Promise<void> {
    const queue = this.queues.get(domain);
    if (!queue || queue.length === 0) {
      this.isProcessing.set(domain, false);
      return;
    }

    this.isProcessing.set(domain, true);
    const item = queue.shift();
    if (!item) {
      this.isProcessing.set(domain, false);
      return;
    }

    const lastCall = this.lastCallTimes.get(domain) || 0;
    const now = Date.now();
    const waitTime = Math.max(0, this.minIntervalMs - (now - lastCall));

    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastCallTimes.set(domain, Date.now());

    try {
      const result = await item.fn();
      item.resolve(result);
    } catch (err) {
      item.reject(err);
    } finally {
      // Fortsätt processa kön
      this.processQueue(domain);
    }
  }

  /**
   * Återställer intern kö och historik (används främst i enhetstester).
   */
  reset(): void {
    this.lastCallTimes.clear();
    this.queues.clear();
    this.isProcessing.clear();
  }
}

export const globalRateLimiter = new DomainRateLimiter(1000);

export interface FetchOptions {
  timeoutMs?: number;
  maxRetries?: number;
  backoffDelays?: number[];
  contactEmail?: string;
  rateLimiter?: DomainRateLimiter;
  headers?: Record<string, string>;
}

/**
 * Utför HTTP-hämtning med artighetsregler:
 * - Sekventiell anropskö per domän
 * - User-Agent med appnamn och kontaktadress
 * - 10 s timeout
 * - Upp till 3 försök med backoff
 */
export async function fetchWithPolicy(url: string, options: FetchOptions = {}): Promise<Response> {
  const {
    timeoutMs = 10000,
    maxRetries = 3,
    backoffDelays = [2000, 8000, 30000],
    contactEmail = process.env.CONTACT_EMAIL || 'kontakt@stallbacken.local',
    rateLimiter = globalRateLimiter,
  } = options;

  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname;
  const userAgent = `Tangitza/1.0 (Hellstens Trav och Galopp; privat, icke-kommersiell; kontakt: ${contactEmail})`;

  const executeAttempt = async (_attempt: number): Promise<Response> => {
    return rateLimiter.schedule(domain, async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': userAgent,
            Accept: 'application/json, text/plain, */*',
            ...(options.headers || {}),
          },
          signal: controller.signal,
        });

        clearTimeout(timer);
        return response;
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    });
  };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await executeAttempt(attempt);

      // Vid rate limit eller serverfel kan retry göras om det finns försök kvar
      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        if (attempt < maxRetries - 1) {
          const delay = backoffDelays[attempt] ?? 2000;
          logger.warn(
            `Server svarade med HTTP ${res.status}. Väntar ${delay} ms (försök ${attempt + 1}/${maxRetries}).`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      return res;
    } catch (err) {
      if (attempt < maxRetries - 1) {
        const delay = backoffDelays[attempt] ?? 2000;
        logger.warn(
          `Nätverksfel vid anrop mot ${url}: ${String(err)}. Nytt försök om ${delay} ms.`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }

  throw new Error(`Kunde inte hämta ${url} efter ${maxRetries} försök.`);
}
