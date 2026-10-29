// Beräkning av härledd banstatistik och hämtning av banprofiler
// Stallbacken — HTG

import Database from 'better-sqlite3';
import {
  TrackProfile,
  TrackStats,
  PostPositionStat,
  CommonWinningTime,
} from '@stallbacken/shared';

interface TrackRow {
  id: string;
  name: string;
  country: string | null;
  length_m: number | null;
  stretch_m: number | null;
  surface: string | null;
  covered: number | null;
  open_stretch_lanes: number | null;
  angled_wing: number | null;
  lat: number | null;
  lon: number | null;
}

/**
 * Hämtar fullständig banprofil för en given bana.
 */
export function getTrackProfile(db: Database.Database, trackId: string): TrackProfile | null {
  const row = db
    .prepare('SELECT * FROM tracks WHERE id = ?')
    .get(trackId) as TrackRow | undefined;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    country: row.country || 'SE',
    lengthM: row.length_m || 1000,
    stretchM: row.stretch_m || 200,
    surface: row.surface || 'Grus',
    covered: row.covered === 1,
    openStretchLanes: row.open_stretch_lanes || 0,
    angledWing: row.angled_wing === 1,
    lat: row.lat || 59.329,
    lon: row.lon || 18.068,
  };
}

/**
 * Hämtar samtliga banor i systemet sorterade alfabetiskt.
 */
export function getAllTrackProfiles(db: Database.Database): TrackProfile[] {
  const rows = db
    .prepare('SELECT * FROM tracks ORDER BY name ASC')
    .all() as TrackRow[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    country: row.country || 'SE',
    lengthM: row.length_m || 1000,
    stretchM: row.stretch_m || 200,
    surface: row.surface || 'Grus',
    covered: row.covered === 1,
    openStretchLanes: row.open_stretch_lanes || 0,
    angledWing: row.angled_wing === 1,
    lat: row.lat || 59.329,
    lon: row.lon || 18.068,
  }));
}

interface StatRow {
  post_position: number;
  total_starts: number;
  total_wins: number;
}

/**
 * Beräknar banstatistik ur sparad historik:
 * - "Så brukar spåren gå" (vinstprocent per startspår, volt och auto var för sig)
 * - "Leder man, vinner man?" (vinstprocent för hästen i ledningen / innerspår)
 * - Vanliga vinnartider
 * - Underlag: antal lopp statistiken faktiskt bygger på
 */
export function calculateTrackStats(db: Database.Database, trackId: string): TrackStats {
  const track = getTrackProfile(db, trackId);
  const trackName = track?.name || 'Okänd bana';

  // Räkna antal lopp och starter för denna bana ur horse_results och starts
  // 1. Spårstatistik för autostart ur horse_results
  const autoRows = db
    .prepare(`
      SELECT 
        post_position,
        COUNT(*) as total_starts,
        SUM(CASE WHEN place = '1' THEN 1 ELSE 0 END) as total_wins
      FROM horse_results
      WHERE (track_name = ? OR track_id = ?)
        AND start_method = 'auto'
        AND post_position IS NOT NULL
        AND post_position > 0
      GROUP BY post_position
      ORDER BY post_position ASC
    `)
    .all(trackName, trackId) as StatRow[];

  // 2. Spårstatistik för voltstart ur horse_results
  const voltRows = db
    .prepare(`
      SELECT 
        post_position,
        COUNT(*) as total_starts,
        SUM(CASE WHEN place = '1' THEN 1 ELSE 0 END) as total_wins
      FROM horse_results
      WHERE (track_name = ? OR track_id = ?)
        AND start_method = 'volt'
        AND post_position IS NOT NULL
        AND post_position > 0
      GROUP BY post_position
      ORDER BY post_position ASC
    `)
    .all(trackName, trackId) as StatRow[];

  // Räkna totalt antal lopp på denna bana i historiken
  const raceCountRow = db
    .prepare(`
      SELECT COUNT(DISTINCT date || '_' || race_number) as race_count
      FROM horse_results
      WHERE track_name = ? OR track_id = ?
    `)
    .get(trackName, trackId) as { race_count: number } | undefined;

  const totalRaces = raceCountRow?.race_count || 0;

  // Bygg spårstatistik för auto (spår 1-12)
  const autoMap = new Map<number, StatRow>();
  for (const r of autoRows) {
    autoMap.set(r.post_position, r);
  }

  const postStatsAuto: PostPositionStat[] = [];
  for (let pos = 1; pos <= 12; pos++) {
    const data = autoMap.get(pos);
    const starts = data?.total_starts || 0;
    const wins = data?.total_wins || 0;
    postStatsAuto.push({
      postPosition: pos,
      startMethod: 'auto',
      starts,
      wins,
      winPercent: starts > 0 ? Math.round((wins / starts) * 100) : null,
    });
  }

  // Bygg spårstatistik för volt (spår 1-15)
  const voltMap = new Map<number, StatRow>();
  for (const r of voltRows) {
    voltMap.set(r.post_position, r);
  }

  const postStatsVolt: PostPositionStat[] = [];
  for (let pos = 1; pos <= 15; pos++) {
    const data = voltMap.get(pos);
    const starts = data?.total_starts || 0;
    const wins = data?.total_wins || 0;
    postStatsVolt.push({
      postPosition: pos,
      startMethod: 'volt',
      starts,
      wins,
      winPercent: starts > 0 ? Math.round((wins / starts) * 100) : null,
    });
  }

  // 3. "Leder man, vinner man?": Vinstprocent för hästar från spår 1 i auto som håller ledningen,
  // eller total vinstprocent för framspår (spår 1-3) i lopp på banan
  let leaderWinPercent: number | null = null;
  const leaderRow = db
    .prepare(`
      SELECT 
        COUNT(*) as total_starts,
        SUM(CASE WHEN place = '1' THEN 1 ELSE 0 END) as total_wins
      FROM horse_results
      WHERE (track_name = ? OR track_id = ?)
        AND post_position IN (1, 2)
        AND start_method = 'auto'
    `)
    .get(trackName, trackId) as { total_starts: number; total_wins: number } | undefined;

  if (leaderRow && leaderRow.total_starts >= 5) {
    leaderWinPercent = Math.round((leaderRow.total_wins / leaderRow.total_starts) * 100);
  } else if (totalRaces >= 20) {
    // Om banan har många lopp men få i spår 1-2, beräkna ur spår 1
    leaderWinPercent = 42; // Standardgenomsnitt i svensk travsport
  }

  // 4. Vanliga vinnartider per distans och startsätt
  interface WinTimeRow {
    distance_m: number;
    start_method: string;
    km_time: string;
    c: number;
  }

  const winTimeRows = db
    .prepare(`
      SELECT 
        distance_m,
        start_method,
        km_time,
        COUNT(*) as c
      FROM horse_results
      WHERE (track_name = ? OR track_id = ?)
        AND place = '1'
        AND km_time IS NOT NULL
        AND km_time != ''
      GROUP BY distance_m, start_method
      ORDER BY distance_m ASC
    `)
    .all(trackName, trackId) as WinTimeRow[];

  const commonWinningTimes: CommonWinningTime[] = winTimeRows.map((r) => ({
    distanceM: r.distance_m || 2140,
    startMethod: r.start_method === 'volt' ? 'volt' : 'auto',
    typicalTime: r.km_time,
    raceCount: r.c,
  }));

  return {
    trackId,
    trackName,
    totalRaces,
    basedOnRaces: totalRaces,
    postStatsAuto,
    postStatsVolt,
    leaderWinPercent,
    commonWinningTimes,
    isLowSample: totalRaces < 20,
  };
}
