-- Migration 003: Banfakta, banprofiler och redaktionella tips
-- Skapad: Fas 8
-- Kompletta banfakta för svenska travbanor samt utökat tipsstöd

-- Lägg till banprofilfält i tabellen tracks
ALTER TABLE tracks ADD COLUMN stretch_m INTEGER;
ALTER TABLE tracks ADD COLUMN open_stretch_lanes INTEGER DEFAULT 0;
ALTER TABLE tracks ADD COLUMN angled_wing INTEGER DEFAULT 0;
ALTER TABLE tracks ADD COLUMN lat REAL;
ALTER TABLE tracks ADD COLUMN lon REAL;

-- Tabell för redaktionella artiklar och övergripande speltips (RSS/nyheter)
CREATE TABLE IF NOT EXISTS tip_articles (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  author TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  url TEXT,
  published_at TEXT NOT NULL,
  source_id TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tip_articles_published ON tip_articles (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_tips_race ON tips (race_id);

-- Skapa referensbanor med officiella banfakta och koordinater för SMHI-väder
INSERT INTO tracks (id, name, country, length_m, stretch_m, surface, covered, open_stretch_lanes, angled_wing, lat, lon, source_id, fetched_at)
VALUES
  ('1', 'Solvalla', 'SE', 1000, 196, 'Grus', 0, 0, 0, 59.369, 17.939, 'system', datetime('now')),
  ('6', 'Åby', 'SE', 1000, 180, 'Grus', 0, 2, 1, 57.651, 12.004, 'system', datetime('now')),
  ('7', 'Jägersro', 'SE', 1000, 190, 'Grus', 0, 0, 0, 55.578, 13.064, 'system', datetime('now')),
  ('8', 'Axevalla', 'SE', 1000, 227, 'Grus', 0, 0, 0, 58.384, 13.565, 'system', datetime('now')),
  ('9', 'Bergsåker', 'SE', 1000, 200, 'Grus', 0, 0, 0, 62.417, 17.248, 'system', datetime('now')),
  ('11', 'Boden', 'SE', 1000, 200, 'Grus', 0, 0, 0, 65.815, 21.688, 'system', datetime('now')),
  ('12', 'Bollnäs', 'SE', 1000, 207, 'Grus', 0, 0, 0, 61.353, 16.398, 'system', datetime('now')),
  ('13', 'Dannero', 'SE', 1000, 200, 'Grus', 0, 0, 0, 62.973, 17.760, 'system', datetime('now')),
  ('14', 'Eskilstuna', 'SE', 1000, 182, 'Grus', 0, 0, 0, 59.439, 16.634, 'system', datetime('now')),
  ('15', 'Färjestad', 'SE', 1000, 177, 'Grus', 0, 0, 0, 59.412, 13.541, 'system', datetime('now')),
  ('16', 'Gävle', 'SE', 1000, 178, 'Grus', 0, 0, 0, 60.672, 17.118, 'system', datetime('now')),
  ('17', 'Hagmyren', 'SE', 1000, 161, 'Grus', 0, 0, 0, 61.713, 17.060, 'system', datetime('now')),
  ('18', 'Halmstad', 'SE', 1000, 203, 'Grus', 0, 0, 0, 56.685, 12.898, 'system', datetime('now')),
  ('19', 'Kalmar', 'SE', 1000, 207, 'Grus', 0, 0, 0, 56.683, 16.326, 'system', datetime('now')),
  ('21', 'Lindesberg', 'SE', 1000, 192, 'Grus', 0, 0, 0, 59.623, 15.223, 'system', datetime('now')),
  ('22', 'Mantorp', 'SE', 1000, 177, 'Grus', 0, 0, 0, 58.360, 15.289, 'system', datetime('now')),
  ('23', 'Romme', 'SE', 1000, 205, 'Grus', 0, 0, 0, 60.441, 15.513, 'system', datetime('now')),
  ('24', 'Rättvik', 'SE', 1000, 187, 'Grus', 0, 0, 0, 60.893, 15.116, 'system', datetime('now')),
  ('25', 'Skellefteå', 'SE', 1000, 175, 'Grus', 0, 1, 0, 64.743, 21.037, 'system', datetime('now')),
  ('26', 'Solänget', 'SE', 1000, 193, 'Grus', 0, 1, 0, 63.308, 18.665, 'system', datetime('now')),
  ('27', 'Tingsryd', 'SE', 1609, 285, 'Grus', 0, 0, 0, 56.529, 14.978, 'system', datetime('now')),
  ('28', 'Umåker', 'SE', 1000, 211, 'Grus', 0, 0, 0, 63.805, 20.252, 'system', datetime('now')),
  ('29', 'Visby', 'SE', 1020, 156, 'Grus', 0, 0, 0, 57.618, 18.358, 'system', datetime('now')),
  ('30', 'Åmål', 'SE', 800, 105, 'Grus', 0, 1, 0, 59.049, 12.686, 'system', datetime('now')),
  ('31', 'Årjäng', 'SE', 1000, 205, 'Grus', 0, 0, 0, 59.390, 12.133, 'system', datetime('now')),
  ('32', 'Örebro', 'SE', 1000, 175, 'Grus', 0, 0, 0, 59.255, 15.228, 'system', datetime('now')),
  ('33', 'Östersund', 'SE', 1000, 218, 'Grus', 0, 0, 0, 63.189, 14.659, 'system', datetime('now')),
  ('35', 'Hoting', 'SE', 800, 160, 'Grus', 0, 0, 0, 64.116, 16.208, 'system', datetime('now')),
  ('36', 'Oviken', 'SE', 800, 140, 'Grus', 0, 0, 0, 62.996, 14.341, 'system', datetime('now')),
  ('37', 'Lycksele', 'SE', 1000, 200, 'Grus', 0, 0, 0, 64.595, 18.694, 'system', datetime('now')),
  ('38', 'Karlshamn', 'SE', 800, 157, 'Grus', 0, 0, 0, 56.173, 14.858, 'system', datetime('now')),
  ('39', 'Arvika', 'SE', 800, 114, 'Grus', 0, 1, 0, 59.663, 12.597, 'system', datetime('now')),
  ('43', 'Vaggeryd', 'SE', 1004, 200, 'Grus', 0, 0, 0, 57.502, 14.150, 'system', datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  length_m = excluded.length_m,
  stretch_m = excluded.stretch_m,
  surface = excluded.surface,
  open_stretch_lanes = excluded.open_stretch_lanes,
  angled_wing = excluded.angled_wing,
  lat = excluded.lat,
  lon = excluded.lon;
