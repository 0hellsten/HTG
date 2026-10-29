// Fake-source: Intern testadapter för degradering och källhälsa
// Domän: intern (ingen extern nätverkstrafik)
// Status: inofficiell (syntetisk testkälla för appens tålighet)
// Robots.txt: ej tillämpligt
// Anropsbudget: obegränsad
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import { SourceAdapter, SourceResult, SourceStatus, FetchContext } from '@stallbacken/shared';

export interface FakeSourceConfig {
  forcedStatus?: SourceStatus;
  message?: string;
  data?: unknown;
  simulateThrow?: boolean;
  ageSeconds?: number;
}

export class FakeSourceAdapter implements SourceAdapter<unknown> {
  readonly id = 'fake-source';
  readonly label = 'Testkälla';
  readonly ttlSeconds = 60;
  readonly staleAfterSeconds = 300;

  private currentStatus: SourceStatus = 'ok';
  private customMessage = '';
  private mockData: unknown = { testValue: 'Mock-data för testkälla' };
  private simulateThrow = false;
  private ageSeconds = 0;

  constructor(initialConfig?: FakeSourceConfig) {
    if (initialConfig) {
      this.configure(initialConfig);
    }
  }

  configure(config: FakeSourceConfig): void {
    if (config.forcedStatus !== undefined) {
      this.currentStatus = config.forcedStatus;
    }
    if (config.message !== undefined) {
      this.customMessage = config.message;
    }
    if (config.data !== undefined) {
      this.mockData = config.data;
    }
    if (config.simulateThrow !== undefined) {
      this.simulateThrow = config.simulateThrow;
    }
    if (config.ageSeconds !== undefined) {
      this.ageSeconds = config.ageSeconds;
    }
  }

  setStatus(status: SourceStatus): void {
    this.currentStatus = status;
  }

  setAgeSeconds(age: number): void {
    this.ageSeconds = age;
  }

  setMessage(message: string): void {
    this.customMessage = message;
  }

  reset(): void {
    this.currentStatus = 'ok';
    this.customMessage = '';
    this.mockData = { testValue: 'Mock-data för testkälla' };
    this.simulateThrow = false;
    this.ageSeconds = 0;
  }

  /**
   * Hämtar testdata. Kastar aldrig uppåt — returnerar SourceResult.
   */
  async fetch(_ctx?: FetchContext): Promise<SourceResult<unknown>> {
    try {
      if (this.simulateThrow) {
        throw new Error('Simulerat internt adapterfel i fake-source');
      }

      const fetchedAt = new Date().toISOString();

      if (this.currentStatus === 'failed') {
        return {
          sourceId: this.id,
          status: 'failed',
          data: null,
          fetchedAt,
          ageSeconds: this.ageSeconds,
          message: this.customMessage || 'Uppdateras inte just nu',
          detail: 'fake-source har tvingats till läge failed',
        };
      }

      if (this.currentStatus === 'degraded') {
        return {
          sourceId: this.id,
          status: 'degraded',
          data: this.mockData,
          fetchedAt,
          ageSeconds: this.ageSeconds,
          message: this.customMessage || 'Delvis uppdaterat',
        };
      }

      if (this.currentStatus === 'stale') {
        return {
          sourceId: this.id,
          status: 'stale',
          data: this.mockData,
          fetchedAt,
          ageSeconds: this.ageSeconds || 120, // standard 2 minuter gammalt
          message: this.customMessage || 'Uppdaterat för 2 minuter sedan',
        };
      }

      return {
        sourceId: this.id,
        status: 'ok',
        data: this.mockData,
        fetchedAt,
        ageSeconds: this.ageSeconds,
        message: this.customMessage || '',
      };
    } catch (err) {
      // En adapter fångar allt och kastar aldrig uppåt
      return {
        sourceId: this.id,
        status: 'failed',
        data: null,
        fetchedAt: new Date().toISOString(),
        ageSeconds: this.ageSeconds,
        message: 'Uppdateras inte just nu',
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

export const fakeSource = new FakeSourceAdapter();
