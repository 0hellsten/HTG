// Seedar Sveriges mest kända elithästar och topprankade hästar i databasen
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import Database from 'better-sqlite3';

let seeded = false;

export function ensureEliteHorsesSeeded(db: Database.Database): void {
  if (seeded) return;
  seeded = true;

  const count = (db.prepare('SELECT COUNT(*) as c FROM horses').get() as { c: number }).c;
  if (count >= 210) return;

  const eliteHorses = [
    {
      id: 'h_san_moteur',
      name: 'San Moteur',
      birth_year: 2017,
      sex: 'Hingst',
      breed: 'Varmblod',
      trainer_name: 'Björn Goop',
      home_track: 'Färjestad',
      sire_name: 'Panne de Moteur',
      dam_name: 'Aung San Suu Kyi',
      damsire_name: 'Super Arnie',
      earnings_total: 14260000,
      starts: 32,
      wins: 21,
      seconds: 5,
      thirds: 2,
      win_percentage: 66,
      place_percentage: 88,
      record_auto: '1.09,1a',
      record_volt: '1.13,2',
    },
    {
      id: 'h_francesco_zet',
      name: 'Francesco Zet',
      birth_year: 2018,
      sex: 'Hingst',
      breed: 'Varmblod',
      trainer_name: 'Daniel Redén',
      home_track: 'Solvalla',
      sire_name: 'Father Patrick',
      dam_name: 'Shaqline',
      damsire_name: 'Credit Winner',
      earnings_total: 19875000,
      starts: 28,
      wins: 23,
      seconds: 2,
      thirds: 1,
      win_percentage: 82,
      place_percentage: 93,
      record_auto: '1.09,4a',
      record_volt: '1.13,8',
    },
    {
      id: 'h_calgary_games',
      name: 'Calgary Games',
      birth_year: 2017,
      sex: 'Hingst',
      breed: 'Varmblod',
      trainer_name: 'Timo Nurmos',
      home_track: 'Solvalla',
      sire_name: 'Readly Express',
      dam_name: 'Olympia Tilly',
      damsire_name: 'Lindys Crown',
      earnings_total: 6685000,
      starts: 11,
      wins: 10,
      seconds: 0,
      thirds: 0,
      win_percentage: 91,
      place_percentage: 91,
      record_auto: '1.11,7a',
      record_volt: '1.13,1',
    },
    {
      id: 'h_hail_mary',
      name: 'Hail Mary',
      birth_year: 2016,
      sex: 'Hingst',
      breed: 'Varmblod',
      trainer_name: 'Daniel Redén',
      home_track: 'Solvalla',
      sire_name: 'Googoo Gaagaa',
      dam_name: 'Dreams U.S.',
      damsire_name: 'Victory Dream',
      earnings_total: 16350000,
      starts: 44,
      wins: 26,
      seconds: 8,
      thirds: 2,
      win_percentage: 59,
      place_percentage: 82,
      record_auto: '1.08,6a',
      record_volt: '1.13,5',
    },
    {
      id: 'h_don_fanucci_zet',
      name: 'Don Fanucci Zet',
      birth_year: 2016,
      sex: 'Hingst',
      breed: 'Varmblod',
      trainer_name: 'Daniel Redén',
      home_track: 'Solvalla',
      sire_name: 'Hard Livin',
      dam_name: 'Kissed By The West',
      damsire_name: 'Western Terror',
      earnings_total: 15200000,
      starts: 48,
      wins: 24,
      seconds: 9,
      thirds: 5,
      win_percentage: 50,
      place_percentage: 79,
      record_auto: '1.08,9a',
      record_volt: '1.14,1',
    },
    {
      id: 'h_joviality',
      name: 'Joviality',
      birth_year: 2019,
      sex: 'Sto',
      breed: 'Varmblod',
      trainer_name: 'Sabine Kagebrant',
      home_track: 'Solvalla',
      sire_name: 'Chapter Seven',
      dam_name: 'Pasithea Face',
      damsire_name: 'Muscle Hill',
      earnings_total: 26120000,
      starts: 41,
      wins: 27,
      seconds: 6,
      thirds: 3,
      win_percentage: 66,
      place_percentage: 88,
      record_auto: '1.08,4a',
      record_volt: '1.12,1',
    },
    {
      id: 'h_maharajah',
      name: 'Maharajah',
      birth_year: 2005,
      sex: 'Hingst',
      breed: 'Varmblod',
      trainer_name: 'Stefan Hultman',
      home_track: 'Solvalla',
      sire_name: 'Viking Kronos',
      dam_name: 'Chili Khan',
      damsire_name: 'Giant Chill',
      earnings_total: 23534423,
      starts: 59,
      wins: 31,
      seconds: 8,
      thirds: 4,
      win_percentage: 53,
      place_percentage: 73,
      record_auto: '1.10,3a',
      record_volt: '1.12,1',
    },
    {
      id: 'h_readly_express',
      name: 'Readly Express',
      birth_year: 2012,
      sex: 'Hingst',
      breed: 'Varmblod',
      trainer_name: 'Timo Nurmos',
      home_track: 'Solvalla',
      sire_name: 'Ready Cash',
      dam_name: 'Caddie Dream',
      damsire_name: 'Viking Kronos',
      earnings_total: 24711565,
      starts: 37,
      wins: 28,
      seconds: 5,
      thirds: 2,
      win_percentage: 76,
      place_percentage: 95,
      record_auto: '1.08,9a',
      record_volt: '1.12,3',
    },
    {
      id: 'h_high_on_pepper',
      name: 'High On Pepper',
      birth_year: 2018,
      sex: 'Valack',
      breed: 'Varmblod',
      trainer_name: 'Katja Melkko',
      home_track: 'Solvalla',
      sire_name: 'Ready Cash',
      dam_name: 'Piece of Work',
      damsire_name: 'Yankee Glide',
      earnings_total: 4920000,
      starts: 38,
      wins: 22,
      seconds: 4,
      thirds: 3,
      win_percentage: 58,
      place_percentage: 76,
      record_auto: '1.11,2a',
      record_volt: '1.12,8',
    },
    {
      id: 'h_a_fair_day',
      name: 'A Fair Day',
      birth_year: 2019,
      sex: 'Valack',
      breed: 'Varmblod',
      trainer_name: 'Elisabeth Almheden',
      home_track: 'Kalmar',
      sire_name: 'Maharajah',
      dam_name: 'Jolene Day',
      damsire_name: 'Glen Kronos',
      earnings_total: 3450000,
      starts: 26,
      wins: 14,
      seconds: 5,
      thirds: 1,
      win_percentage: 54,
      place_percentage: 77,
      record_auto: '1.09,3a',
      record_volt: '1.13,0',
    },
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO horses (
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
  `);

  const personStmt = db.prepare(`
    INSERT OR IGNORE INTO people (id, name, role, source_id, fetched_at, updated_at)
    VALUES (?, ?, 'trainer', 'stallbacken-seed', datetime('now'), datetime('now'))
  `);

  const updateHorseTrainer = db.prepare(`
    UPDATE horses SET trainer_id = ? WHERE id = ?
  `);

  for (const h of eliteHorses) {
    stmt.run(
      h.id,
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
      updateHorseTrainer.run(pId, h.id);
    }
  }
}
