import bots from "@geosuite/ai-crawler-bots/bots.json";
import { isBot } from "isbot";
import { classifyIdentity, type VerificationStatus } from "./identity";
import { ensureOfficialRuleSources, syncOpenAiRuleSources, syncPerplexityRuleSources } from "./official-ip-rules";

const encoder = new TextEncoder();
const HOUR_SECONDS = 3600;
const RETENTION_DAYS = 90;
const HOST = "me.itheheda.online";
const CUSTOM_DOMAIN_HOST = "crawler-observer.itheheda.online";
const READ_PATH = "/_crawler-observer/v1/analytics";
const READ_HOSTS = new Set([HOST, CUSTOM_DOMAIN_HOST]);
const RULE_SOURCE_IDS = ["openai_gptbot", "openai_searchbot", "openai_chatgpt_user", "perplexity_bot", "perplexity_user"] as const;

type Category = "open_geo_self_test" | "identified_ai_crawler" | "other_automation";
type Classification = { id: string; name: string; category: Category; openGeoVerified: boolean };
type Row = Record<string, unknown>;
type RuleState = "fresh" | "last_known_good" | "unavailable";
type HumanClient = {
  deviceType: "desktop" | "mobile" | "tablet" | "other";
  browser: "chrome" | "safari" | "edge" | "firefox" | "wechat" | "samsung_internet" | "other";
  operatingSystem: "windows" | "macos" | "ios" | "android" | "linux" | "chromeos" | "other";
};
type HumanLocation = { countryCode: string; regionCode: string; regionName: string };
type ObserverEnv = Pick<Env, "DB" | "OPEN_GEO_SELF_TEST_SECRET" | "OBSERVER_READ_SECRET">;
type OriginFetch = (request: Request) => Promise<Response>;

const knownBots = bots
  .filter((bot) => bot.uaToken !== null)
  .map((bot) => ({ id: bot.id, name: bot.name, token: bot.uaToken.toLowerCase() }))
  .sort((a, b) => b.token.length - a.token.length);

export function nowSeconds(now = Date.now()): number {
  return Math.floor(now / 1000);
}

export function bucketStart(now = Date.now()): number {
  return Math.floor(nowSeconds(now) / HOUR_SECONDS) * HOUR_SECONDS;
}

function iso(seconds: number): string {
  return new Date(seconds * 1000).toISOString();
}

function decodedSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function opaqueToken(segment: string): boolean {
  return /^[a-f0-9]{32,}$/i.test(segment) || (/^[A-Za-z0-9_-]{32,}$/.test(segment) && /\d/.test(segment) && /[A-Z]/.test(segment) && /[a-z]/.test(segment));
}

export function observedPath(pathname: string): string {
  if (pathname.length > 2048) return "/__path_too_long__";
  const sensitiveOperation = new Set(["reset", "invite", "verify", "magic-link", "password-reset"]);
  let redactNext = false;
  const normalized = pathname.split("/").map((segment) => {
    if (!segment) return segment;
    const decoded = decodedSegment(segment);
    if (redactNext) {
      redactNext = false;
      return ":token";
    }
    if (sensitiveOperation.has(decoded.toLowerCase())) {
      redactNext = true;
      return segment;
    }
    if (/^[^/\s@]+@[^/\s@]+\.[^/\s@]+$/.test(decoded)) return ":email";
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(decoded)) return ":uuid";
    if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(decoded) || opaqueToken(decoded)) return ":token";
    return segment;
  });
  return normalized.join("/") || "/";
}

export function excluded(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/_crawler-observer")
  );
}

function base64UrlBytes(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) return null;
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    const canonical = btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
    return bytes.length === 32 && canonical === value ? bytes : null;
  } catch {
    return null;
  }
}

export async function validHmac(
  secret: string,
  timestamp: string | null,
  signature: string | null,
  canonical: string,
  now = Date.now(),
): Promise<boolean> {
  if (!secret || !timestamp || !signature || !/^\d+$/.test(timestamp)) return false;
  const timestampSeconds = Number(timestamp);
  if (!Number.isSafeInteger(timestampSeconds) || Math.abs(nowSeconds(now) - timestampSeconds) > 300) return false;
  const signatureBytes = base64UrlBytes(signature);
  if (!signatureBytes) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(canonical));
}

