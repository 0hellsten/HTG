import { logger } from '../lib/logger.js';
import { atgRacingInfoAdapter } from '../adapters/atg-racinginfo.js';
import { atgOddsAdapter } from '../adapters/atg-odds.js';
import { smhiWeatherAdapter } from '../adapters/smhi-weather.js';
import { tipsExpressenAdapter } from '../adapters/tips-expressen.js';
import { tipsTravrondenAdapter } from '../adapters/tips-travronden.js';
import { tipsAftonbladetAdapter } from '../adapters/tips-aftonbladet.js';
import { tipsSulkysportAdapter } from '../adapters/tips-sulkysport.js';
import { getDb } from '../db/connection.js';

export class StallbackenScheduler {
  private isRunning = false;
  private intervalTimer: NodeJS.Timeout | null = null;
  private isWarmingUp = false;

  start(): void {
    if (this.isRunning || process.env.NODE_ENV === 'test') return;
    this.isRunning = true;

    // Starta uppvärmning direkt i bakgrunden
    setTimeout(() => {
      this.warmup().catch((err) => logger.error('Fel under uppvärmning', err));
    }, 1000);

    // Schemalagd loop var 5:e minut
    this.intervalTimer = setInterval(() => {
      this.tick().catch((err) => logger.error('Fel i schemaläggare', err));
    }, 5 * 60 * 1000);
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

  async warmup(): Promise<void> {
    if (this.isWarmingUp) return;
    this.isWarmingUp = true;
    logger.info('Startar schemaläggarens uppvärmning av travdata...');

    try {
      const today = new Date();
      for (let offset = 0; offset <= 2; offset++) {
        const d = new Date(today.getTime() + offset * 86400000);
        const dateStr = d.toISOString().split('T')[0];
        await atgRacingInfoAdapter.fetchCalendar(dateStr, false);
      }

      await tipsExpressenAdapter.fetch();
      await tipsAftonbladetAdapter.fetch();
      await tipsTravrondenAdapter.fetch();
      await tipsSulkysportAdapter.fetch();

      const db = getDb();
      const activeTracks = db
        .prepare(
          `SELECT DISTINCT rd.track_id 
           FROM race_days rd 
           JOIN races r ON r.race_day_id = rd.id
           WHERE r.status = 'kommande'`
        )
        .all() as Array<{ track_id: string }>;

      for (const t of activeTracks.slice(0, 3)) {
        await smhiWeatherAdapter.fetch({ trackId: t.track_id } as any);
      }

      const upcomingRaces = db
        .prepare(
          `SELECT id FROM races 
           WHERE status = 'kommande' 
           ORDER BY scheduled_start ASC 
           LIMIT 5`
        )
        .all() as Array<{ id: string }>;

      for (const r of upcomingRaces) {
        await atgRacingInfoAdapter.fetchRace(r.id, false);
        await atgOddsAdapter.fetchOddsForRace(r.id, false);
      }

      logger.info('Uppvärmning slutförd med färsk travdata');
    } catch (err) {
      logger.warn('Uppvärmning avbröts eller fick delvis fel', err);
    } finally {
      this.isWarmingUp = false;
    }
  }

  async tick(): Promise<void> {
    if (this.isQuietHours()) {
      return;
    }

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
      logger.warn('Tick i schemaläggare avslutades med varning', err);
    }
  }
}

export const scheduler = new StallbackenScheduler();
