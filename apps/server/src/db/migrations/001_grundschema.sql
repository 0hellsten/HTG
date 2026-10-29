-- Migration 001: Grundschema för Stallbacken
-- Skapad: Fas 2
-- Alla tabeller har created_at och updated_at
-- Alla hämtade tabeller har source_id och fetched_at

-- Banor
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  length_m INTEGER,
  surface TEXT,
  covered INTEGER DEFAULT 0,
  source_id TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tävlingsdagar
CREATE TABLE IF NOT EXISTS race_days (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  track_id TEXT NOT NULL,
  biggest_game TEXT,
  first_start TEXT,
  source_id TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (track_id) REFERENCES tracks (id)
);

-- Lopp
CREATE TABLE IF NOT EXISTS races (
  id TEXT PRIMARY KEY,
  race_day_id TEXT NOT NULL,
  number INTEGER NOT NULL,
  name TEXT,
  distance_m INTEGER,
  start_method TEXT,
  purse TEXT,
  terms TEXT,
  status TEXT,
  scheduled_start TEXT,
  actual_start TEXT,
  track_condition TEXT,
  source_id TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (race_day_id) REFERENCES race_days (id)
);

CREATE INDEX IF NOT EXISTS idx_races_race_day ON races (race_day_id);

-- Hästar
CREATE TABLE IF NOT EXISTS horses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nationality TEXT,
  birth_year INTEGER,
  sex TEXT,
  color TEXT,
  breed TEXT,
  trainer_id TEXT,
  owner TEXT,
  breeder TEXT,
  sire_id TEXT,
  dam_id TEXT,
  damsire_id TEXT,
  earnings_total INTEGER DEFAULT 0,
  record_auto TEXT,
  record_volt TEXT,
  starts INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  places INTEGER DEFAULT 0,
  source_id TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Personer (kuskar, tränare)
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  license TEXT,
  source_id TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Starter: en rad per häst och lopp
CREATE TABLE IF NOT EXISTS starts (
  id TEXT PRIMARY KEY,
  race_id TEXT NOT NULL,
  horse_id TEXT NOT NULL,
  start_number INTEGER NOT NULL,
  post_position INTEGER,
  handicap_m INTEGER DEFAULT 0,
  driver_id TEXT,
  trainer_id TEXT,
  shoes_front INTEGER,
  shoes_back INTEGER,
  shoes_changed INTEGER DEFAULT 0,
  sulky_type TEXT,
  sulky_color TEXT,
  scratched INTEGER DEFAULT 0,
  scratch_reason TEXT,
  finish_position INTEGER,
  finish_code TEXT,
  km_time TEXT,
  total_time TEXT,
  margin TEXT,
  prize_money INTEGER DEFAULT 0,
  source_id TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (race_id) REFERENCES races (id),
  FOREIGN KEY (horse_id) REFERENCES horses (id)
);

CREATE INDEX IF NOT EXISTS idx_starts_race ON starts (race_id);
CREATE INDEX IF NOT EXISTS idx_starts_horse ON starts (horse_id);

-- Odds och streck: tidsserie
CREATE TABLE IF NOT EXISTS odds (
  start_id TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  win_odds REAL,
  place_odds REAL,
  stake_percent REAL,
  game_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (start_id, recorded_at, game_type),
  FOREIGN KEY (start_id) REFERENCES starts (id)
);

-- Tips: en rad per tipsgivare och start
CREATE TABLE IF NOT EXISTS tips (
  id TEXT PRIMARY KEY,
  race_id TEXT NOT NULL,
  start_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  rank INTEGER,
  comment TEXT,
  published_at TEXT,
  source_id TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (race_id) REFERENCES races (id),
  FOREIGN KEY (start_id) REFERENCES starts (id)
);

-- Väder vid banan
CREATE TABLE IF NOT EXISTS weather (
  track_id TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  temp_c REAL,
  wind_ms REAL,
  precip_mm REAL,
  description TEXT,
  source_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (track_id, observed_at),
  FOREIGN KEY (track_id) REFERENCES tracks (id)
);

-- Favoriter (Mitt stall)
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Källhälsa: grunden för alla prickar och för sidan "Hur färskt är det här?"
CREATE TABLE IF NOT EXISTS source_health (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  status TEXT NOT NULL,
  attempted_at TEXT NOT NULL,
  succeeded_at TEXT,
  age_seconds INTEGER NOT NULL DEFAULT 0,
  message TEXT NOT NULL,
  detail TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  paused_until TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_source_health_source ON source_health (source_id, attempted_at DESC);

-- Rå cache för att slippa hämta om
CREATE TABLE IF NOT EXISTS raw_cache (
  url TEXT PRIMARY KEY,
  etag TEXT,
  last_modified TEXT,
  body TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
