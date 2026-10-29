// Databasfrågor för odds och streckprocent
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import Database from 'better-sqlite3';
import { RaceOddsData, HorseOdds } from '@stallbacken/shared';

export interface DbOddsInput {
  startId: string;
  recordedAt: string;
  winOdds?: number | null;
  placeOdds?: number | null;
  stakePercent?: number | null;
  gameType: string;
  sourceId: string;
}

interface RawOddsRow {
  start_id: string;
  start_number: number;
  horse_id: string;
  win_odds: number | null;
  place_odds: number | null;
  stake_percent: number | null;
  recorded_at: string | null;
  game_type: string | null;
}

/**
 * Sparar en odds-post i tidsserien för en start.
 */
export function upsertOdds(db: Database.Database, input: DbOddsInput): void {
  const stmt = db.prepare(`
    INSERT INTO odds (
      start_id, recorded_at, win_odds, place_odds, stake_percent,
      game_type, source_id, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(start_id, recorded_at, game_type) DO UPDATE SET
      win_odds = COALESCE(excluded.win_odds, odds.win_odds),
      place_odds = COALESCE(excluded.place_odds, odds.place_odds),
      stake_percent = COALESCE(excluded.stake_percent, odds.stake_percent),
      source_id = excluded.source_id,
      updated_at = datetime('now')
  `);

  stmt.run(
    input.startId,
    input.recordedAt,
    input.winOdds ?? null,
    input.placeOdds ?? null,
    input.stakePercent ?? null,
    input.gameType,
    input.sourceId
  );
}

/**
 * Sparar alla odds och streck i en samlad RaceOddsData.
 */
export function saveRaceOdds(
  db: Database.Database,
  oddsData: RaceOddsData,
  sourceId: string
): void {
  const insertMany = db.transaction((items: HorseOdds[]) => {
    for (const item of items) {
      const startId = item.startId || `${oddsData.raceId}_${item.startNumber}`;
      upsertOdds(db, {
        startId,
        recordedAt: oddsData.recordedAt,
        winOdds: item.winOdds,
        placeOdds: item.placeOdds,
        stakePercent: item.stakePercent,
        gameType: oddsData.gameType || 'Vinnare',
        sourceId,
      });
    }
  });

  insertMany(oddsData.odds);
}

/**
 * Hämtar senaste sparade odds och streck för ett lopp.
 */
export function getLatestOddsForRace(
  db: Database.Database,
  raceId: string
): RaceOddsData | null {
  const stmt = db.prepare(`
    SELECT
      s.id as start_id,
      s.start_number,
      s.horse_id,
      o.win_odds,
      o.place_odds,
      o.stake_percent,
      o.recorded_at,
      o.game_type
    FROM starts s
    LEFT JOIN odds o ON o.start_id = s.id
      AND o.recorded_at = (SELECT MAX(recorded_at) FROM odds WHERE start_id = s.id)
    WHERE s.race_id = ?
    ORDER BY s.start_number ASC
  `);

  const rows = stmt.all(raceId) as RawOddsRow[];
  if (!rows || rows.length === 0) {
    return null;
  }

  // Kontrollera om det finns minst ett registrerat odds
  const hasAnyOdds = rows.some((r) => r.recorded_at !== null);
  if (!hasAnyOdds) {
    return null;
  }

  const latestRecordedAt = rows
    .map((r) => r.recorded_at)
    .filter((d): d is string => d !== null)
    .sort()
    .reverse()[0] || new Date().toISOString();

  // Formatera t.ex. "2026-10-29T18:42:00" -> "18:42"
  const timeFormatted = latestRecordedAt.includes('T')
    ? latestRecordedAt.split('T')[1].slice(0, 5)
    : latestRecordedAt.slice(11, 16);

  const odds: HorseOdds[] = rows.map((r) => ({
    startId: r.start_id,
    startNumber: r.start_number,
    horseId: r.horse_id,
    winOdds: r.win_odds !== null ? r.win_odds : undefined,
    placeOdds: r.place_odds !== null ? r.place_odds : undefined,
    stakePercent: r.stake_percent !== null ? r.stake_percent : undefined,
  }));

  const gameType = rows.find((r) => r.game_type)?.game_type || 'Vinnare';

  return {
    raceId,
    recordedAt: latestRecordedAt,
    timeFormatted: timeFormatted || '–',
    gameType,
    odds,
  };
}
