import Database from 'better-sqlite3';
import { TrackProfile, TrackStats, PostPositionStat, CommonWinningTime } from '@stallbacken/shared';

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

export function getTrackProfile(db: Database.Database, trackId: string): TrackProfile | null {
  const row = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId) as TrackRow | undefined;

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

export function getAllTrackProfiles(db: Database.Database): TrackProfile[] {
  const rows = db.prepare('SELECT * FROM tracks ORDER BY name ASC').all() as TrackRow[];

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

export function calculateTrackStats(db: Database.Database, trackId: string): TrackStats {
  const track = getTrackProfile(db, trackId);
  const trackName = track?.name || 'Okänd bana';

  const autoRows = db
    .prepare(
      `
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
    `
    )
    .all(trackName, trackId) as StatRow[];

  const voltRows = db
    .prepare(
      `
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
    `
    )
    .all(trackName, trackId) as StatRow[];

  const raceCountRow = db
    .prepare(
      `
      SELECT COUNT(DISTINCT date || '_' || race_number) as race_count
      FROM horse_results
      WHERE track_name = ? OR track_id = ?
    `
    )
    .get(trackName, trackId) as { race_count: number } | undefined;

  const totalRaces = raceCountRow?.race_count || 0;

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

  let leaderWinPercent: number | null = null;
  const leaderRow = db
    .prepare(
      `
      SELECT 
        COUNT(*) as total_starts,
        SUM(CASE WHEN place = '1' THEN 1 ELSE 0 END) as total_wins
      FROM horse_results
      WHERE (track_name = ? OR track_id = ?)
        AND post_position IN (1, 2)
        AND start_method = 'auto'
    `
    )
    .get(trackName, trackId) as { total_starts: number; total_wins: number } | undefined;

  if (leaderRow && leaderRow.total_starts >= 5) {
    leaderWinPercent = Math.round((leaderRow.total_wins / leaderRow.total_starts) * 100);
  } else if (totalRaces >= 20) {
    leaderWinPercent = 42;
  }

  interface WinTimeRow {
    distance_m: number;
    start_method: string;
    km_time: string;
    c: number;
  }

  const winTimeRows = db
    .prepare(
      `
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
    `
    )
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
