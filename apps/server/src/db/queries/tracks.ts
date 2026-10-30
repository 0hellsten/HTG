import Database from 'better-sqlite3';
import { RaceDay } from '@stallbacken/shared';

export interface DbTrackInput {
  id: string;
  name: string;
  country?: string;
  lengthM?: number;
  surface?: string;
  covered?: boolean;
  sourceId: string;
  fetchedAt: string;
}

export interface DbRaceDayInput {
  id: string;
  date: string;
  trackId: string;
  biggestGame?: string;
  firstStart?: string;
  sourceId: string;
  fetchedAt: string;
}

export function upsertTrack(db: Database.Database, track: DbTrackInput): void {
  const stmt = db.prepare(`
    INSERT INTO tracks (id, name, country, length_m, surface, covered, source_id, fetched_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      country = COALESCE(excluded.country, tracks.country),
      length_m = COALESCE(excluded.length_m, tracks.length_m),
      surface = COALESCE(excluded.surface, tracks.surface),
      covered = COALESCE(excluded.covered, tracks.covered),
      source_id = excluded.source_id,
      fetched_at = excluded.fetched_at,
      updated_at = datetime('now')
  `);

  stmt.run(
    track.id,
    track.name,
    track.country || 'SE',
    track.lengthM || null,
    track.surface || null,
    track.covered ? 1 : 0,
    track.sourceId,
    track.fetchedAt
  );
}

export function upsertRaceDay(db: Database.Database, raceDay: DbRaceDayInput): void {
  const stmt = db.prepare(`
    INSERT INTO race_days (id, date, track_id, biggest_game, first_start, source_id, fetched_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      biggest_game = COALESCE(excluded.biggest_game, race_days.biggest_game),
      first_start = COALESCE(excluded.first_start, race_days.first_start),
      source_id = excluded.source_id,
      fetched_at = excluded.fetched_at,
      updated_at = datetime('now')
  `);

  stmt.run(
    raceDay.id,
    raceDay.date,
    raceDay.trackId,
    raceDay.biggestGame || null,
    raceDay.firstStart || null,
    raceDay.sourceId,
    raceDay.fetchedAt
  );
}

interface RaceDayRow {
  id: string;
  date: string;
  track_id: string;
  track_name: string;
  biggest_game: string | null;
  first_start: string | null;
  races_count: number;
}

export function getRaceDaysByDate(db: Database.Database, date: string): RaceDay[] {
  const stmt = db.prepare(`
    SELECT 
      rd.id,
      rd.date,
      rd.track_id,
      t.name AS track_name,
      rd.biggest_game,
      rd.first_start,
      (SELECT COUNT(*) FROM races r WHERE r.race_day_id = rd.id) AS races_count
    FROM race_days rd
    JOIN tracks t ON t.id = rd.track_id
    WHERE rd.date = ?
    ORDER BY rd.first_start ASC
  `);

  const rows = stmt.all(date) as RaceDayRow[];

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    trackId: row.track_id,
    trackName: row.track_name,
    biggestGame: row.biggest_game || undefined,
    firstStart: row.first_start || undefined,
    racesCount: row.races_count,
  }));
}
