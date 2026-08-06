import ipaddr from "ipaddr.js";
import type { RuleSourceId } from "./identity";

const MAX_RESPONSE_BYTES = 256 * 1024;
const MAX_RULE_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const RULE_REFRESH_MS = 24 * 60 * 60 * 1000;
const RULE_RETRY_MS = 15 * 60 * 1000;

export type RuleSyncErrorCode =
  | "fetch_failed" | "http_status" | "response_too_large" | "invalid_json"
  | "invalid_schema" | "invalid_cidr" | "empty_prefixes";

export type OfficialRuleSource = { id: RuleSourceId; url: string };
export type ParsedRuleSet = { creationTime: string; prefixes: string[] };
export type UsableRuleSet = ParsedRuleSet & {
  sourceId: RuleSourceId;
  lastSuccessAt: string;
  usingLastKnownGood: boolean;
};

export const OPENAI_RULE_SOURCES: readonly OfficialRuleSource[] = [
  { id: "openai_gptbot", url: "https://openai.com/gptbot.json" },
  { id: "openai_searchbot", url: "https://openai.com/searchbot.json" },
  { id: "openai_chatgpt_user", url: "https://openai.com/chatgpt-user.json" },
];

export const PERPLEXITY_RULE_SOURCES: readonly OfficialRuleSource[] = [
  { id: "perplexity_bot", url: "https://www.perplexity.com/perplexitybot.json" },
  { id: "perplexity_user", url: "https://www.perplexity.com/perplexity-user.json" },
];

const ALL_RULE_SOURCES: readonly OfficialRuleSource[] = [
  ...OPENAI_RULE_SOURCES,
  ...PERPLEXITY_RULE_SOURCES,
];

const FIXED_REDIRECTS: Partial<Record<RuleSourceId, string>> = {
  perplexity_bot: "https://www.perplexity.ai/perplexitybot.json",
  perplexity_user: "https://www.perplexity.ai/perplexity-user.json",
};

type RuleSyncState = { source_id: string; last_attempt_at: string | null; last_success_at: string | null };

function prefixFrom(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { ipv4Prefix?: unknown; ipv6Prefix?: unknown };
  const ipv4 = typeof row.ipv4Prefix === "string" ? row.ipv4Prefix : null;
  const ipv6 = typeof row.ipv6Prefix === "string" ? row.ipv6Prefix : null;
  return (ipv4 === null) === (ipv6 === null) ? null : (ipv4 ?? ipv6);
}

export function parseOfficialPrefixPayload(value: unknown): ParsedRuleSet {
  if (!value || typeof value !== "object") throw new Error("invalid_schema");
  const body = value as { creationTime?: unknown; prefixes?: unknown };
  if (typeof body.creationTime !== "string" || Number.isNaN(Date.parse(body.creationTime)) || !Array.isArray(body.prefixes)) {
    throw new Error("invalid_schema");
  }
  const parsedRows = body.prefixes.map(prefixFrom);
  if (parsedRows.some((prefix) => prefix === null)) throw new Error("invalid_schema");
  const prefixes = [...new Set(parsedRows as string[])].sort();
  if (prefixes.length === 0) throw new Error("empty_prefixes");
  for (const prefix of prefixes) {
    try { ipaddr.parseCIDR(prefix); } catch { throw new Error("invalid_cidr"); }
  }
  return { creationTime: new Date(body.creationTime).toISOString(), prefixes };
}

export function isIpInPrefixes(ip: string, prefixes: readonly string[]): boolean {
  let address: ReturnType<typeof ipaddr.process>;
  try { address = ipaddr.process(ip); } catch { return false; }
  return prefixes.some((prefix) => {
    const [network, length] = ipaddr.parseCIDR(prefix);
    return address.kind() === network.kind() && address.match(network, length);
  });
}

function iso(now: Date): string { return now.toISOString(); }

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function errorCode(error: unknown): RuleSyncErrorCode {
  const code = error instanceof Error ? error.message : "fetch_failed";
  return ["http_status", "response_too_large", "invalid_json", "invalid_schema", "invalid_cidr", "empty_prefixes"].includes(code)
    ? code as RuleSyncErrorCode : "fetch_failed";
}

function requestOptions(redirect: "error" | "follow" | "manual"): RequestInit {
  return {
    method: "GET",
    redirect,
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  };
}

async function fetchOfficialSource(source: OfficialRuleSource, fetcher: typeof fetch): Promise<Response> {
  let response = await fetcher(source.url, requestOptions("manual"));
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get("location");
    const target = location ? new URL(location, source.url).toString() : null;
    if (!target || target !== FIXED_REDIRECTS[source.id]) throw new Error("unsafe_redirect");
    response = await fetcher(target, requestOptions("error"));
  }
  return response;
}

