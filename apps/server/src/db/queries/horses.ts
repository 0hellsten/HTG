// Databasfrågor för hästar och personer
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import Database from 'better-sqlite3';

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
  earningsTotal?: number;
  recordAuto?: string;
  recordVolt?: string;
  sourceId: string;
  fetchedAt: string;
}

/**
 * Sparar eller uppdaterar en person (kusk eller tränare).
 */
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

/**
 * Sparar eller uppdaterar en häst.
 */
export function upsertHorse(db: Database.Database, horse: DbHorseInput): void {
  const stmt = db.prepare(`
    INSERT INTO horses (
      id, name, nationality, birth_year, sex, color, breed,
      trainer_id, owner, earnings_total, record_auto, record_volt,
      source_id, fetched_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      nationality = COALESCE(excluded.nationality, horses.nationality),
      birth_year = COALESCE(excluded.birth_year, horses.birth_year),
      sex = COALESCE(excluded.sex, horses.sex),
      color = COALESCE(excluded.color, horses.color),
      breed = COALESCE(excluded.breed, horses.breed),
      trainer_id = COALESCE(excluded.trainer_id, horses.trainer_id),
      owner = COALESCE(excluded.owner, horses.owner),
      earnings_total = COALESCE(excluded.earnings_total, horses.earnings_total),
      record_auto = COALESCE(excluded.record_auto, horses.record_auto),
      record_volt = COALESCE(excluded.record_volt, horses.record_volt),
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
    horse.earningsTotal || null,
    horse.recordAuto || null,
    horse.recordVolt || null,
    horse.sourceId,
    horse.fetchedAt
  );
}
