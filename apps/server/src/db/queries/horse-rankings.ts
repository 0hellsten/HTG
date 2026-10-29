// Databasfrågor för hästranking och topplistor
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import Database from 'better-sqlite3';
import { HorseRankingCategory, HorseRankingItem } from '@stallbacken/shared';
import { ensureEliteHorsesSeeded } from './seed-elite-horses.js';

export { ensureEliteHorsesSeeded };

interface DbRankingRow {
  id: string;
  name: string;
  nationality?: string | null;
  birth_year?: number | null;
  sex?: string | null;
  color?: string | null;
  breed?: string | null;
  trainer_id?: string | null;
  trainer_name?: string | null;
  home_track?: string | null;
  sire_name?: string | null;
  dam_name?: string | null;
  damsire_name?: string | null;
  starts?: number | null;
  wins?: number | null;
  seconds?: number | null;
  thirds?: number | null;
  earnings_total?: number | null;
  earnings_per_start?: number | null;
  record_auto?: string | null;
  record_volt?: string | null;
  win_percentage?: number | null;
  place_percentage?: number | null;
  today_track?: string | null;
  today_race_num?: number | null;
  today_start_num?: number | null;
  today_start_time?: string | null;
}

function mapRowToRankingItem(row: DbRankingRow, rankPosition: number): HorseRankingItem {
  const starts = row.starts || 0;
  const wins = row.wins || 0;
  const seconds = row.seconds || 0;
  const thirds = row.thirds || 0;
  const earningsTotal = row.earnings_total || 0;
  const currentYear = new Date().getFullYear();
  const age = row.birth_year ? currentYear - row.birth_year : undefined;

  const winPercentage =
    row.win_percentage !== null && row.win_percentage !== undefined
      ? row.win_percentage
      : starts > 0
        ? Math.round((wins / starts) * 100)
        : 0;

  const placePercentage =
    row.place_percentage !== null && row.place_percentage !== undefined
      ? row.place_percentage
      : starts > 0
        ? Math.round(((wins + seconds + thirds) / starts) * 100)
        : 0;

  const earningsPerStart =
    row.earnings_per_start !== null && row.earnings_per_start !== undefined
      ? row.earnings_per_start
      : starts > 0
        ? Math.round(earningsTotal / starts)
        : 0;

  const todayStart =
    row.today_track && row.today_race_num && row.today_start_num
      ? {
          trackName: row.today_track,
          raceNumber: row.today_race_num,
          startNumber: row.today_start_num,
          startTime: row.today_start_time || undefined,
        }
      : undefined;

  return {
    id: row.id,
    rankPosition,
    name: row.name,
    nationality: row.nationality || undefined,
    birthYear: row.birth_year || undefined,
    age,
    sex: row.sex || undefined,
    color: row.color || undefined,
    breed: row.breed || undefined,
    trainerId: row.trainer_id || undefined,
    trainerName: row.trainer_name || undefined,
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
    earningsTotal,
    starts,
    wins,
    seconds,
    thirds,
    winPercentage,
    placePercentage,
    earningsPerStart,
    todayStart,
  };
}

export function getHorseRankings(
  db: Database.Database,
  category: HorseRankingCategory = 'vinstrikast',
  limit = 20
): HorseRankingItem[] {
  ensureEliteHorsesSeeded(db);

  if (category === 'idag') {
    const rows = db
      .prepare(
        `
      SELECT 
        h.*,
        p.name AS trainer_name,
        COALESCE(r.track_name, t.name, 'Solvalla') AS today_track,
        r.number AS today_race_num,
        s.number AS today_start_num,
        r.start_time AS today_start_time
      FROM starts s
      JOIN horses h ON h.id = s.horse_id
      LEFT JOIN races r ON r.id = s.race_id
      LEFT JOIN tracks t ON t.id = r.track_id
      LEFT JOIN people p ON p.id = h.trainer_id
      ORDER BY r.start_time ASC, r.number ASC, s.number ASC
      LIMIT ?
    `
      )
      .all(limit) as DbRankingRow[];

    return rows.map((row, idx) => mapRowToRankingItem(row, idx + 1));
  }

  let orderBy = 'h.earnings_total DESC, h.wins DESC';
  let whereClause = '';

  if (category === 'segerprocent') {
    whereClause = 'WHERE h.starts >= 3';
    orderBy = 'h.win_percentage DESC, h.wins DESC, h.earnings_total DESC';
  } else if (category === 'segrar') {
    orderBy = 'h.wins DESC, h.win_percentage DESC, h.earnings_total DESC';
  } else if (category === 'kallblod') {
    whereClause = "WHERE h.breed = 'Kallblod'";
    orderBy = 'h.earnings_total DESC, h.wins DESC';
  }

  const query = `
    SELECT 
      h.*,
      p.name AS trainer_name
    FROM horses h
    LEFT JOIN people p ON p.id = h.trainer_id
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT ?
  `;

  const rows = db.prepare(query).all(limit) as DbRankingRow[];
  return rows.map((row, idx) => mapRowToRankingItem(row, idx + 1));
}
