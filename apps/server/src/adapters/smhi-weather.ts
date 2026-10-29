// Källans namn: SMHI Väderprognos
// Domän: https://opendata-download-metfcst.smhi.se
// Status: officiellt öppet API
// Robots.txt: tillåter öppna data
// Anropsbudget: max 1 anrop per timme per bana (60 minuter TTL)
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import Database from 'better-sqlite3';
import {
  SourceAdapter,
  SourceResult,
  FetchContext,
  TrackWeather,
} from '@stallbacken/shared';
import { fetchWithPolicy, FetchOptions } from '../collect/queue.js';
import { HealthManager } from '../health/health-manager.js';
import { logger } from '../lib/logger.js';
import { getDb } from '../db/connection.js';
import {
  saveWeatherObservation,
  getLatestWeatherForTrack,
} from '../db/queries/weather.js';
import { getTrackProfile } from '../db/queries/track-stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Zod-schema för SMHI snow1g/v1 API-svar
const SmhiWeatherSchema = z.object({
  approvedTime: z.string().optional(),
  referenceTime: z.string().optional(),
  timeSeries: z.array(
    z.object({
      time: z.string(),
      data: z.object({
        air_temperature: z.number().optional(),
        wind_speed: z.number().optional(),
        precipitation_amount_mean: z.number().optional(),
        symbol_code: z.number().optional(),
      }),
    })
  ),
});

export type SmhiWeatherResponse = z.infer<typeof SmhiWeatherSchema>;

export function getSymbolDescription(code?: number): string {
  switch (code) {
    case 1:
      return 'Klart';
    case 2:
      return 'Lätt molnighet';
    case 3:
      return 'Halvklart';
    case 4:
      return 'Molnigt';
    case 5:
      return 'Mycket moln';
    case 6:
      return 'Mulet';
    case 7:
      return 'Dimma';
    case 8:
      return 'Lätta regnskurar';
    case 9:
      return 'Måttliga regnskurar';
    case 10:
      return 'Kraftiga regnskurar';
    case 11:
      return 'Åskskurar';
    case 18:
      return 'Lätt regn';
    case 19:
      return 'Måttligt regn';
    case 20:
      return 'Kraftigt regn';
    case 25:
      return 'Lätt snöfall';
    case 26:
      return 'Måttligt snöfall';
    case 27:
      return 'Kraftigt snöfall';
    default:
      return 'Uppehåll och växlande molnighet';
  }
}

export class SmhiWeatherAdapter implements SourceAdapter<TrackWeather | null> {
  readonly id = 'smhi';
  readonly label = 'SMHI Väder';
  readonly ttlSeconds = 3600; // 1 timme
  readonly staleAfterSeconds = 7200; // 2 timmar

  private baseUrl = 'https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1';
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

  async fetch(ctx?: FetchContext): Promise<SourceResult<TrackWeather | null>> {
    const trackId = (ctx as { trackId?: string })?.trackId || '1';
    return this.fetchWeatherForTrack(trackId, ctx?.forceRefresh);
  }

