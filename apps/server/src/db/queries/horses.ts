// Databasfrågor för hästar och personer
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import Database from 'better-sqlite3';
import { HorseDetail } from '@stallbacken/shared';

export * from './horse-results.js';

export interface DbPersonInput {
  id: string;
  name: string;
  role?: string;
  license?: string;
  sourceId: string;
  fetchedAt: string;
}

export interface DbHorseInput {
  id: string;
  name: string;
  nationality?: string;
  birthYear?: number;
  sex?: string;
  color?: string;
  breed?: string;
  trainerId?: string;
  owner?: string;
  breeder?: string;
  homeTrack?: string;
  sireName?: string;
  damName?: string;
  damsireName?: string;
  earningsTotal?: number;
  recordAuto?: string;
  recordVolt?: string;
  starts?: number;
  wins?: number;
  seconds?: number;
  thirds?: number;
  winPercentage?: number;
  placePercentage?: number;
  earningsPerStart?: number;
  sourceId: string;
  fetchedAt: string;
}

export function upsertPerson(db: Database.Database, person: DbPersonInput): void {
  const stmt = db.prepare(`
    INSERT INTO people (id, name, role, license, source_id, fetched_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      role = COALESCE(excluded.role, people.role),
      license = COALESCE(excluded.license, people.license),
      source_id = excluded.source_id,
      fetched_at = excluded.fetched_at,
      updated_at = datetime('now')
  `);

  stmt.run(
    person.id,
    person.name,
    person.role || null,
    person.license || null,
    person.sourceId,
    person.fetchedAt
  );
}

export function upsertHorse(db: Database.Database, horse: DbHorseInput): void {
  const stmt = db.prepare(`
    INSERT INTO horses (
      id, name, nationality, birth_year, sex, color, breed,
      trainer_id, owner, breeder, home_track,
      sire_name, dam_name, damsire_name,
      earnings_total, record_auto, record_volt,
      starts, wins, seconds, thirds,
      win_percentage, place_percentage, earnings_per_start,
      source_id, fetched_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      nationality = COALESCE(excluded.nationality, horses.nationality),
      birth_year = COALESCE(excluded.birth_year, horses.birth_year),
      sex = COALESCE(excluded.sex, horses.sex),
      color = COALESCE(excluded.color, horses.color),
      breed = COALESCE(excluded.breed, horses.breed),
      trainer_id = COALESCE(excluded.trainer_id, horses.trainer_id),
      owner = COALESCE(excluded.owner, horses.owner),
      breeder = COALESCE(excluded.breeder, horses.breeder),
      home_track = COALESCE(excluded.home_track, horses.home_track),
      sire_name = COALESCE(excluded.sire_name, horses.sire_name),
      dam_name = COALESCE(excluded.dam_name, horses.dam_name),
      damsire_name = COALESCE(excluded.damsire_name, horses.damsire_name),
      earnings_total = COALESCE(excluded.earnings_total, horses.earnings_total),
      record_auto = COALESCE(excluded.record_auto, horses.record_auto),
      record_volt = COALESCE(excluded.record_volt, horses.record_volt),
      starts = COALESCE(excluded.starts, horses.starts),
      wins = COALESCE(excluded.wins, horses.wins),
      seconds = COALESCE(excluded.seconds, horses.seconds),
      thirds = COALESCE(excluded.thirds, horses.thirds),
      win_percentage = COALESCE(excluded.win_percentage, horses.win_percentage),
      place_percentage = COALESCE(excluded.place_percentage, horses.place_percentage),
      earnings_per_start = COALESCE(excluded.earnings_per_start, horses.earnings_per_start),
      source_id = excluded.source_id,
      fetched_at = excluded.fetched_at,
      updated_at = datetime('now')
  `);

  stmt.run(
    horse.id,
    horse.name,
    horse.nationality || null,
    horse.birthYear || null,
    horse.sex || null,
    horse.color || null,
    horse.breed || null,
    horse.trainerId || null,
    horse.owner || null,
    horse.breeder || null,
    horse.homeTrack || null,
    horse.sireName || null,
    horse.damName || null,
    horse.damsireName || null,
    horse.earningsTotal || 0,
    horse.recordAuto || null,
    horse.recordVolt || null,
    horse.starts || 0,
    horse.wins || 0,
    horse.seconds || 0,
    horse.thirds || 0,
    horse.winPercentage || 0,
    horse.placePercentage || 0,
    horse.earningsPerStart || 0,
    horse.sourceId,
    horse.fetchedAt
  );
}

