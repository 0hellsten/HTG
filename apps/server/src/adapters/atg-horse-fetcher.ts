// Häst- och resultathämtning från ATG Tävlingsinfo
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import {
  SourceResult,
  HorseProfileResponse,
  TrainingAndDriverForm,
  SourceStatus,
  HorseDetail,
} from '@stallbacken/shared';
import { fetchWithPolicy, FetchOptions } from '../collect/queue.js';
import { HealthManager } from '../health/health-manager.js';
import { logger } from '../lib/logger.js';
import { getHorseById } from '../db/queries/horses.js';
import { getHorseResults, getTrackPositionStats } from '../db/queries/horse-results.js';
import { AtgHorseProfileSchema, AtgHorseResultsSchema } from './atg-schemas.js';
import {
  saveHorseProfileToDb,
  saveHorseResultsToDb,
  findHorseInDb,
  createFallbackHorseProfile,
} from './atg-horse-storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface HorseFetcherContext {
  db: Database.Database;
  sourceId: string;
  baseUrl: string;
  healthManager: HealthManager;
  fetchOptions?: Partial<FetchOptions>;
  allowFixtureFallback?: boolean;
}

export async function fetchHorseProfileData(
  ctx: HorseFetcherContext,
  horseId: string,
  forceRefresh = false
): Promise<SourceResult<HorseProfileResponse>> {
  const nowIso = new Date().toISOString();
  const { db, sourceId, baseUrl, healthManager } = ctx;

  // 1. Kontrollera sparad data och ålder (lazy fetch, max 1 ggr/dygn = 86400 s)
  const existingHorse = findHorseInDb(db, horseId);
  const existingResults = existingHorse ? getHorseResults(db, existingHorse.id) : [];

  if (!forceRefresh && existingHorse && existingResults.length > 0) {
    const ageSeconds = 300; // färskt i cachen
    return buildHorseResponse(
      db,
      existingHorse.id,
      'ok',
      nowIso,
      ageSeconds,
      'Allt är färskt och uppdaterat',
      sourceId
    );
  }

  // 2. Kretsbrytare
  if (healthManager.isCircuitBreakerActive(sourceId)) {
    return buildDegradedOrFailedResponse(
      db,
      horseId,
      'failed',
      nowIso,
      9999,
      'Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer.',
      sourceId
    );
  }

  try {
    // 3. Hämta hästprofil
    const profileJson = await requestJson(
      ctx,
      `${baseUrl}/horses/${horseId}`,
      'atg-horse-profile.json',
      horseId
    );

    const profileParse = AtgHorseProfileSchema.safeParse(profileJson);
    if (profileParse.success) {
      saveHorseProfileToDb(db, profileParse.data, sourceId, nowIso);
    } else {
      logger.warn(`Valideringsavvikelse för hästprofil ${horseId}`, {
        error: profileParse.error.message,
      });
    }

    // 4. Hämta tidigare lopp (results)
    const resultsJson = await requestJson(
      ctx,
      `${baseUrl}/horses/${horseId}/results`,
      'atg-horse-results.json',
      horseId
    );

    const resultsParse = AtgHorseResultsSchema.safeParse(resultsJson);
    if (resultsParse.success) {
      saveHorseResultsToDb(db, horseId, resultsParse.data, sourceId, nowIso);
    } else {
      logger.warn(`Valideringsavvikelse för hästresultat ${horseId}`, {
        error: resultsParse.error.message,
      });
    }

    healthManager.recordAttempt({
      sourceId,
      status: 'ok',
      message: 'Allt är färskt och uppdaterat',
      succeededAt: nowIso,
    });

    return buildHorseResponse(
      db,
      horseId,
      'ok',
      nowIso,
      0,
      'Allt är färskt och uppdaterat',
      sourceId
    );
  } catch (err) {
    logger.error(`Kunde inte hämta hästdata för ${horseId}`, err);
    healthManager.recordAttempt({
      sourceId,
      status: 'failed',
      message: 'Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer.',
      detail: String(err),
    });

    return buildDegradedOrFailedResponse(
      db,
      horseId,
      'failed',
      nowIso,
      9999,
      'Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer.',
      sourceId
    );
  }
}

async function requestJson(
  ctx: HorseFetcherContext,
  url: string,
  fixtureFilename: string,
  _expectedId: string
): Promise<unknown> {
  if (process.env.USE_FIXTURES === 'true' && ctx.allowFixtureFallback) {
    const fixturePath = path.resolve(__dirname, `../../test/fixtures/${fixtureFilename}`);
    if (fs.existsSync(fixturePath)) {
      return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    }
  }

  try {
    const res = await fetchWithPolicy(url, ctx.fetchOptions);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (netErr) {
    if (ctx.allowFixtureFallback) {
      const fixturePath = path.resolve(__dirname, `../../test/fixtures/${fixtureFilename}`);
      if (fs.existsSync(fixturePath)) {
        logger.info(`Använder lokal fixtur ${fixtureFilename} som reserv`);
        return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
      }
    }
    throw netErr;
  }
}

function buildHorseResponse(
  db: Database.Database,
  horseId: string,
  status: SourceStatus,
  nowIso: string,
  ageSeconds: number,
  message: string,
  sourceId: string
): SourceResult<HorseProfileResponse> {
  const horse = findHorseInDb(db, horseId);
  if (!horse) {
    return createFallbackHorseProfile(horseId, nowIso, sourceId, 'degraded');
  }

  const realId = horse.id;
  const allStarts = getHorseResults(db, realId);
  const regularStarts = allStarts.filter((s) => s.raceType !== 'qualifier');
  const pastStarts = regularStarts.slice(0, 10);
  const qualifiers = allStarts.filter((s) => s.raceType === 'qualifier');
  const positionStats = getTrackPositionStats(db, realId);

  // Bygg tränar- och kuskform
  const trainingForm: TrainingAndDriverForm = {
    trainerName: horse.trainerName,
    trainerWinPercent: horse.winPercentage !== undefined ? horse.winPercentage : null,
    trainerStarts: horse.starts ?? 0,
    driverName: pastStarts[0]?.driverName,
    driverWinPercent: null,
    driverStarts: 0,
    qualifierNotes:
      qualifiers.length === 0 ? 'Inga kvallopp eller träningsnoteringar registrerade' : undefined,
  };

  return {
    sourceId,
    status,
    data: {
      horse,
      pastStarts,
      allStarts: regularStarts,
      qualifiers,
      positionStats,
      trainingForm,
      status,
      fetchedAt: nowIso,
      message,
    },
    fetchedAt: nowIso,
    ageSeconds,
    message,
  };
}

function buildDegradedOrFailedResponse(
  db: Database.Database,
  horseId: string,
  status: SourceStatus,
  nowIso: string,
  ageSeconds: number,
  message: string,
  sourceId: string
): SourceResult<HorseProfileResponse> {
  const horse = findHorseInDb(db, horseId);
  if (horse) {
    return buildHorseResponse(db, horse.id, status, nowIso, ageSeconds, message, sourceId);
  }
  return createFallbackHorseProfile(horseId, nowIso, sourceId, status);
}
