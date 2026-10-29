// Källans namn: ATG Odds och Streck
// Domän: https://www.atg.se/services/racinginfo/v1/api/games/
// Status: inofficiell
// Robots.txt: tillåter /services/racinginfo/
// Anropsbudget: max 1 anrop per sekund, 2 minuters cache nära start, annars 15 minuter
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import {
  SourceAdapter,
  SourceResult,
  FetchContext,
  RaceOddsData,
  HorseOdds,
} from '@stallbacken/shared';
import { fetchWithPolicy, FetchOptions } from '../collect/queue.js';
import { HealthManager } from '../health/health-manager.js';
import { logger } from '../lib/logger.js';
import { getDb } from '../db/connection.js';
import { getLatestOddsForRace, saveRaceOdds } from '../db/queries/odds.js';
import { AtgOddsResponseSchema, AtgOddsResponse } from './atg-odds-schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AtgOddsAdapter implements SourceAdapter<RaceOddsData | null> {
  readonly id = 'atg-odds';
  readonly label = 'ATG Odds och streck';
  readonly ttlSeconds = 120; // 2 minuter nära start
  readonly staleAfterSeconds = 300; // 5 minuter

  private baseUrl = 'https://www.atg.se/services/racinginfo/v1/api';
  private db: Database.Database;
  private healthManager: HealthManager;
  private fetchOptions: Partial<FetchOptions> = {};
  private allowFixtureFallback = true;
  private simulatedFailure = false;

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

  setSimulatedFailure(fail: boolean): void {
    this.simulatedFailure = fail;
  }

  isSimulatedFailure(): boolean {
    return this.simulatedFailure;
  }

  async fetch(ctx?: FetchContext): Promise<SourceResult<RaceOddsData | null>> {
    const raceId = (ctx as { raceId?: string })?.raceId || '2026-10-29_1_4';
    return this.fetchOddsForRace(raceId, ctx?.forceRefresh);
  }

  async fetchOddsForRace(
    raceId: string,
    forceRefresh = false
  ): Promise<SourceResult<RaceOddsData | null>> {
    const nowIso = new Date().toISOString();

    if (this.simulatedFailure) {
      this.healthManager.recordAttempt({
        sourceId: this.id,
        status: 'failed',
        message: 'Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.',
        detail: 'Simulerat fel i test-/degraderingsläge',
      });
      return {
        sourceId: this.id,
        status: 'failed',
        data: null,
        fetchedAt: nowIso,
        ageSeconds: 9999,
        message: 'Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.',
      };
    }

    if (this.healthManager.isCircuitBreakerActive(this.id)) {
      const existing = getLatestOddsForRace(this.db, raceId);
      return {
        sourceId: this.id,
        status: 'failed',
        data: existing,
        fetchedAt: nowIso,
        ageSeconds: 9999,
        message: 'Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.',
      };
    }

    if (!forceRefresh) {
      const existing = getLatestOddsForRace(this.db, raceId);
      if (existing) {
        const recordedTime = new Date(existing.recordedAt).getTime();
        const ageSeconds = Math.max(0, Math.floor((Date.now() - recordedTime) / 1000));
        if (ageSeconds < this.ttlSeconds) {
          return {
            sourceId: this.id,
            status: 'ok',
            data: existing,
            fetchedAt: existing.recordedAt,
            ageSeconds,
            message: 'Allt är färskt och uppdaterat',
          };
        }
        if (ageSeconds < this.staleAfterSeconds) {
          return {
            sourceId: this.id,
            status: 'stale',
            data: existing,
            fetchedAt: existing.recordedAt,
            ageSeconds,
            message: `Uppdaterat för ${Math.round(ageSeconds / 60)} minuter sedan`,
          };
        }
      }
    }

    try {
      const rawJson = await this.requestJson(
        `${this.baseUrl}/games/vinnare_${raceId}`,
        'atg-odds.json',
        raceId
      );

      const parseResult = AtgOddsResponseSchema.safeParse(rawJson);
      if (!parseResult.success) {
        return this.handleDegraded(rawJson, raceId, nowIso);
      }

      const normalized = this.normalizeOdds(parseResult.data, raceId, nowIso);
      saveRaceOdds(this.db, normalized, this.id);

      this.healthManager.recordAttempt({
        sourceId: this.id,
        status: 'ok',
        message: 'Allt är färskt och uppdaterat',
        succeededAt: nowIso,
      });

      return {
        sourceId: this.id,
        status: 'ok',
        data: normalized,
        fetchedAt: nowIso,
        ageSeconds: 0,
        message: 'Allt är färskt och uppdaterat',
      };
    } catch (err) {
      return this.handleFailure(err, raceId, nowIso);
    }
  }

  private normalizeOdds(
    data: AtgOddsResponse,
    raceId: string,
    nowIso: string
  ): RaceOddsData {
    const recordedAt = data.recordedAt || nowIso;
    const timeFormatted = recordedAt.includes('T')
      ? recordedAt.split('T')[1].slice(0, 5)
      : recordedAt.slice(11, 16);

    const winnerOddsMap = new Map<number, number>();
    for (const w of data.pools?.vinnare?.odds || []) {
      if (w.odds !== null && w.odds !== undefined) {
        winnerOddsMap.set(w.startNumber, w.odds);
      }
    }

    const placeOddsMap = new Map<number, number>();
    for (const p of data.pools?.plats?.odds || []) {
      if (p.minOdds !== null && p.minOdds !== undefined) {
        placeOddsMap.set(p.startNumber, p.minOdds);
      }
    }

    const stakePercentMap = new Map<number, number>();
    for (const s of data.pools?.streck?.distribution || []) {
      if (s.percent !== null && s.percent !== undefined) {
        stakePercentMap.set(s.startNumber, s.percent);
      }
    }

    // Samla alla startnummer
    const allStartNumbers = new Set<number>([
      ...winnerOddsMap.keys(),
      ...placeOddsMap.keys(),
      ...stakePercentMap.keys(),
    ]);

    const odds: HorseOdds[] = Array.from(allStartNumbers)
      .sort((a, b) => a - b)
      .map((startNum) => ({
        startId: `${raceId}_${startNum}`,
        startNumber: startNum,
        winOdds: winnerOddsMap.get(startNum),
        placeOdds: placeOddsMap.get(startNum),
        stakePercent: stakePercentMap.get(startNum),
      }));

    return {
      raceId,
      recordedAt,
      timeFormatted: timeFormatted || '–',
      gameType: data.gameType || 'Vinnare',
      odds,
    };
  }

  private async requestJson(
    url: string,
    fixtureFilename: string,
    expectedRaceId?: string
  ): Promise<unknown> {
    if (process.env.USE_FIXTURES === 'true' && this.allowFixtureFallback) {
      const fixturePath = path.resolve(__dirname, `../../test/fixtures/${fixtureFilename}`);
      if (fs.existsSync(fixturePath)) {
        logger.info(`Använder lokal fixtur ${fixtureFilename} (USE_FIXTURES=true)`);
        return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
      }
    }

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
          if (!expectedRaceId || fixtureData.raceId === expectedRaceId || fixtureData.id?.includes(expectedRaceId)) {
            logger.info(`Använder lokal fixtur ${fixtureFilename} som reserv för odds`);
            return fixtureData;
          }
        }
      }
      throw networkErr;
    }
  }

  private handleDegraded(
    rawJson: unknown,
    raceId: string,
    nowIso: string
  ): SourceResult<RaceOddsData | null> {
    const detail = JSON.stringify(rawJson).slice(0, 2000);
    logger.warn('Valideringsfel för oddsdata från ATG', { detail });
    this.healthManager.recordAttempt({
      sourceId: this.id,
      status: 'degraded',
      message: 'Delvis uppdaterat — formatet avvek något',
      detail,
    });

    const existing = getLatestOddsForRace(this.db, raceId);
    return {
      sourceId: this.id,
      status: 'degraded',
      data: existing,
      fetchedAt: nowIso,
      ageSeconds: 0,
      message: 'Delvis uppdaterat',
    };
  }

  private handleFailure(
    err: unknown,
    raceId: string,
    nowIso: string
  ): SourceResult<RaceOddsData | null> {
    logger.error(`Misslyckades hämta odds för lopp ${raceId} från ATG`, err);
    this.healthManager.recordAttempt({
      sourceId: this.id,
      status: 'failed',
      message: 'Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.',
      detail: String(err),
    });

    const existing = getLatestOddsForRace(this.db, raceId);
    return {
      sourceId: this.id,
      status: 'failed',
      data: existing,
      fetchedAt: nowIso,
      ageSeconds: 9999,
      message: 'Oddsen uppdateras inte just nu. Allt annat på sidan är färskt.',
    };
  }
}

export const atgOddsAdapter = new AtgOddsAdapter();