interface DbHorseRow {
  id: string;
  name: string;
  nationality?: string | null;
  birth_year?: number | null;
  sex?: string | null;
  color?: string | null;
  breed?: string | null;
  trainer_id?: string | null;
  trainer_name?: string | null;
  owner?: string | null;
  breeder?: string | null;
  home_track?: string | null;
  sire_name?: string | null;
  dam_name?: string | null;
  damsire_name?: string | null;
  record_auto?: string | null;
  record_volt?: string | null;
  earnings_total?: number | null;
  starts?: number | null;
  wins?: number | null;
  seconds?: number | null;
  thirds?: number | null;
  win_percentage?: number | null;
  place_percentage?: number | null;
  earnings_per_start?: number | null;
}

export function getHorseById(db: Database.Database, id: string): HorseDetail | null {
  const row = db
    .prepare(
      `
    SELECT 
      h.*,
      p.name AS trainer_name
    FROM horses h
    LEFT JOIN people p ON p.id = h.trainer_id
    WHERE h.id = ?
  `
    )
    .get(id) as DbHorseRow | undefined;

  if (!row) return null;

  const currentYear = new Date().getFullYear();
  const age = row.birth_year ? currentYear - row.birth_year : undefined;

  return {
    id: row.id,
    name: row.name,
    nationality: row.nationality || undefined,
    birthYear: row.birth_year || undefined,
    age,
    sex: row.sex || undefined,
    color: row.color || undefined,
    breed: row.breed || undefined,
    trainerId: row.trainer_id || undefined,
    trainerName: row.trainer_name || undefined,
    owner: row.owner || undefined,
    breeder: row.breeder || undefined,
    homeTrack: row.home_track || undefined,
    pedigree: {
      father: row.sire_name || undefined,
      mother: row.dam_name || undefined,
      grandfather: row.damsire_name || undefined,
    },
    records: {
      auto: row.record_auto || undefined,
      volt: row.record_volt || undefined,
    },
    earningsTotal: row.earnings_total || 0,
    starts: row.starts || 0,
    wins: row.wins || 0,
    seconds: row.seconds || 0,
    thirds: row.thirds || 0,
    winPercentage: row.win_percentage || 0,
    placePercentage: row.place_percentage || 0,
    earningsPerStart: row.earnings_per_start || 0,
  };
}

export function searchHorses(db: Database.Database, query: string, limit = 20): HorseDetail[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const rows = db
    .prepare(
      `
    SELECT 
      h.*,
      p.name AS trainer_name
    FROM horses h
    LEFT JOIN people p ON p.id = h.trainer_id
    WHERE h.name LIKE ?
    ORDER BY h.earnings_total DESC, h.name ASC
    LIMIT ?
  `
    )
    .all(`%${trimmed}%`, limit) as DbHorseRow[];

  const currentYear = new Date().getFullYear();

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    nationality: row.nationality || undefined,
    birthYear: row.birth_year || undefined,
    age: row.birth_year ? currentYear - row.birth_year : undefined,
    sex: row.sex || undefined,
    color: row.color || undefined,
    breed: row.breed || undefined,
    trainerId: row.trainer_id || undefined,
    trainerName: row.trainer_name || undefined,
    owner: row.owner || undefined,
    breeder: row.breeder || undefined,
    homeTrack: row.home_track || undefined,
    pedigree: {
      father: row.sire_name || undefined,
      mother: row.dam_name || undefined,
      grandfather: row.damsire_name || undefined,
    },
    records: {
      auto: row.record_auto || undefined,
      volt: row.record_volt || undefined,
    },
    earningsTotal: row.earnings_total || 0,
    starts: row.starts || 0,
    wins: row.wins || 0,
    seconds: row.seconds || 0,
    thirds: row.thirds || 0,
    winPercentage: row.win_percentage || 0,
    placePercentage: row.place_percentage || 0,
    earningsPerStart: row.earnings_per_start || 0,
  }));
}