export async function classify(request: Request, env: Pick<ObserverEnv, "OPEN_GEO_SELF_TEST_SECRET">, now = Date.now()): Promise<Classification | null> {
  const url = new URL(request.url);
  const timestamp = request.headers.get("X-OpenGeo-Timestamp");
  const canonical = `v1\nself-test\n${timestamp ?? ""}\n${request.method}\n${url.hostname.toLowerCase()}\n${url.pathname}`;
  if (await validHmac(env.OPEN_GEO_SELF_TEST_SECRET, timestamp, request.headers.get("X-OpenGeo-Signature"), canonical, now)) {
    return { id: "open-geo-self-test", name: "Open GEO self-test", category: "open_geo_self_test", openGeoVerified: true };
  }

  const userAgent = request.headers.get("User-Agent") ?? "";
  const normalizedUserAgent = userAgent.toLowerCase();
  if (normalizedUserAgent.includes("opengeoconsolebot") || normalizedUserAgent.includes("opengeoconsole/")) {
    return { id: "open-geo-declared-test", name: "Open GEO test (unverified)", category: "other_automation", openGeoVerified: false };
  }
  const known = knownBots.find((bot) => userAgent.toLowerCase().includes(bot.token));
  if (known) return { ...known, category: "identified_ai_crawler", openGeoVerified: false };
  return isBot(userAgent) ? { id: "other-bot", name: "Other automation bot", category: "other_automation", openGeoVerified: false } : null;
}

function openGeoStaticAsset(pathname: string): boolean {
  return /\.(?:avif|css|gif|ico|jpe?g|js|map|png|svg|ttf|webp|woff2?)$/i.test(pathname);
}

function safeLog(error: unknown): void {
  console.error(JSON.stringify({ event: "crawler_observer_error", code: error instanceof Error ? error.name : "unknown" }));
}

function likelyHumanPageView(request: Request, originResponse: Response): boolean {
  if (request.method !== "GET") return false;
  if (!(originResponse.headers.get("Content-Type") ?? "").toLowerCase().startsWith("text/html")) return false;
  const userAgent = request.headers.get("User-Agent") ?? "";
  return userAgent.startsWith("Mozilla/5.0") && /(?:Chrome|CriOS|Firefox|FxiOS|Safari|Edg|OPR)\//.test(userAgent);
}

function classifyHumanClient(userAgent: string): HumanClient {
  const deviceType: HumanClient["deviceType"] = /iPad|Android(?!.*Mobile)/i.test(userAgent)
    ? "tablet"
    : /iPhone|iPod|Mobile|Android/i.test(userAgent)
      ? "mobile"
      : userAgent.startsWith("Mozilla/5.0")
        ? "desktop"
        : "other";
  const browser: HumanClient["browser"] = /MicroMessenger\//i.test(userAgent)
    ? "wechat"
    : /SamsungBrowser\//i.test(userAgent)
      ? "samsung_internet"
      : /Edg(?:A|iOS)?\//i.test(userAgent)
        ? "edge"
        : /(?:Firefox|FxiOS)\//i.test(userAgent)
          ? "firefox"
          : /(?:Chrome|CriOS)\//i.test(userAgent)
            ? "chrome"
            : /Safari\//i.test(userAgent)
              ? "safari"
              : "other";
  const operatingSystem: HumanClient["operatingSystem"] = /iPhone|iPad|iPod/i.test(userAgent)
    ? "ios"
    : /Android/i.test(userAgent)
      ? "android"
      : /Windows NT/i.test(userAgent)
        ? "windows"
        : /CrOS/i.test(userAgent)
          ? "chromeos"
          : /Mac OS X/i.test(userAgent)
            ? "macos"
            : /Linux/i.test(userAgent)
              ? "linux"
              : "other";
  return { deviceType, browser, operatingSystem };
}

function classifyHumanLocation(request: Request): HumanLocation {
  const cf = request.cf as { country?: unknown; regionCode?: unknown; region?: unknown } | undefined;
  const country = typeof cf?.country === "string" ? cf.country.toUpperCase() : "";
  const regionCode = typeof cf?.regionCode === "string" ? cf.regionCode.toUpperCase() : "";
  const regionName = typeof cf?.region === "string" ? cf.region.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 80) : "";
  return {
    countryCode: /^[A-Z]{2}$/.test(country) ? country : "XX",
    regionCode: /^[A-Z0-9-]{1,16}$/.test(regionCode) ? regionCode : "unknown",
    regionName: regionName || "Unknown",
  };
}

