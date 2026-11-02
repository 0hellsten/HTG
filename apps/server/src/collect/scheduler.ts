import { logger } from '../lib/logger.js';
import { atgRacingInfoAdapter } from '../adapters/atg-racinginfo.js';
import { atgOddsAdapter } from '../adapters/atg-odds.js';
import { getDb } from '../db/connection.js';

export class StallbackenScheduler {
  private isRunning = false;
  private isTicking = false;
  private intervalTimer: NodeJS.Timeout | null = null;

  start(): void {
    if (this.isRunning || process.env.NODE_ENV === 'test') return;
    this.isRunning = true;

    this.intervalTimer = setInterval(
      () => {
        this.tick().catch((err) => logger.error('Fel i schemaläggare', err));
      },
      5 * 60 * 1000
    );
  }

  stop(): void {
    this.isRunning = false;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  private isQuietHours(): boolean {
    const stockholmHour = Number(
      new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Stockholm',
        hour: 'numeric',
        hour12: false,
      }).format(new Date())
    );
    return stockholmHour >= 1 && stockholmHour < 7;
  }

  async tick(): Promise<void> {
    if (this.isQuietHours() || this.isTicking) {
      return;
    }

    this.isTicking = true;
    try {
      await atgRacingInfoAdapter.fetchCalendar(undefined, false);

      const db = getDb();
      const nearStartRaces = db
        .prepare(
          `SELECT id, scheduled_start FROM races 
           WHERE status = 'kommande' 
           ORDER BY scheduled_start ASC 
           LIMIT 3`
        )
        .all() as Array<{ id: string; scheduled_start: string }>;

      for (const r of nearStartRaces) {
        await atgOddsAdapter.fetchOddsForRace(r.id, false);
      }
    } catch (err) {
      logger.warn('Tick i schemaläggare avslutades med varning', { error: String(err) });
    } finally {
      this.isTicking = false;
    }
  }
}

export const scheduler = new StallbackenScheduler();
