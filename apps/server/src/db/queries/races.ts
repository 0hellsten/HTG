import Database from 'better-sqlite3';
import { Race } from '@stallbacken/shared';

export * from './horses.js';
export * from './starts.js';

export interface DbRaceInput {
  id: string;
  raceDayId: string;
  number: number;
  name?: string;
  distanceM?: number;
  startMethod?: 'volt' | 'auto';
  purse?: string;
  terms?: string;
  status?: string;
  scheduledStart: string;
  actualStart?: string;
  trackCondition?: string;
  sourceId: string;
  fetchedAt: string;
}

export function upsertRace(db: Database.Database, race: DbRaceInput): void {
  const stmt = db.prepare(`
    INSERT INTO races (
      id, race_day_id, number, name, distance_m, start_method,
      purse, terms, status, scheduled_start, actual_start,
      track_condition, source_id, fetched_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      number = excluded.number,
      name = COALESCE(excluded.name, races.name),
      distance_m = COALESCE(excluded.distance_m, races.distance_m),
      start_method = COALESCE(excluded.start_method, races.start_method),
      purse = COALESCE(excluded.purse, races.purse),
      terms = COALESCE(excluded.terms, races.terms),
      status = COALESCE(excluded.status, races.status),
      scheduled_start = excluded.scheduled_start,
      actual_start = COALESCE(excluded.actual_start, races.actual_start),
      track_condition = COALESCE(excluded.track_condition, races.track_condition),
      source_id = excluded.source_id,
      fetched_at = excluded.fetched_at,
      updated_at = datetime('now')
  `);

  stmt.run(
    race.id,
    race.raceDayId,
    race.number,
    race.name || null,
    race.distanceM || null,
    race.startMethod || 'auto',
    race.purse || null,
    race.terms || null,
    race.status || 'kommande',
    race.scheduledStart,
    race.actualStart || null,
    race.trackCondition || null,
    race.sourceId,
    race.fetchedAt
  );
}

interface RaceRow {
  id: string;
  race_day_id: string;
  number: number;
  name: string | null;
  distance_m: number;
  start_method: string;
  purse: string | null;
  terms: string | null;
  status: string;
  scheduled_start: string;
  actual_start: string | null;
  track_condition: string | null;
  track_name?: string | null;
}

export function getRaceById(db: Database.Database, raceId: string): Race | null {
  const stmt = db.prepare(`
    SELECT 
      r.id,
      r.race_day_id,
      r.number,
      r.name,
      r.distance_m,
      r.start_method,
      r.purse,
      r.terms,
      r.status,
      r.scheduled_start,
      r.actual_start,
      r.track_condition,
      t.name AS track_name
    FROM races r
    JOIN race_days rd ON rd.id = r.race_day_id
    JOIN tracks t ON t.id = rd.track_id
    WHERE r.id = ?
  `);

  const row = stmt.get(raceId) as RaceRow | undefined;
  if (!row) return null;

  return {
    id: row.id,
    raceDayId: row.race_day_id,
    number: row.number,
    name: row.name || undefined,
    distanceM: row.distance_m,
    startMethod: row.start_method === 'volt' ? 'volt' : 'auto',
    purse: row.purse || undefined,
    terms: row.terms || undefined,
    status: row.status === 'avgjort' || row.status === 'spelbart' ? row.status : 'kommande',
    scheduledStart: row.scheduled_start,
    actualStart: row.actual_start || undefined,
    trackCondition: row.track_condition || undefined,
    trackName: row.track_name || undefined,
  };
}

export function getRacesByRaceDayId(db: Database.Database, raceDayId: string): Race[] {
  const stmt = db.prepare(`
    SELECT 
      r.id,
      r.race_day_id,
      r.number,
      r.name,
      r.distance_m,
      r.start_method,
      r.purse,
      r.terms,
      r.status,
      r.scheduled_start,
      r.actual_start,
      r.track_condition,
      t.name AS track_name
    FROM races r
    JOIN race_days rd ON rd.id = r.race_day_id
    JOIN tracks t ON t.id = rd.track_id
    WHERE r.race_day_id = ?
    ORDER BY r.number ASC
  `);

  const rows = stmt.all(raceDayId) as RaceRow[];

  return rows.map((row) => ({
    id: row.id,
    raceDayId: row.race_day_id,
    number: row.number,
    name: row.name || undefined,
    distanceM: row.distance_m,
    startMethod: row.start_method === 'volt' ? 'volt' : 'auto',
    purse: row.purse || undefined,
    terms: row.terms || undefined,
    status: row.status === 'avgjort' || row.status === 'spelbart' ? row.status : 'kommande',
    scheduledStart: row.scheduled_start,
    actualStart: row.actual_start || undefined,
    trackCondition: row.track_condition || undefined,
    trackName: row.track_name || undefined,
  }));
}