async function observe(request: Request, originResponse: Response, env: ObserverEnv): Promise<void> {
  const url = new URL(request.url);
  if (excluded(url.pathname)) return;
  const item = await classify(request, env);
  if (!item) {
    if (!likelyHumanPageView(request, originResponse)) return;
    const client = classifyHumanClient(request.headers.get("User-Agent") ?? "");
    const location = classifyHumanLocation(request);
    await env.DB.prepare(
      "INSERT INTO human_page_counts (bucket_start, path, status, count) VALUES (?, ?, ?, 1) ON CONFLICT(bucket_start, path, status) DO UPDATE SET count = count + 1",
    )
      .bind(bucketStart(), observedPath(url.pathname), originResponse.status)
      .run();
    await env.DB.prepare(
      "INSERT INTO human_client_counts (bucket_start, device_type, browser, operating_system, count) VALUES (?, ?, ?, ?, 1) ON CONFLICT(bucket_start, device_type, browser, operating_system) DO UPDATE SET count = count + 1",
    )
      .bind(bucketStart(), client.deviceType, client.browser, client.operatingSystem)
      .run();
    await env.DB.prepare(
      "INSERT INTO human_location_counts (bucket_start, country_code, region_code, region_name, count) VALUES (?, ?, ?, ?, 1) ON CONFLICT(bucket_start, country_code, region_code, region_name) DO UPDATE SET count = count + 1",
    )
      .bind(bucketStart(), location.countryCode, location.regionCode, location.regionName)
      .run();
    return;
  }
  if (item.id === "open-geo-declared-test" && openGeoStaticAsset(url.pathname)) return;
  await env.DB.prepare(
    "INSERT INTO crawler_counts (bucket_start, bot_id, bot_name, category, path, status, count) VALUES (?, ?, ?, ?, ?, ?, 1) ON CONFLICT(bucket_start, bot_id, category, path, status) DO UPDATE SET count = count + 1, bot_name = excluded.bot_name",
  )
    .bind(bucketStart(), item.id, item.name, item.category, observedPath(url.pathname), originResponse.status)
    .run();

  const identity = await classifyIdentity({
    userAgent: request.headers.get("User-Agent") ?? "",
    clientIp: request.headers.get("CF-Connecting-IP"),
    openGeoVerified: item.openGeoVerified,
    genericAutomation: item.category === "other_automation",
  }, env.DB);
  if (!identity) return;
  await env.DB.prepare(
    "INSERT INTO crawler_identity_counts (bucket_start, bot_id, bot_name, provider_id, provider_name, region, purpose, verification_status, verification_method, path, status, count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1) ON CONFLICT(bucket_start, bot_id, provider_id, purpose, verification_status, verification_method, path, status) DO UPDATE SET count = count + 1, bot_name = excluded.bot_name, provider_name = excluded.provider_name",
  )
    .bind(bucketStart(), identity.botId, identity.botName, identity.providerId, identity.providerName, identity.region, identity.purpose, identity.verificationStatus, identity.verificationMethod, observedPath(url.pathname), originResponse.status)
    .run();
}

function jsonResponse(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  const all = new Headers(headers);
  all.set("cache-control", "no-store");
  all.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers: all });
}

function emptyResponse(status: number, headers: HeadersInit = {}): Response {
  return new Response(null, { status, headers: { "cache-control": "no-store", ...headers } });
}

function numberValue(row: Row, key: string): number {
  const value = row[key];
  return typeof value === "number" ? value : Number(value ?? 0);
}

function stringValue(row: Row, key: string): string {
  const value = row[key];
  return typeof value === "string" ? value : "";
}

function ruleState(lastSuccessAt: string | null, lastErrorCode: string | null, now: Date): RuleState {
  if (lastSuccessAt === null) return "unavailable";
  const age = now.getTime() - Date.parse(lastSuccessAt);
  if (!Number.isFinite(age) || age < 0 || age > 7 * 24 * 60 * 60 * 1000) return "unavailable";
  return lastErrorCode !== null || age >= 24 * 60 * 60 * 1000 ? "last_known_good" : "fresh";
}

function readRange(request: Request): "24h" | "7d" | "30d" | null {
  const entries = [...new URL(request.url).searchParams.entries()];
  if (entries.length !== 1 || entries[0]?.[0] !== "range") return null;
  const range = entries[0][1];
  return range === "24h" || range === "7d" || range === "30d" ? range : null;
}

