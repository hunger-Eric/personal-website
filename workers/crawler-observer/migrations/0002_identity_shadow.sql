CREATE TABLE IF NOT EXISTS crawler_identity_meta (
  key TEXT PRIMARY KEY NOT NULL CHECK (key = 'shadow_started_at'),
  value TEXT NOT NULL CHECK (value GLOB '????-??-??T??:??:??*Z')
) WITHOUT ROWID;

INSERT OR IGNORE INTO crawler_identity_meta (key, value)
VALUES ('shadow_started_at', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

CREATE TABLE IF NOT EXISTS crawler_rule_sets (
  source_id TEXT PRIMARY KEY NOT NULL CHECK (length(source_id) BETWEEN 1 AND 80),
  source_url TEXT NOT NULL CHECK (substr(source_url, 1, 8) = 'https://'),
  prefixes_json TEXT CHECK (prefixes_json IS NULL OR json_valid(prefixes_json)),
  content_sha256 TEXT CHECK (content_sha256 IS NULL OR length(content_sha256) = 64),
  source_created_at TEXT,
  last_attempt_at TEXT NOT NULL CHECK (last_attempt_at GLOB '????-??-??T??:??:??*Z'),
  last_success_at TEXT,
  last_error_code TEXT CHECK (last_error_code IS NULL OR last_error_code IN (
    'fetch_failed', 'http_status', 'response_too_large', 'invalid_json',
    'invalid_schema', 'invalid_cidr', 'empty_prefixes'
  )),
  CHECK (
    (prefixes_json IS NULL AND content_sha256 IS NULL AND source_created_at IS NULL AND last_success_at IS NULL)
    OR
    (prefixes_json IS NOT NULL AND content_sha256 IS NOT NULL AND source_created_at IS NOT NULL AND last_success_at IS NOT NULL)
  )
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS crawler_identity_counts (
  bucket_start INTEGER NOT NULL CHECK (bucket_start >= 0 AND bucket_start % 3600 = 0),
  bot_id TEXT NOT NULL CHECK (length(bot_id) BETWEEN 1 AND 80),
  bot_name TEXT NOT NULL CHECK (length(bot_name) BETWEEN 1 AND 120),
  provider_id TEXT NOT NULL CHECK (length(provider_id) BETWEEN 1 AND 80),
  provider_name TEXT NOT NULL CHECK (length(provider_name) BETWEEN 1 AND 120),
  region TEXT NOT NULL CHECK (region IN ('global', 'cn')),
  purpose TEXT NOT NULL CHECK (purpose IN ('ai_training', 'ai_search', 'user_fetch', 'search_index', 'self_test', 'unknown')),
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified_official', 'declared_unverified', 'suspected_spoof', 'other_automation')),
  verification_method TEXT NOT NULL CHECK (verification_method IN ('official_ip_range', 'signed_hmac', 'ua_only', 'generic_bot')),
  path TEXT NOT NULL CHECK (length(path) BETWEEN 1 AND 2048 AND substr(path, 1, 1) = '/'),
  status INTEGER NOT NULL CHECK (status BETWEEN 100 AND 599),
  count INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  PRIMARY KEY (
    bucket_start, bot_id, provider_id, purpose, verification_status,
    verification_method, path, status
  )
) WITHOUT ROWID;
