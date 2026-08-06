CREATE TABLE IF NOT EXISTS observer_meta (
  key TEXT PRIMARY KEY NOT NULL CHECK (key = 'database_initialized_at'),
  value TEXT NOT NULL CHECK (value GLOB '????-??-??T??:??:??*Z')
) WITHOUT ROWID;

INSERT OR IGNORE INTO observer_meta (key, value)
VALUES ('database_initialized_at', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

CREATE TABLE IF NOT EXISTS crawler_counts (
  bucket_start INTEGER NOT NULL CHECK (bucket_start >= 0 AND bucket_start % 3600 = 0),
  bot_id TEXT NOT NULL CHECK (length(bot_id) BETWEEN 1 AND 80),
  bot_name TEXT NOT NULL CHECK (length(bot_name) BETWEEN 1 AND 120),
  category TEXT NOT NULL CHECK (category IN ('open_geo_self_test', 'identified_ai_crawler', 'other_automation')),
  path TEXT NOT NULL CHECK (length(path) BETWEEN 1 AND 2048 AND substr(path, 1, 1) = '/'),
  status INTEGER NOT NULL CHECK (status BETWEEN 100 AND 599),
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  PRIMARY KEY (bucket_start, bot_id, category, path, status)
) WITHOUT ROWID;