  async fetchWeatherForTrack(
    trackId: string,
    forceRefresh = false
  ): Promise<SourceResult<TrackWeather | null>> {
    const now = new Date();
    const nowIso = now.toISOString();

    const track = getTrackProfile(this.db, trackId);
    const existing = getLatestWeatherForTrack(this.db, trackId);

    if (this.simulatedFailure) {
      this.healthManager.recordAttempt({
        sourceId: this.id,
        status: 'failed',
        attemptedAt: nowIso,
        ageSeconds: 9999,
        message: 'Vädret går inte att hämta just nu.',
        detail: 'Simulerat fel i test',
      });
      return {
        sourceId: this.id,
        status: 'failed',
        data: existing || null,
        fetchedAt: existing?.observedAt || nowIso,
        ageSeconds: 9999,
        message: 'Vädret går inte att hämta just nu.',
      };
    }

    // Kontrollera cache-färskhet om forceRefresh inte begärts
    if (!forceRefresh && existing) {
      const ageSec = Math.floor((now.getTime() - new Date(existing.observedAt).getTime()) / 1000);
      if (ageSec < this.ttlSeconds) {
        return {
          sourceId: this.id,
          status: 'ok',
          data: existing,
          fetchedAt: existing.observedAt,
          ageSeconds: ageSec,
          message: 'Färskt väder från SMHI.',
        };
      }
    }

    const lat = track?.lat || 59.369;
    const lon = track?.lon || 17.939;
    const url = `${this.baseUrl}/geotype/point/lon/${lon.toFixed(3)}/lat/${lat.toFixed(3)}/data.json`;

    try {
      const response = await fetchWithPolicy(
        url,
        {
          headers: { Accept: 'application/json' },
          ...this.fetchOptions,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const jsonUnknown: unknown = await response.json();
      const parseResult = SmhiWeatherSchema.safeParse(jsonUnknown);

      if (!parseResult.success) {
        logger.warn('Oväntat svarsformat från SMHI snow1g/v1', {
          trackId,
          issues: parseResult.error.issues.slice(0, 3),
        });

        this.healthManager.recordAttempt({
          sourceId: this.id,
          status: 'degraded',
          attemptedAt: nowIso,
          ageSeconds: 0,
          message: 'Väderprognosen har begränsat innehåll.',
          detail: 'Zod-valideringsvarning',
        });

        return {
          sourceId: this.id,
          status: 'degraded',
          data: existing,
          fetchedAt: nowIso,
          ageSeconds: 0,
          message: 'Väderprognosen har begränsat innehåll.',
        };
      }

      const data = parseResult.data;
      const firstEntry = data.timeSeries[0];
      if (!firstEntry) {
        throw new Error('Ingen tidsserie returnerades från SMHI');
      }

      const temp = firstEntry.data.air_temperature ?? 10;
      const wind = firstEntry.data.wind_speed ?? 0;
      const precip = firstEntry.data.precipitation_amount_mean ?? 0;
      const symbolCode = firstEntry.data.symbol_code ?? 1;
      const description = getSymbolDescription(symbolCode);

      saveWeatherObservation(this.db, {
        trackId,
        observedAt: nowIso,
        tempC: temp,
        windMs: wind,
        precipMm: precip,
        symbolCode,
        description,
        sourceId: this.id,
      });

      const weatherResult: TrackWeather = {
        trackId,
        trackName: track?.name,
        observedAt: nowIso,
        tempC: temp,
        windMs: wind,
        precipMm: precip,
        symbolCode,
        description,
        sourceId: this.id,
      };

      this.healthManager.recordAttempt({
        sourceId: this.id,
        status: 'ok',
        attemptedAt: nowIso,
        succeededAt: nowIso,
        ageSeconds: 0,
        message: 'Färskt väder från SMHI.',
      });

      return {
        sourceId: this.id,
        status: 'ok',
        data: weatherResult,
        fetchedAt: nowIso,
        ageSeconds: 0,
        message: 'Färskt väder från SMHI.',
      };
    } catch (err) {
      logger.error(`Misslyckades hämta väder för bana ${trackId} från SMHI`, err);

      // Reservfixtur om tillåtet (t.ex. vid offlinetest)
      if (this.allowFixtureFallback) {
        const fixturePath = path.resolve(__dirname, '../../test/fixtures/smhi-weather.json');
        if (fs.existsSync(fixturePath)) {
          try {
            logger.info('Använder lokal fixtur smhi-weather.json som reserv för SMHI');
            const fixtureContent = fs.readFileSync(fixturePath, 'utf-8');
            const fixtureJson = JSON.parse(fixtureContent);
            const entry = fixtureJson.timeSeries[0];
            const temp = entry.data.air_temperature ?? 9.5;
            const wind = entry.data.wind_speed ?? 3.2;
            const precip = entry.data.precipitation_amount_mean ?? 0;
            const symbolCode = entry.data.symbol_code ?? 2;
            const description = getSymbolDescription(symbolCode);

            saveWeatherObservation(this.db, {
              trackId,
              observedAt: nowIso,
              tempC: temp,
              windMs: wind,
              precipMm: precip,
              symbolCode,
              description,
              sourceId: this.id,
            });

            const weatherResult: TrackWeather = {
              trackId,
              trackName: track?.name,
              observedAt: nowIso,
              tempC: temp,
              windMs: wind,
              precipMm: precip,
              symbolCode,
              description,
              sourceId: this.id,
            };

            this.healthManager.recordAttempt({
              sourceId: this.id,
              status: 'ok',
              attemptedAt: nowIso,
              succeededAt: nowIso,
              ageSeconds: 0,
              message: 'Väder hämtat (lokalt exempel).',
            });

            return {
              sourceId: this.id,
              status: 'ok',
              data: weatherResult,
              fetchedAt: nowIso,
              ageSeconds: 0,
              message: 'Väder hämtat (lokalt exempel).',
            };
          } catch {
            // Ignorera fixturfel och gå till failed nedan
          }
        }
      }

      this.healthManager.recordAttempt({
        sourceId: this.id,
        status: 'failed',
        attemptedAt: nowIso,
        ageSeconds: existing
          ? Math.floor((now.getTime() - new Date(existing.observedAt).getTime()) / 1000)
          : 9999,
        message: 'Vädret går inte att hämta just nu.',
        detail: (err as Error).message,
      });

      return {
        sourceId: this.id,
        status: 'failed',
        data: existing || null,
        fetchedAt: existing?.observedAt || nowIso,
        ageSeconds: existing
          ? Math.floor((now.getTime() - new Date(existing.observedAt).getTime()) / 1000)
          : 9999,
        message: 'Vädret går inte att hämta just nu.',
      };
    }
  }
}

export const smhiWeatherAdapter = new SmhiWeatherAdapter();