export async function analytics(request: Request, env: ObserverEnv): Promise<Response> {
  if (request.method !== "GET") return emptyResponse(405, { allow: "GET" });
  const range = readRange(request);
  if (!range) return emptyResponse(400);
  const host = new URL(request.url).hostname.toLowerCase();
  if (!READ_HOSTS.has(host)) return emptyResponse(401);
  const timestamp = request.headers.get("X-Observer-Timestamp");
  const canonical = `v1\nread\n${timestamp ?? ""}\nGET\n${host}\n${READ_PATH}\nrange=${range}`;
  if (!(await validHmac(env.OBSERVER_READ_SECRET, timestamp, request.headers.get("X-Observer-Signature"), canonical))) {
    return emptyResponse(401);
  }

  await ensureOfficialRuleSources(env.DB);

  const hours = range === "24h" ? 24 : range === "7d" ? 168 : 720;
  const generatedAt = new Date();
  const queryEnd = bucketStart(generatedAt.getTime()) + HOUR_SECONDS;
  const queryStart = queryEnd - hours * HOUR_SECONDS;
  const statements = [
    env.DB.prepare("SELECT category, SUM(count) requests FROM crawler_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY category").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT bucket_start, category, SUM(count) requests FROM crawler_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY bucket_start, category ORDER BY bucket_start").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT bot_id, bot_name, category, SUM(count) requests FROM crawler_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY bot_id, bot_name, category ORDER BY requests DESC LIMIT 50").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT path, SUM(CASE WHEN category = 'open_geo_self_test' THEN count ELSE 0 END) openGeoSelfTest, SUM(CASE WHEN category = 'identified_ai_crawler' THEN count ELSE 0 END) identifiedAiCrawler, SUM(CASE WHEN category = 'other_automation' THEN count ELSE 0 END) otherAutomation, SUM(count) total FROM crawler_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY path ORDER BY total DESC LIMIT 100").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT status, SUM(count) requests FROM crawler_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY status ORDER BY status").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT value FROM observer_meta WHERE key = 'database_initialized_at'"),
    env.DB.prepare("SELECT verification_status, SUM(count) requests FROM crawler_identity_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY verification_status").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT bot_id, bot_name, provider_id, provider_name, verification_status, verification_method, SUM(count) requests FROM crawler_identity_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY bot_id, bot_name, provider_id, provider_name, verification_status, verification_method ORDER BY requests DESC LIMIT 100").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT source_id, last_attempt_at, last_success_at, last_error_code FROM crawler_rule_sets ORDER BY source_id"),
    env.DB.prepare("SELECT value FROM crawler_identity_meta WHERE key = 'shadow_started_at'"),
    env.DB.prepare("SELECT SUM(count) pageViews FROM human_page_counts WHERE bucket_start >= ? AND bucket_start < ?").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT bucket_start, SUM(count) pageViews FROM human_page_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY bucket_start ORDER BY bucket_start").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT path, SUM(count) pageViews FROM human_page_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY path ORDER BY pageViews DESC LIMIT 100").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT status, SUM(count) pageViews FROM human_page_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY status ORDER BY status").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT value FROM human_page_meta WHERE key = 'tracking_started_at'"),
    env.DB.prepare("SELECT device_type id, SUM(count) pageViews FROM human_client_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY device_type ORDER BY pageViews DESC, device_type").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT browser id, SUM(count) pageViews FROM human_client_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY browser ORDER BY pageViews DESC, browser").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT operating_system id, SUM(count) pageViews FROM human_client_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY operating_system ORDER BY pageViews DESC, operating_system").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT country_code countryCode, SUM(count) pageViews FROM human_location_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY country_code ORDER BY pageViews DESC, country_code LIMIT 100").bind(queryStart, queryEnd),
    env.DB.prepare("SELECT country_code countryCode, region_code regionCode, region_name regionName, SUM(count) pageViews FROM human_location_counts WHERE bucket_start >= ? AND bucket_start < ? GROUP BY country_code, region_code, region_name ORDER BY pageViews DESC, country_code, region_code LIMIT 100").bind(queryStart, queryEnd),
  ];
  const results = await env.DB.batch<Row>(statements);
  const rows = (index: number): Row[] => results[index]?.results ?? [];
  const initialized = stringValue(rows(5)[0] ?? {}, "value");
  if (Number.isNaN(Date.parse(initialized))) return jsonResponse({ error: "database_not_initialized" }, 503);
  const shadowStartedAt = stringValue(rows(9)[0] ?? {}, "value");
  if (Number.isNaN(Date.parse(shadowStartedAt))) return jsonResponse({ error: "identity_shadow_not_initialized" }, 503);

  const categories: Record<Category, number> = { open_geo_self_test: 0, identified_ai_crawler: 0, other_automation: 0 };
  for (const item of rows(0)) {
    const category = stringValue(item, "category");
    if (category in categories) categories[category as Category] = numberValue(item, "requests");
  }
  const byBucket = new Map<number, Record<Category, number>>();
  for (let point = queryStart; point < queryEnd; point += HOUR_SECONDS) {
    byBucket.set(point, { open_geo_self_test: 0, identified_ai_crawler: 0, other_automation: 0 });
  }
  for (const item of rows(1)) {
    const point = numberValue(item, "bucket_start");
    const category = stringValue(item, "category");
    const target = byBucket.get(point);
    if (target && category in target) target[category as Category] = numberValue(item, "requests");
  }
  const identityStatuses: Record<VerificationStatus, number> = { verified_official: 0, declared_unverified: 0, suspected_spoof: 0, other_automation: 0 };
  for (const item of rows(6)) {
    const status = stringValue(item, "verification_status");
    if (status in identityStatuses) identityStatuses[status as VerificationStatus] = numberValue(item, "requests");
  }
  const ruleRows = new Map(rows(8).map((item) => [stringValue(item, "source_id"), item]));
  const humanTrackingStartedAt = stringValue(rows(14)[0] ?? {}, "value");
  const humanByBucket = new Map<number, number>();
  for (let point = queryStart; point < queryEnd; point += HOUR_SECONDS) humanByBucket.set(point, 0);
  for (const item of rows(11)) {
    const point = numberValue(item, "bucket_start");
    if (humanByBucket.has(point)) humanByBucket.set(point, numberValue(item, "pageViews"));
  }
  const human = Number.isNaN(Date.parse(humanTrackingStartedAt)) ? undefined : {
    trackingStartedAt: humanTrackingStartedAt,
    requestedWindowComplete: Date.parse(humanTrackingStartedAt) <= queryStart * 1000,
    pageViews: numberValue(rows(10)[0] ?? {}, "pageViews"),
    trend: [...humanByBucket].map(([point, pageViews]) => ({ bucket: iso(point), pageViews })),
    paths: rows(12).map((item) => ({ path: stringValue(item, "path"), pageViews: numberValue(item, "pageViews") })),
    statuses: rows(13).map((item) => ({ status: numberValue(item, "status"), pageViews: numberValue(item, "pageViews") })),
    devices: rows(15).map((item) => ({ id: stringValue(item, "id"), pageViews: numberValue(item, "pageViews") })),
    browsers: rows(16).map((item) => ({ id: stringValue(item, "id"), pageViews: numberValue(item, "pageViews") })),
    operatingSystems: rows(17).map((item) => ({ id: stringValue(item, "id"), pageViews: numberValue(item, "pageViews") })),
    countries: rows(18).map((item) => ({ countryCode: stringValue(item, "countryCode"), pageViews: numberValue(item, "pageViews") })),
    regions: rows(19).map((item) => ({ countryCode: stringValue(item, "countryCode"), regionCode: stringValue(item, "regionCode"), regionName: stringValue(item, "regionName"), pageViews: numberValue(item, "pageViews") })),
  };

  return jsonResponse({
    meta: {
      range,
      start: iso(queryStart),
      end: generatedAt.toISOString(),
      generatedAt: generatedAt.toISOString(),
      source: "cloudflare-worker-d1",
      bucket: "hour",
      retentionDays: RETENTION_DAYS,
      databaseInitializedAt: initialized,
      requestedWindowComplete: Date.parse(initialized) <= queryStart * 1000,
      bestEffort: true,
      classifier: { aiCrawlerBots: "0.6.3", otherBots: "isbot@5.2.1" },
    },
    summary: {
      crawlerRequests: categories.open_geo_self_test + categories.identified_ai_crawler + categories.other_automation,
      openGeoSelfTest: categories.open_geo_self_test,
      identifiedAiCrawler: categories.identified_ai_crawler,
      otherAutomation: categories.other_automation,
    },
    trend: [...byBucket].map(([point, values]) => ({
      bucket: iso(point),
      openGeoSelfTest: values.open_geo_self_test,
      identifiedAiCrawler: values.identified_ai_crawler,
      otherAutomation: values.other_automation,
    })),
    bots: rows(2).map((item) => ({ id: stringValue(item, "bot_id"), name: stringValue(item, "bot_name"), category: stringValue(item, "category"), requests: numberValue(item, "requests") })),
    paths: rows(3).map((item) => ({ path: stringValue(item, "path"), openGeoSelfTest: numberValue(item, "openGeoSelfTest"), identifiedAiCrawler: numberValue(item, "identifiedAiCrawler"), otherAutomation: numberValue(item, "otherAutomation"), total: numberValue(item, "total") })),
    statuses: rows(4).map((item) => ({ status: numberValue(item, "status"), requests: numberValue(item, "requests") })),
    ...(human ? { human } : {}),
    identityPreview: {
      mode: "shadow",
      shadowStartedAt,
      summary: {
        requests: Object.values(identityStatuses).reduce((total, count) => total + count, 0),
        verifiedOfficial: identityStatuses.verified_official,
        declaredUnverified: identityStatuses.declared_unverified,
        suspectedSpoof: identityStatuses.suspected_spoof,
        otherAutomation: identityStatuses.other_automation,
      },
      bots: rows(7).map((item) => ({
        id: stringValue(item, "bot_id"), name: stringValue(item, "bot_name"), providerId: stringValue(item, "provider_id"), providerName: stringValue(item, "provider_name"),
        verificationStatus: stringValue(item, "verification_status"), verificationMethod: stringValue(item, "verification_method"), requests: numberValue(item, "requests"),
      })),
      rules: RULE_SOURCE_IDS.map((sourceId) => {
        const row = ruleRows.get(sourceId);
        const lastAttemptAt = row ? stringValue(row, "last_attempt_at") || null : null;
        const lastSuccessAt = row ? stringValue(row, "last_success_at") || null : null;
        const lastErrorCode = row ? stringValue(row, "last_error_code") || null : null;
        return { sourceId, lastAttemptAt, lastSuccessAt, state: ruleState(lastSuccessAt, lastErrorCode, generatedAt) };
      }),
    },
  });
}

