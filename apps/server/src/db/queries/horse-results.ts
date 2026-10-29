// Databasfrågor för hästars historiska lopp och spårstatistik
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import Database from 'better-sqlite3';
import { HorsePastStart, TrackPositionStat } from '@stallbacken/shared';

interface HorseResultRow {
  id: string;
  horse_id: string;
  date: string;
  track_name: string;
  race_number?: number | null;
  race_type?: string | null;
  start_method?: string | null;
  distance_m: number;
  post_position?: number | null;
  driver_name?: string | null;
  place?: string | null;
  km_time?: string | null;
  odds?: number | null;
  shoes_front?: number | null;
  shoes_back?: number | null;
  sulky_type?: string | null;
  first_prize?: number | null;
}

interface TrackPositionRow {
  start_method: string;
  post_position: number;
  total_starts: number;
  wins: number;
  places: number;
}

export function saveHorseResults(
  db: Database.Database,
  horseId: string,
  results: HorsePastStart[],
  sourceId: string,
  fetchedAt: string
): void {
  const stmt = db.prepare(`
    INSERT INTO horse_results (
      id, horse_id, date, track_id, track_name, race_id, race_number,
      race_type, start_method, distance_m, post_position,
      driver_id, driver_name, place, km_time, odds,
      shoes_front, shoes_back, sulky_type, first_prize,
      source_id, fetched_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      place = excluded.place,
      km_time = excluded.km_time,
      odds = excluded.odds,
      shoes_front = excluded.shoes_front,
      shoes_back = excluded.shoes_back,
      sulky_type = excluded.sulky_type,
      first_prize = excluded.first_prize,
      source_id = excluded.source_id,
      fetched_at = excluded.fetched_at,
      updated_at = datetime('now')
  `);

  const tx = db.transaction(() => {
    for (const res of results) {
      stmt.run(
        res.id,
        horseId,
        res.date,
        null,
        res.trackName,
        null,
        res.raceNumber || null,
        res.raceType,
        res.startMethod,
        res.distanceM,
        res.postPosition || null,
        null,
        res.driverName || null,
        res.place || null,
        res.kmTime || null,
        res.odds || null,
        res.shoesFront !== undefined ? (res.shoesFront ? 1 : 0) : null,
        res.shoesBack !== undefined ? (res.shoesBack ? 1 : 0) : null,
        res.sulkyType || null,
        res.firstPrize || 0,
        sourceId,
        fetchedAt
      );
    }
  });

  tx();
}

export function getHorseResults(
  db: Database.Database,
  horseId: string,
  limit?: number
): HorsePastStart[] {
  const query = `
    SELECT * FROM horse_results
    WHERE horse_id = ?
    ORDER BY date DESC, race_number DESC
    ${limit ? `LIMIT ${limit}` : ''}
  `;

  const rows = db.prepare(query).all(horseId) as HorseResultRow[];

  return rows.map((r) => ({
    id: r.id,
    horseId: r.horse_id,
    date: r.date,
    trackName: r.track_name,
    raceNumber: r.race_number || undefined,
    raceType: (r.race_type as 'regular' | 'qualifier') || 'regular',
    startMethod: (r.start_method === 'volte' || r.start_method === 'volt') ? 'volt' : 'auto',
    distanceM: r.distance_m,
    postPosition: r.post_position || undefined,
    driverName: r.driver_name || undefined,
    place: r.place || undefined,
    kmTime: r.km_time || undefined,
    odds: r.odds || undefined,
    shoesFront: r.shoes_front !== null ? r.shoes_front === 1 : undefined,
    shoesBack: r.shoes_back !== null ? r.shoes_back === 1 : undefined,
    sulkyType: r.sulky_type || undefined,
    firstPrize: r.first_prize || 0,
  }));
}

export function getTrackPositionStats(
  db: Database.Database,
  horseId: string
): TrackPositionStat[] {
  const query = `
    SELECT 
      start_method,
      post_position,
      COUNT(*) AS total_starts,
      SUM(CASE WHEN place = '1' THEN 1 ELSE 0 END) AS wins,
      SUM(CASE WHEN place IN ('1', '2', '3') THEN 1 ELSE 0 END) AS places
    FROM horse_results
    WHERE horse_id = ? AND post_position IS NOT NULL AND race_type != 'qualifier'
    GROUP BY start_method, post_position
    ORDER BY start_method ASC, post_position ASC
  `;

  const rows = db.prepare(query).all(horseId) as TrackPositionRow[];

  return rows.map((r) => {
    const totalStarts = r.total_starts || 0;
    const wins = r.wins || 0;
    const places = r.places || 0;
    const winPercent = totalStarts > 0 ? Math.round((wins / totalStarts) * 100) : 0;
    const method = (r.start_method === 'volte' || r.start_method === 'volt') ? 'volt' : 'auto';

    return {
      startMethod: method,
      postPosition: r.post_position,
      starts: totalStarts,
      wins,
      places,
      winPercent,
    };
  });
}
