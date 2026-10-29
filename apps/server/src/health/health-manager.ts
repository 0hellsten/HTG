import Database from 'better-sqlite3';
import { SourceStatus, SourceHealthRecord, SourceAdapter } from '@stallbacken/shared';
import { getDb } from '../db/connection.js';
import { resolveSourceStatus } from './status.js';
import { logger } from '../lib/logger.js';

interface SourceHealthDbRow {
  id: number;
  source_id: string;
  status: string;
  attempted_at: string;
  succeeded_at: string | null;
  age_seconds: number;
  message: string;
  detail: string | null;
  consecutive_failures: number;
  paused_until: string | null;
}

export interface RecordAttemptInput {
  sourceId: string;
  status: SourceStatus;
  message?: string;
  detail?: string;
  attemptedAt?: string;
  succeededAt?: string;
  ageSeconds?: number;
}

export class HealthManager {
  private db: Database.Database;

  constructor(database?: Database.Database) {
    this.db = database || getDb();
  }

  /**
   * Hämtar den allra senaste hälsoposten för en specifik källa.
   */
  getLatestRecord(sourceId: string): SourceHealthDbRow | null {
    const row = this.db
      .prepare(
        `SELECT * FROM source_health 
         WHERE source_id = ? 
         ORDER BY id DESC 
         LIMIT 1`
      )
      .get(sourceId) as SourceHealthDbRow | undefined;

    return row || null;
  }

  /**
   * Kontrollerar om källans kretsbrytare är aktiv (pausad i 30 minuter).
   */
  isCircuitBreakerActive(sourceId: string): boolean {
    const latest = this.getLatestRecord(sourceId);
    if (!latest || !latest.paused_until) {
      return false;
    }
    const pausedUntilTime = new Date(latest.paused_until).getTime();
    return pausedUntilTime > Date.now();
  }

  /**
   * Återställer kretsbrytaren och felräknaren för en källa.
   */
  resetCircuitBreaker(sourceId: string): void {
    const latest = this.getLatestRecord(sourceId);
    const now = new Date().toISOString();
    const succeededAt = latest?.succeeded_at || now;

    this.db
      .prepare(
        `INSERT INTO source_health (
          source_id, status, attempted_at, succeeded_at, age_seconds,
          message, detail, consecutive_failures, paused_until
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(sourceId, 'ok', now, succeededAt, 0, '', 'Kretsbrytare manuellt återställd', 0, null);
  }

  /**
   * Registrerar ett hämtförsök och uppdaterar kretsbrytarens tillstånd.
   */
  recordAttempt(input: RecordAttemptInput): SourceHealthRecord {
    const now = new Date().toISOString();
    const attemptedAt = input.attemptedAt || now;
    const latest = this.getLatestRecord(input.sourceId);

    let consecutiveFailures = latest ? latest.consecutive_failures : 0;
    let pausedUntil: string | null = null;
    let succeededAt = latest?.succeeded_at || null;

    if (input.status === 'failed') {
      consecutiveFailures += 1;
      // Circuit breaker: 5 raka fel -> paus i 30 minuter
      if (consecutiveFailures >= 5) {
        const pauseEnd = new Date(Date.now() + 30 * 60 * 1000);
        pausedUntil = pauseEnd.toISOString();
        logger.warn(
          `Kretsbrytare utlöst för källa ${input.sourceId}: 5 raka fel. Pausas till ${pausedUntil}`
        );
      }
    } else {
      // Vid ok eller degraded räknas anropet som ett fungerande anrop
      consecutiveFailures = 0;
      succeededAt = input.succeededAt || now;
      pausedUntil = null;
    }

    const ageSeconds =
      input.ageSeconds !== undefined
        ? input.ageSeconds
        : succeededAt
          ? Math.max(0, Math.floor((Date.now() - new Date(succeededAt).getTime()) / 1000))
          : 0;

    const message = input.message || (input.status === 'failed' ? 'Uppdateras inte just nu' : '');

    this.db
      .prepare(
        `INSERT INTO source_health (
          source_id, status, attempted_at, succeeded_at, age_seconds,
          message, detail, consecutive_failures, paused_until
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.sourceId,
        input.status,
        attemptedAt,
        succeededAt,
        ageSeconds,
        message,
        input.detail || null,
        consecutiveFailures,
        pausedUntil
      );

    return {
      sourceId: input.sourceId,
      label: input.sourceId,
      status: input.status,
      attemptedAt,
      succeededAt: succeededAt || undefined,
      ageSeconds,
      message,
      pausedUntil: pausedUntil || undefined,
    };
  }

  /**
   * Beräknar aktuell hälsa för en adapter utifrån dess senaste rad och konfiguration.
   */
  getSourceHealth(adapter: SourceAdapter<unknown>): SourceHealthRecord {
    const latest = this.getLatestRecord(adapter.id);
    const now = new Date().toISOString();

    if (!latest) {
      // Ingen hämtning gjord än
      return {
        sourceId: adapter.id,
        label: adapter.label,
        status: 'failed',
        attemptedAt: now,
        ageSeconds: 0,
        message: 'Den här uppgiften saknas just nu',
      };
    }

    const isPaused = latest.paused_until
      ? new Date(latest.paused_until).getTime() > Date.now()
      : false;

    const ageSeconds = latest.succeeded_at
      ? Math.max(0, Math.floor((Date.now() - new Date(latest.succeeded_at).getTime()) / 1000))
      : 999999;

    const resolved = resolveSourceStatus({
      reportedStatus: latest.status as SourceStatus,
      ageSeconds,
      ttlSeconds: adapter.ttlSeconds,
      staleAfterSeconds: adapter.staleAfterSeconds,
      isPaused,
      customMessage: latest.message,
    });

    return {
      sourceId: adapter.id,
      label: adapter.label,
      status: resolved.status,
      attemptedAt: latest.attempted_at,
      succeededAt: latest.succeeded_at || undefined,
      ageSeconds,
      message: resolved.message,
      pausedUntil: isPaused ? latest.paused_until || undefined : undefined,
    };
  }

  /**
   * Hämtar hälsostatus för en lista med adaptrar.
   */
  getAllSourcesHealth(adapters: SourceAdapter<unknown>[]): SourceHealthRecord[] {
    return adapters.map((adapter) => this.getSourceHealth(adapter));
  }
}