export async function syncRuleSource(
  db: D1Database,
  source: OfficialRuleSource,
  fetcher: typeof fetch = fetch,
  now = new Date(),
): Promise<void> {
  try {
    const response = await fetchOfficialSource(source, fetcher);
    if (!response.ok) throw new Error("http_status");
    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_RESPONSE_BYTES) throw new Error("response_too_large");
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) throw new Error("response_too_large");
    let body: unknown;
    try { body = JSON.parse(text); } catch { throw new Error("invalid_json"); }
    const parsed = parseOfficialPrefixPayload(body);
    const prefixesJson = JSON.stringify(parsed.prefixes);
    await db.prepare(
      "INSERT INTO crawler_rule_sets (source_id, source_url, prefixes_json, content_sha256, source_created_at, last_attempt_at, last_success_at, last_error_code) VALUES (?, ?, ?, ?, ?, ?, ?, NULL) ON CONFLICT(source_id) DO UPDATE SET source_url = excluded.source_url, prefixes_json = excluded.prefixes_json, content_sha256 = excluded.content_sha256, source_created_at = excluded.source_created_at, last_attempt_at = excluded.last_attempt_at, last_success_at = excluded.last_success_at, last_error_code = NULL"
    ).bind(source.id, source.url, prefixesJson, await sha256(prefixesJson), parsed.creationTime, iso(now), iso(now)).run();
  } catch (error) {
    await db.prepare(
      "INSERT INTO crawler_rule_sets (source_id, source_url, prefixes_json, content_sha256, source_created_at, last_attempt_at, last_success_at, last_error_code) VALUES (?, ?, NULL, NULL, NULL, ?, NULL, ?) ON CONFLICT(source_id) DO UPDATE SET source_url = excluded.source_url, last_attempt_at = excluded.last_attempt_at, last_error_code = excluded.last_error_code"
    ).bind(source.id, source.url, iso(now), errorCode(error)).run();
  }
}

export async function syncOpenAiRuleSources(
  db: D1Database,
  fetcher: typeof fetch = fetch,
  now = new Date(),
): Promise<void> {
  for (const source of OPENAI_RULE_SOURCES) await syncRuleSource(db, source, fetcher, now);
}

export async function syncPerplexityRuleSources(
  db: D1Database,
  fetcher: typeof fetch = fetch,
  now = new Date(),
): Promise<void> {
  for (const source of PERPLEXITY_RULE_SOURCES) await syncRuleSource(db, source, fetcher, now);
}

export async function ensureOfficialRuleSources(
  db: D1Database,
  fetcher: typeof fetch = fetch,
  now = new Date(),
): Promise<void> {
  const rows = await db.prepare(
    "SELECT source_id, last_attempt_at, last_success_at FROM crawler_rule_sets",
  ).all<RuleSyncState>();
  const bySource = new Map(rows.results.map((row) => [row.source_id, row]));
  const due = ALL_RULE_SOURCES.filter((source) => ruleSourceDue(bySource.get(source.id), now));
  await Promise.all(due.map((source) => syncRuleSource(db, source, fetcher, now)));
}

function ruleSourceDue(row: RuleSyncState | undefined, now: Date): boolean {
  const nowMs = now.getTime();
  const lastSuccessMs = row?.last_success_at ? Date.parse(row.last_success_at) : Number.NaN;
  const successAge = nowMs - lastSuccessMs;
  if (Number.isFinite(lastSuccessMs) && successAge >= 0 && successAge < RULE_REFRESH_MS) return false;
  const lastAttemptMs = row?.last_attempt_at ? Date.parse(row.last_attempt_at) : Number.NaN;
  const attemptAge = nowMs - lastAttemptMs;
  return !Number.isFinite(lastAttemptMs) || attemptAge < 0 || attemptAge >= RULE_RETRY_MS;
}

export async function ensureOfficialRuleSource(
  db: D1Database,
  sourceId: RuleSourceId,
  fetcher: typeof fetch = fetch,
  now = new Date(),
): Promise<void> {
  const source = ALL_RULE_SOURCES.find((candidate) => candidate.id === sourceId);
  if (!source) return;
  const row = await db.prepare(
    "SELECT source_id, last_attempt_at, last_success_at FROM crawler_rule_sets WHERE source_id = ?",
  ).bind(sourceId).first<RuleSyncState>();
  if (ruleSourceDue(row ?? undefined, now)) await syncRuleSource(db, source, fetcher, now);
}

export async function loadUsableRuleSet(db: D1Database, sourceId: RuleSourceId, now = new Date()): Promise<UsableRuleSet | null> {
  const row = await db.prepare("SELECT prefixes_json, source_created_at, last_success_at FROM crawler_rule_sets WHERE source_id = ?").bind(sourceId).first<{ prefixes_json: string | null; source_created_at: string | null; last_success_at: string | null }>();
  if (!row?.prefixes_json || !row.source_created_at || !row.last_success_at) return null;
  const age = now.getTime() - Date.parse(row.last_success_at);
  if (!Number.isFinite(age) || age < 0 || age > MAX_RULE_AGE_MS) return null;
  let prefixes: unknown;
  try { prefixes = JSON.parse(row.prefixes_json); } catch { return null; }
  if (!Array.isArray(prefixes) || prefixes.length === 0 || prefixes.some((prefix) => typeof prefix !== "string")) return null;
  try { for (const prefix of prefixes) ipaddr.parseCIDR(prefix); } catch { return null; }
  return {
    sourceId,
    creationTime: row.source_created_at,
    prefixes: prefixes as string[],
    lastSuccessAt: row.last_success_at,
    usingLastKnownGood: age >= 24 * 60 * 60 * 1000,
  };
}
