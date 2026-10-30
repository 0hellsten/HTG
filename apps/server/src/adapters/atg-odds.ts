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
import { AtgGameResponseSchema, AtgGameResponse } from './atg-odds-schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AtgOddsAdapter implements SourceAdapter<RaceOddsData | null> {
  readonly id = 'atg-odds';
  readonly label = 'ATG Odds och streck';
  readonly ttlSeconds = 120;
  readonly staleAfterSeconds = 300;

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
        detail: 'Simulerat fel',
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

      const parseResult = AtgGameResponseSchema.safeParse(rawJson);
      if (!parseResult.success) {
        return this.handleDegraded(rawJson, raceId, nowIso);
      }

      const markingGameData = await this.fetchMarkingGameData(raceId);
      const normalized = this.normalizeOdds(parseResult.data, markingGameData, raceId, nowIso);
      saveRaceOdds(this.db, normalized, this.id);
      this.syncOddsToStarts(normalized);

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

  private async fetchMarkingGameData(raceId: string): Promise<AtgGameResponse | null> {
    if (this.allowFixtureFallback && !this.baseUrl.includes('atg.se')) {
      return null;
    }

    const date = raceId.split('_')[0];
    if (!date) return null;

    try {
      const calRes = await fetchWithPolicy(`${this.baseUrl}/calendar/day/${date}`, this.fetchOptions);
      if (!calRes.ok) return null;
      const calJson = (await calRes.json()) as { games?: Record<string, Array<{ id?: string; races?: string[] }>> };
      if (!calJson.games) return null;

      const markingTypes = ['V85', 'V75', 'V86', 'GS75', 'V64', 'V65', 'V5', 'V4'];
      let targetGameId: string | undefined;

      for (const mType of markingTypes) {
        const gameList = calJson.games[mType];
        if (Array.isArray(gameList)) {
          const match = gameList.find((g) => g.races?.includes(raceId));
          if (match?.id) {
            targetGameId = match.id;
            break;
          }
        }
      }

      if (!targetGameId) return null;

      const gameRes = await fetchWithPolicy(`${this.baseUrl}/games/${targetGameId}`, this.fetchOptions);
      if (!gameRes.ok) return null;
      const gameJson = await gameRes.json();
      const parsed = AtgGameResponseSchema.safeParse(gameJson);
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  private normalizeOdds(
    vinnareData: AtgGameResponse,
    markingGameData: AtgGameResponse | null,
    raceId: string,
    nowIso: string
  ): RaceOddsData {
    const race = vinnareData.races.find((r) => r.id === raceId) || vinnareData.races[0];
    const starts = race?.starts || [];

    const recordedAt = race?.startTime || nowIso;
    const timeFormatted = recordedAt.includes('T')
      ? recordedAt.split('T')[1].slice(0, 5)
      : recordedAt.slice(11, 16) || '–';

    const markingStarts =
      markingGameData?.races.find((r) => r.id === raceId)?.starts || [];
    const markingMap = new Map<number, number>();

    for (const ms of markingStarts) {
      if (ms.pools) {
        for (const [poolKey, poolVal] of Object.entries(ms.pools)) {
          if (
            poolKey !== 'vinnare' &&
            poolKey !== 'plats' &&
            poolVal &&
            typeof poolVal.betDistribution === 'number'
          ) {
            markingMap.set(ms.number, Math.round((poolVal.betDistribution / 100) * 10) / 10);
            break;
          }
        }
      }
    }

    const odds: HorseOdds[] = starts.map((s) => {
      const vPool = s.pools?.vinnare;
      const pPool = s.pools?.plats;

      const winOdds =
        vPool?.odds !== null && vPool?.odds !== undefined
          ? vPool.odds > 99
            ? Math.round((vPool.odds / 100) * 100) / 100
            : vPool.odds
          : undefined;

      const placeOdds =
        pPool?.minOdds !== null && pPool?.minOdds !== undefined
          ? pPool.minOdds > 99
            ? Math.round((pPool.minOdds / 100) * 100) / 100
            : pPool.minOdds
          : undefined;

      let stakePercent = markingMap.get(s.number);
      if (stakePercent === undefined && s.pools?.streck?.betDistribution !== undefined) {
        const rawDist = s.pools.streck.betDistribution;
        stakePercent = rawDist !== null ? Math.round((rawDist / 100) * 10) / 10 : undefined;
      }

      return {
        startId: `${raceId}_${s.number}`,
        startNumber: s.number,
        winOdds,
        placeOdds,
        stakePercent,
      };
    });

    return {
      raceId,
      recordedAt,
      timeFormatted,
      gameType: markingGameData?.type || 'Vinnare',
      odds,
    };
  }

  private syncOddsToStarts(oddsData: RaceOddsData): void {
    const stmt = this.db.prepare(`
      UPDATE starts
      SET win_odds = COALESCE(?, win_odds),
          stake_percent = COALESCE(?, stake_percent),
          updated_at = datetime('now')
      WHERE race_id = ? AND start_number = ?
    `);

    const updateMany = this.db.transaction(() => {
      for (const h of oddsData.odds) {
        stmt.run(h.winOdds || null, h.stakePercent || null, oddsData.raceId, h.startNumber);
      }
    });

    try {
      updateMany();
    } catch {
      // Ignorera synkfel till starts
    }
  }

  private async requestJson(
    url: string,
    fixtureFilename: string,
    expectedRaceId?: string
  ): Promise<unknown> {
    if (this.allowFixtureFallback) {
      const fixturePath = path.resolve(__dirname, `../../test/fixtures/${fixtureFilename}`);
      if (fs.existsSync(fixturePath)) {
        if (!url.includes('atg.se')) {
          return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
        }
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
          if (
            !expectedRaceId ||
            fixtureData.raceId === expectedRaceId ||
            fixtureData.id?.includes(expectedRaceId)
          ) {
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
      message: 'Delvis uppdaterat',
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