export async function handleFetch(request: Request, env: ObserverEnv, ctx: ExecutionContext, originFetch: OriginFetch = fetch): Promise<Response> {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  if (host === CUSTOM_DOMAIN_HOST) {
    return url.pathname === READ_PATH ? analytics(request, env) : emptyResponse(404);
  }
  if (host !== HOST) return emptyResponse(404);
  if (url.pathname === READ_PATH) return analytics(request, env);
  const originResponse = await originFetch(request);
  ctx.waitUntil(observe(request, originResponse, env).catch(safeLog));
  return originResponse;
}

export async function purge(env: Pick<ObserverEnv, "DB">): Promise<void> {
  const cutoff = bucketStart() - RETENTION_DAYS * 24 * HOUR_SECONDS;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM crawler_counts WHERE bucket_start < ?").bind(cutoff),
    env.DB.prepare("DELETE FROM crawler_identity_counts WHERE bucket_start < ?").bind(cutoff),
    env.DB.prepare("DELETE FROM human_page_counts WHERE bucket_start < ?").bind(cutoff),
    env.DB.prepare("DELETE FROM human_client_counts WHERE bucket_start < ?").bind(cutoff),
    env.DB.prepare("DELETE FROM human_location_counts WHERE bucket_start < ?").bind(cutoff),
  ]);
}

export async function scheduledMaintenance(env: ObserverEnv): Promise<void> {
  const results = await Promise.allSettled([purge(env), syncOpenAiRuleSources(env.DB), syncPerplexityRuleSources(env.DB)]);
  for (const result of results) if (result.status === "rejected") safeLog(result.reason);
}

const worker = {
  fetch(request, env, ctx): Promise<Response> {
    return handleFetch(request, env, ctx);
  },
  scheduled(_event, env, ctx): void {
    ctx.waitUntil(scheduledMaintenance(env));
  },
} satisfies ExportedHandler<Env>;

export default worker;
