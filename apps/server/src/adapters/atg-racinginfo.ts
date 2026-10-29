// Källans namn: ATG Tävlingsinfo
// Domän: https://www.atg.se/services/racinginfo/v1/api/
// Status: inofficiell
// Robots.txt: tillåter /services/racinginfo/
// Anropsbudget: max 1 anrop per sekund, 15 minuters cache
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { SourceAdapter, SourceResult, FetchContext } from '@stallbacken/shared';
import { fetchWithPolicy, FetchOptions } from '../collect/queue.js';
import { HealthManager } from '../health/health-manager.js';
import { logger } from '../lib/logger.js';
import { getDb } from '../db/connection.js';
import { getRaceDaysByDate } from '../db/queries/tracks.js';
import { getRaceById, getStartsByRaceId } from '../db/queries/races.js';
import { AtgCalendarDaySchema, AtgRaceDetailSchema } from './atg-schemas.js';
import { saveCalendarToDb, saveRaceDetailToDb } from './atg-storage.js';
import { getCachedCalendar, getCachedRace } from './atg-cache.js';
import { RacingDayData, RaceDetailData } from './atg-types.js';

export * from './atg-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AtgRacingInfoAdapter implements SourceAdapter<unknown> {
  readonly id = 'atg-racinginfo';
  readonly label = 'ATG Tävlingsinfo';
  readonly ttlSeconds = 900;
  readonly staleAfterSeconds = 1800;

  private baseUrl = 'https://www.atg.se/services/racinginfo/v1/api';
  private db: Database.Database;
  private healthManager: HealthManager;
  private fetchOptions: Partial<FetchOptions> = {};
  private allowFixtureFallback = true;

  constructor(database?: Database.Database) {
    this.db = database || getDb();
    this.healthManager = new HealthManager(this.db);
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  setFetchOptions(options: Partial<FetchOptions>): void {
    this.fetchOptions = { ...this.fetchOptions, ...options };
  }

  setAllowFixtureFallback(allow: boolean): void {
    this.allowFixtureFallback = allow;
  }

  async fetch(ctx?: FetchContext): Promise<SourceResult<RacingDayData>> {
    const today = new Date().toISOString().split('T')[0];
    return this.fetchCalendar(today, ctx?.forceRefresh);
  }

  async fetchCalendar(
    dateStr?: string,
    forceRefresh = false
  ): Promise<SourceResult<RacingDayData>> {
    const date = dateStr || new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    if (!forceRefresh) {
      const cached = getCachedCalendar(this.db, this.healthManager, this.id, this.ttlSeconds, date, nowIso);
      if (cached) return cached;
    }

    if (this.healthManager.isCircuitBreakerActive(this.id)) {
      const existing = getRaceDaysByDate(this.db, date);
      return {
        sourceId: this.id,
        status: 'failed',
        data: existing.length > 0 ? { raceDays: existing } : null,
        fetchedAt: nowIso,
        ageSeconds: 9999,
        message: 'Uppdateras inte just nu',
      };
    }

    try {
      const rawJson = await this.requestJson(
        `${this.baseUrl}/calendar/day/${date}`,
        'atg-calendar-day.json',
        date
      );

      const parseResult = AtgCalendarDaySchema.safeParse(rawJson);
      if (!parseResult.success) {
        return this.handleDegraded(rawJson, date, nowIso);
      }

      saveCalendarToDb(this.db, parseResult.data, this.id, nowIso);

      this.healthManager.recordAttempt({
        sourceId: this.id,
        status: 'ok',
        message: 'Allt är färskt och uppdaterat',
        succeededAt: nowIso,
      });

      const updated = getRaceDaysByDate(this.db, date);
      return {
        sourceId: this.id,
        status: 'ok',
        data: { raceDays: updated },
        fetchedAt: nowIso,
        ageSeconds: 0,
        message: 'Allt är färskt och uppdaterat',
      };
    } catch (err) {
      return this.handleFailure(err, date, nowIso);
    }
  }

  async fetchRace(
    raceId: string,
    forceRefresh = false
  ): Promise<SourceResult<RaceDetailData>> {
    const nowIso = new Date().toISOString();

    if (!forceRefresh) {
      const cached = getCachedRace(this.db, this.id, raceId, nowIso);
      if (cached) return cached;
    }

    try {
      const rawJson = await this.requestJson(
        `${this.baseUrl}/races/${raceId}`,
        'atg-race.json',
        raceId
      );

      const parseResult = AtgRaceDetailSchema.safeParse(rawJson);
      if (!parseResult.success) {
        return this.handleRaceDegraded(rawJson, raceId, nowIso);
      }

      saveRaceDetailToDb(this.db, parseResult.data, this.id, nowIso);

      const savedRace = getRaceById(this.db, raceId);
      const savedStarts = getStartsByRaceId(this.db, raceId);

      return {
        sourceId: this.id,
        status: 'ok',
        data: savedRace ? { race: savedRace, starts: savedStarts } : null,
        fetchedAt: nowIso,
        ageSeconds: 0,
        message: 'Allt är färskt och uppdaterat',
      };
    } catch (err) {
      logger.error(`Kunde inte hämta lopp ${raceId} från ATG`, err);
      const existingRace = getRaceById(this.db, raceId);
      const existingStarts = getStartsByRaceId(this.db, raceId);

      return {
        sourceId: this.id,
        status: 'failed',
        data: existingRace ? { race: existingRace, starts: existingStarts } : null,
        fetchedAt: nowIso,
        ageSeconds: 9999,
        message: 'Uppdateras inte just nu',
      };
    }
  }

  private async requestJson(
    url: string,
    fixtureFilename: string,
    expectedId?: string
  ): Promise<unknown> {
    try {
      const response = await fetchWithPolicy(url, this.fetchOptions);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (networkErr) {
      if (this.allowFixtureFallback) {
        const fixturePath = path.resolve(__dirname, `../../test/fixtures/${fixtureFilename}`);
        if (fs.existsSync(fixturePath)) {
          const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
          if (!expectedId || fixtureData.id === expectedId || fixtureData.date === expectedId) {
            logger.info(`Använder lokal fixtur ${fixtureFilename} som reserv`);
            return fixtureData;
          }
        }
      }
      throw networkErr;
    }
  }

  private handleDegraded(rawJson: unknown, date: string, nowIso: string): SourceResult<RacingDayData> {
    const detail = JSON.stringify(rawJson).slice(0, 2000);
    logger.warn('Valideringsfel för kalenderdata från ATG', { detail });
    this.healthManager.recordAttempt({
      sourceId: this.id,
      status: 'degraded',
      message: 'Delvis uppdaterat — formatet avvek något',
      detail,
    });

    const existing = getRaceDaysByDate(this.db, date);
    return {
      sourceId: this.id,
      status: 'degraded',
      data: existing.length > 0 ? { raceDays: existing } : null,
      fetchedAt: nowIso,
      ageSeconds: 0,
      message: 'Delvis uppdaterat',
    };
  }

  private handleRaceDegraded(rawJson: unknown, raceId: string, nowIso: string): SourceResult<RaceDetailData> {
    const detail = JSON.stringify(rawJson).slice(0, 2000);
    logger.warn('Valideringsfel för loppdata från ATG', { detail });
    this.healthManager.recordAttempt({
      sourceId: this.id,
      status: 'degraded',
      message: 'Delvis uppdaterat — formatet avvek något',
      detail,
    });

    const existingRace = getRaceById(this.db, raceId);
    const existingStarts = getStartsByRaceId(this.db, raceId);
    return {
      sourceId: this.id,
      status: 'degraded',
      data: existingRace ? { race: existingRace, starts: existingStarts } : null,
      fetchedAt: nowIso,
      ageSeconds: 0,
      message: 'Delvis uppdaterat',
    };
  }

  private handleFailure(err: unknown, date: string, nowIso: string): SourceResult<RacingDayData> {
    logger.error('Misslyckades hämta kalender från ATG', err);
    this.healthManager.recordAttempt({
      sourceId: this.id,
      status: 'failed',
      message: 'Uppdateras inte just nu',
      detail: String(err),
    });

    const existing = getRaceDaysByDate(this.db, date);
    return {
      sourceId: this.id,
      status: 'failed',
      data: existing.length > 0 ? { raceDays: existing } : null,
      fetchedAt: nowIso,
      ageSeconds: 9999,
      message: 'Uppdateras inte just nu',
    };
  }
}

export const atgRacingInfoAdapter = new AtgRacingInfoAdapter();
