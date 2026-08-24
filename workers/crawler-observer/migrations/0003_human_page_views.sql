CREATE TABLE IF NOT EXISTS human_page_meta (
  key TEXT PRIMARY KEY NOT NULL CHECK (key = 'tracking_started_at'),
  value TEXT NOT NULL CHECK (value GLOB '????-??-??T??:??:??*Z')
) WITHOUT ROWID;

INSERT OR IGNORE INTO human_page_meta (key, value)
VALUES ('tracking_started_at', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

CREATE TABLE IF NOT EXISTS human_page_counts (
  bucket_start INTEGER NOT NULL CHECK (bucket_start >= 0 AND bucket_start % 3600 = 0),
  path TEXT NOT NULL CHECK (length(path) BETWEEN 1 AND 2048 AND substr(path, 1, 1) = '/'),
  status INTEGER NOT NULL CHECK (status BETWEEN 100 AND 599),
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  PRIMARY KEY (bucket_start, path, status)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS human_client_counts (
  bucket_start INTEGER NOT NULL CHECK (bucket_start >= 0 AND bucket_start % 3600 = 0),
  device_type TEXT NOT NULL CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'other')),
  browser TEXT NOT NULL CHECK (browser IN ('chrome', 'safari', 'edge', 'firefox', 'wechat', 'samsung_internet', 'other')),
  operating_system TEXT NOT NULL CHECK (operating_system IN ('windows', 'macos', 'ios', 'android', 'linux', 'chromeos', 'other')),
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  PRIMARY KEY (bucket_start, device_type, browser, operating_system)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS human_location_counts (
  bucket_start INTEGER NOT NULL CHECK (bucket_start >= 0 AND bucket_start % 3600 = 0),
  country_code TEXT NOT NULL CHECK (country_code = 'XX' OR country_code GLOB '[A-Z][A-Z]'),
  region_code TEXT NOT NULL CHECK (length(region_code) BETWEEN 1 AND 16),
  region_name TEXT NOT NULL CHECK (length(region_name) BETWEEN 1 AND 80),
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  PRIMARY KEY (bucket_start, country_code, region_code, region_name)
) WITHOUT ROWID;
