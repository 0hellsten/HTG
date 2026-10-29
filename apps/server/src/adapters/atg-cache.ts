// Hjälpmetoder för caching och hälsorapportering för ATG-adaptern
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import Database from 'better-sqlite3';
import { SourceResult } from '@stallbacken/shared';
import { HealthManager } from '../health/health-manager.js';
import { getRaceDaysByDate } from '../db/queries/tracks.js';
import { getRaceById, getStartsByRaceId } from '../db/queries/races.js';
import { RacingDayData, RaceDetailData } from './atg-types.js';

export function getCachedCalendar(
  db: Database.Database,
  healthManager: HealthManager,
  sourceId: string,
  ttlSeconds: number,
  date: string,
  nowIso: string
): SourceResult<RacingDayData> | null {
  const existing = getRaceDaysByDate(db, date);
  if (existing.length === 0) return null;

  const latest = healthManager.getLatestRecord(sourceId);
  const ageSeconds = latest
    ? Math.floor((Date.now() - new Date(latest.attempted_at).getTime()) / 1000)
    : 0;

  if (ageSeconds < ttlSeconds) {
    return {
      sourceId,
      status: 'ok',
      data: { raceDays: existing },
      fetchedAt: latest?.succeeded_at || nowIso,
      ageSeconds,
      message: 'Allt är färskt och uppdaterat',
    };
  }
  return null;
}

export function getCachedRace(
  db: Database.Database,
  sourceId: string,
  raceId: string,
  nowIso: string
): SourceResult<RaceDetailData> | null {
  const existingRace = getRaceById(db, raceId);
  const existingStarts = getStartsByRaceId(db, raceId);
  if (!existingRace || existingStarts.length === 0) return null;

  return {
    sourceId,
    status: 'ok',
    data: { race: existingRace, starts: existingStarts },
    fetchedAt: nowIso,
    ageSeconds: 0,
    message: 'Allt är färskt och uppdaterat',
  };
}
