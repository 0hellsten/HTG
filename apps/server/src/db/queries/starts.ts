// Databasfrågor för starter
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import Database from 'better-sqlite3';
import { Start } from '@stallbacken/shared';

export interface DbStartInput {
  id: string;
  raceId: string;
  horseId: string;
  startNumber: number;
  postPosition: number;
  distanceM: number;
  handicapM?: number;
  driverId?: string;
  trainerId?: string;
  shoesFront?: boolean;
  shoesBack?: boolean;
  shoesChanged?: boolean;
  sulkyType?: string;
  sulkyColor?: string;
  scratched?: boolean;
  scratchReason?: string;
  sourceId: string;
  fetchedAt: string;
}

/**
 * Sparar eller uppdaterar en start.
 */
export function upsertStart(db: Database.Database, start: DbStartInput): void {
  const stmt = db.prepare(`
    INSERT INTO starts (
      id, race_id, horse_id, start_number, post_position,
      handicap_m, driver_id, trainer_id,
      shoes_front, shoes_back, shoes_changed, sulky_type,
      sulky_color, scratched, scratch_reason, source_id,
      fetched_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      start_number = excluded.start_number,
      post_position = excluded.post_position,
      handicap_m = COALESCE(excluded.handicap_m, starts.handicap_m),
      driver_id = COALESCE(excluded.driver_id, starts.driver_id),
      trainer_id = COALESCE(excluded.trainer_id, starts.trainer_id),
      shoes_front = COALESCE(excluded.shoes_front, starts.shoes_front),
      shoes_back = COALESCE(excluded.shoes_back, starts.shoes_back),
      shoes_changed = COALESCE(excluded.shoes_changed, starts.shoes_changed),
      sulky_type = COALESCE(excluded.sulky_type, starts.sulky_type),
      sulky_color = COALESCE(excluded.sulky_color, starts.sulky_color),
      scratched = excluded.scratched,
      scratch_reason = COALESCE(excluded.scratch_reason, starts.scratch_reason),
      source_id = excluded.source_id,
      fetched_at = excluded.fetched_at,
      updated_at = datetime('now')
  `);

  stmt.run(
    start.id,
    start.raceId,
    start.horseId,
    start.startNumber,
    start.postPosition,
    start.handicapM || null,
    start.driverId || null,
    start.trainerId || null,
    start.shoesFront !== undefined ? (start.shoesFront ? 1 : 0) : null,
    start.shoesBack !== undefined ? (start.shoesBack ? 1 : 0) : null,
    start.shoesChanged ? 1 : 0,
    start.sulkyType || null,
    start.sulkyColor || null,
    start.scratched ? 1 : 0,
    start.scratchReason || null,
    start.sourceId,
    start.fetchedAt
  );
}

interface StartRow {
  id: string;
  race_id: string;
  horse_id: string;
  horse_name: string;
  start_number: number;
  post_position: number;
  distance_m: number;
  driver_name: string | null;
  trainer_name: string | null;
  shoes_front: number | null;
  shoes_back: number | null;
  shoes_changed: number | null;
  sulky_type: string | null;
  scratched: number;
  scratch_reason: string | null;
  record_auto: string | null;
  record_volt: string | null;
  earnings_total: number | null;
}

/**
 * Hämtar alla starter för ett givet lopp med kusk, tränare, hästnamn, skor etc.
 */
export function getStartsByRaceId(db: Database.Database, raceId: string): Start[] {
  const stmt = db.prepare(`
    SELECT 
      s.id,
      s.race_id,
      s.horse_id,
      h.name AS horse_name,
      s.start_number,
      s.post_position,
      (COALESCE(r.distance_m, 2140) + COALESCE(s.handicap_m, 0)) AS distance_m,
      pd.name AS driver_name,
      pt.name AS trainer_name,
      s.shoes_front,
      s.shoes_back,
      s.shoes_changed,
      s.sulky_type,
      s.scratched,
      s.scratch_reason,
      h.record_auto,
      h.record_volt,
      h.earnings_total
    FROM starts s
    JOIN races r ON r.id = s.race_id
    JOIN horses h ON h.id = s.horse_id
    LEFT JOIN people pd ON pd.id = s.driver_id
    LEFT JOIN people pt ON pt.id = s.trainer_id
    WHERE s.race_id = ?
    ORDER BY s.start_number ASC
  `);

  const rows = stmt.all(raceId) as StartRow[];

  return rows.map((row) => ({
    id: row.id,
    raceId: row.race_id,
    horseId: row.horse_id,
    horseName: row.horse_name,
    startNumber: row.start_number,
    postPosition: row.post_position,
    distanceM: row.distance_m,
    driverName: row.driver_name || undefined,
    trainerName: row.trainer_name || undefined,
    shoesFront: row.shoes_front !== null ? row.shoes_front === 1 : undefined,
    shoesBack: row.shoes_back !== null ? row.shoes_back === 1 : undefined,
    shoesChanged: row.shoes_changed === 1,
    sulkyType: row.sulky_type || undefined,
    scratched: row.scratched === 1,
    scratchReason: row.scratch_reason || undefined,
    record: row.record_auto || row.record_volt || undefined,
    earnings: row.earnings_total !== null ? row.earnings_total : undefined,
  }));
}
