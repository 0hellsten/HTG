-- Migration 002: Hästkort och historik för Stallbacken
-- Skapad: Fas 6
-- Stamtavla, karriärsiffror och historiska starter per häst

-- Komplettera tabellen horses med stamtavlenamn och karriärstatistik
ALTER TABLE horses ADD COLUMN sire_name TEXT;
ALTER TABLE horses ADD COLUMN dam_name TEXT;
ALTER TABLE horses ADD COLUMN damsire_name TEXT;
ALTER TABLE horses ADD COLUMN seconds INTEGER DEFAULT 0;
ALTER TABLE horses ADD COLUMN thirds INTEGER DEFAULT 0;
ALTER TABLE horses ADD COLUMN win_percentage REAL DEFAULT 0;
ALTER TABLE horses ADD COLUMN place_percentage REAL DEFAULT 0;
ALTER TABLE horses ADD COLUMN earnings_per_start INTEGER DEFAULT 0;
ALTER TABLE horses ADD COLUMN home_track TEXT;

-- Tabell för historiska starter och resultat per häst
CREATE TABLE IF NOT EXISTS horse_results (
  id TEXT PRIMARY KEY,
  horse_id TEXT NOT NULL,
  date TEXT NOT NULL,
  track_id INTEGER,
  track_name TEXT NOT NULL,
  race_id TEXT,
  race_number INTEGER,
  race_type TEXT DEFAULT 'regular',
  start_method TEXT DEFAULT 'auto',
  distance_m INTEGER,
  post_position INTEGER,
  driver_id INTEGER,
  driver_name TEXT,
  place TEXT,
  km_time TEXT,
  odds REAL,
  shoes_front INTEGER,
  shoes_back INTEGER,
  sulky_type TEXT,
  first_prize INTEGER DEFAULT 0,
  source_id TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (horse_id) REFERENCES horses (id)
);

CREATE INDEX IF NOT EXISTS idx_horse_results_horse_date ON horse_results (horse_id, date DESC);
