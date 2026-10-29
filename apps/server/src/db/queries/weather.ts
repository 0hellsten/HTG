// Databasfrågor för banväder från SMHI
// Stallbacken — HTG

import Database from 'better-sqlite3';
import { TrackWeather } from '@stallbacken/shared';

export interface DbWeatherInput {
  trackId: string;
  observedAt: string;
  tempC: number;
  windMs: number;
  precipMm: number;
  symbolCode?: number;
  description: string;
  sourceId: string;
}

/**
 * Sparar eller uppdaterar en väderobservation för en bana.
 */
export function saveWeatherObservation(db: Database.Database, w: DbWeatherInput): void {
  const stmt = db.prepare(`
    INSERT INTO weather (track_id, observed_at, temp_c, wind_ms, precip_mm, description, source_id, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(track_id, observed_at) DO UPDATE SET
      temp_c = excluded.temp_c,
      wind_ms = excluded.wind_ms,
      precip_mm = excluded.precip_mm,
      description = excluded.description,
      source_id = excluded.source_id,
      updated_at = datetime('now')
  `);

  stmt.run(
    w.trackId,
    w.observedAt,
    w.tempC,
    w.windMs,
    w.precipMm,
    w.description,
    w.sourceId
  );
}

/**
 * Hämtar senaste sparade väderobservation för en bana.
 */
export function getLatestWeatherForTrack(
  db: Database.Database,
  trackId: string
): TrackWeather | null {
  interface WeatherRow {
    track_id: string;
    track_name: string | null;
    observed_at: string;
    temp_c: number;
    wind_ms: number;
    precip_mm: number;
    description: string;
    source_id: string;
  }

  const row = db
    .prepare(`
      SELECT 
        w.track_id,
        t.name as track_name,
        w.observed_at,
        w.temp_c,
        w.wind_ms,
        w.precip_mm,
        w.description,
        w.source_id
      FROM weather w
      LEFT JOIN tracks t ON w.track_id = t.id
      WHERE w.track_id = ?
      ORDER BY w.observed_at DESC
      LIMIT 1
    `)
    .get(trackId) as WeatherRow | undefined;

  if (!row) return null;

  return {
    trackId: row.track_id,
    trackName: row.track_name || undefined,
    observedAt: row.observed_at,
    tempC: row.temp_c,
    windMs: row.wind_ms,
    precipMm: row.precip_mm,
    symbolCode: 1,
    description: row.description,
    sourceId: row.source_id,
  };
}
