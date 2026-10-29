// Seedar Sveriges mest kända elithästar, kallblodsstjärnor och topprankade hästar
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import Database from 'better-sqlite3';
import { ELITE_VARMBLOD_PART1, SeedHorse } from './elite-horses-varmblod.js';
import { ELITE_VARMBLOD_PART2 } from './elite-horses-varmblod-del2.js';
import { ELITE_VARMBLOD_PART3 } from './elite-horses-varmblod-del3.js';
import { ELITE_AKTIVA_GULD } from './elite-horses-aktiva-guld.js';
import { ELITE_STON } from './elite-horses-ston.js';
import { ELITE_KALLBLOD_OCH_IKONER } from './elite-horses-kallblod.js';
import { ELITE_AKTIVA_KALLBLOD } from './elite-horses-aktiva-kallblod.js';

let seeded = false;

export function ensureEliteHorsesSeeded(db: Database.Database): void {
  if (seeded) return;
  seeded = true;

  const allEliteHorses: SeedHorse[] = [
    ...ELITE_VARMBLOD_PART1,
    ...ELITE_VARMBLOD_PART2,
    ...ELITE_VARMBLOD_PART3,
    ...ELITE_AKTIVA_GULD,
    ...ELITE_STON,
    ...ELITE_KALLBLOD_OCH_IKONER,
    ...ELITE_AKTIVA_KALLBLOD,
  ];

  const stmt = db.prepare(`
    INSERT INTO horses (
      id, name, birth_year, sex, breed, home_track,
      sire_name, dam_name, damsire_name,
      earnings_total, starts, wins, seconds, thirds,
      win_percentage, place_percentage,
      record_auto, record_volt, source_id, fetched_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?,
      ?, ?, 'stallbacken-seed', datetime('now'), datetime('now')
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      birth_year = excluded.birth_year,
      sex = excluded.sex,
      breed = excluded.breed,
      home_track = excluded.home_track,
      sire_name = excluded.sire_name,
      dam_name = excluded.dam_name,
      damsire_name = excluded.damsire_name,
      earnings_total = excluded.earnings_total,
      starts = excluded.starts,
      wins = excluded.wins,
      seconds = excluded.seconds,
      thirds = excluded.thirds,
      win_percentage = excluded.win_percentage,
      place_percentage = excluded.place_percentage,
      record_auto = excluded.record_auto,
      record_volt = excluded.record_volt,
      updated_at = datetime('now')
  `);

  const personStmt = db.prepare(`
    INSERT INTO people (id, name, role, source_id, fetched_at, updated_at)
    VALUES (?, ?, 'trainer', 'stallbacken-seed', datetime('now'), datetime('now'))
    ON CONFLICT(id) DO UPDATE SET name = excluded.name
  `);

  const updateHorseTrainer = db.prepare(`
    UPDATE horses SET trainer_id = ? WHERE id = ?
  `);

  const insertResultStmt = db.prepare(`
    INSERT OR IGNORE INTO horse_results (
      id, horse_id, date, track_name, race_number,
      distance_m, start_method, post_position, place,
      km_time, first_prize, driver_name, odds,
      source_id, fetched_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'stallbacken-seed', datetime('now'))
  `);

  const findByName = db.prepare('SELECT id FROM horses WHERE LOWER(name) = LOWER(?)');

  for (const h of allEliteHorses) {
    const existing = findByName.get(h.name) as { id: string } | undefined;
    const targetId = existing?.id || h.id;

    stmt.run(
      targetId,
      h.name,
      h.birth_year,
      h.sex,
      h.breed,
      h.home_track,
      h.sire_name,
      h.dam_name,
      h.damsire_name,
      h.earnings_total,
      h.starts,
      h.wins,
      h.seconds,
      h.thirds,
      h.win_percentage,
      h.place_percentage,
      h.record_auto,
      h.record_volt
    );

    if (h.trainer_name) {
      const pId = 'p_' + h.trainer_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      personStmt.run(pId, h.trainer_name);
      updateHorseTrainer.run(pId, targetId);
    }

    // Skapa ett par representativa loppresultat för historikvyn
    const baseDate = new Date();
    for (let r = 0; r < 5; r++) {
      const rDate = new Date(baseDate.getTime() - r * 28 * 24 * 3600 * 1000)
        .toISOString()
        .slice(0, 10);
      const resId = `res_${targetId}_${r}`;
      const placement = r === 0 ? '1' : r === 1 ? '1' : r === 2 ? '2' : r === 3 ? '1' : '3';
      const odds = (1.4 + r * 0.8).toFixed(1);
      const firstPrize = r === 0 ? 1000000 : 300000;

      insertResultStmt.run(
        resId,
        targetId,
        rDate,
        h.home_track || 'Solvalla',
        7,
        2140,
        'auto',
        ((r * 2 + 1) % 8) + 1,
        placement,
        h.record_auto || '1.11,2a',
        firstPrize,
        h.trainer_name,
        odds
      );
    }
  }
}
