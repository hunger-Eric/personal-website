import { getAutomationFilterPatterns, classifyUserAgent, isVisibleCrawlerCategory } from "./classifier";
import { queryCloudflareWindow } from "./cloudflare";
import { SITE_URL } from "../site-url";
import {
  CRAWLER_RANGES, CrawlerAnalyticsError, type CloudflareRequestGroup, type CrawlerAnalyticsResponse,
  type CrawlerIdentity, type CrawlerRange, type VisibleCrawlerCategory,
} from "./types";

const RANGE_MS = { "24h": 24 * 60 * 60 * 1000, "7d": 7 * 24 * 60 * 60 * 1000, "30d": 30 * 24 * 60 * 60 * 1000 } as const;
const MAX_WINDOW_MS = 6 * 24 * 60 * 60 * 1000;
const CACHE_MS = 5 * 60 * 1000;
type ServiceDependencies = { now?: Date; env?: { token: string; zoneId: string; hostname: string }; queryWindow?: typeof queryCloudflareWindow; bypassCache?: boolean };
type CacheEntry = { expiresAt: number; value: CrawlerAnalyticsResponse };
const cache = new Map<CrawlerRange, CacheEntry>();

export function parseCrawlerRange(value: string | null | undefined): CrawlerRange {
  if (value == null) return "24h";
  if ((CRAWLER_RANGES as readonly string[]).includes(value)) return value as CrawlerRange;
  throw new CrawlerAnalyticsError("invalid_range", "Unsupported crawler analytics range", 400);
}

function resolveEnv(overrides?: ServiceDependencies["env"]) {
  const env = overrides ?? {
    token: process.env.CLOUDFLARE_API_TOKEN ?? "",
    zoneId: process.env.CLOUDFLARE_ZONE_ID ?? "",
    hostname: new URL(SITE_URL).hostname,
  };
  if (!env.token || !env.zoneId || !env.hostname) {
    throw new CrawlerAnalyticsError("configuration_missing", "Crawler analytics is not configured", 503);
  }
  return env;
}

function splitWindows(start: Date, end: Date): Array<{ start: string; end: string }> {
  const windows: Array<{ start: string; end: string }> = [];
  for (let cursor = start.getTime(); cursor < end.getTime();) {
    const next = Math.min(cursor + MAX_WINDOW_MS, end.getTime());
    windows.push({ start: new Date(cursor).toISOString(), end: new Date(next).toISOString() });
    cursor = next;
  }
  return windows;
}

function count(groups: CloudflareRequestGroup[]) { return groups.reduce((sum, group) => sum + (Number.isFinite(group.count) ? group.count : 0), 0); }
type VisibleCrawlerMatch = {
  userAgent: string;
  identity: Omit<CrawlerIdentity, "category"> & { category: VisibleCrawlerCategory };
};

function visible(group: CloudflareRequestGroup): VisibleCrawlerMatch | undefined {
  const userAgent = group.dimensions?.userAgent;
  if (!userAgent) return undefined;
  const identity = classifyUserAgent(userAgent);
  if (!isVisibleCrawlerCategory(identity.category)) return undefined;
  return {
    userAgent,
    identity: { id: identity.id, name: identity.name, category: identity.category },
  };
}
function sampleInterval(groups: CloudflareRequestGroup[]) {
  return groups.reduce((max, group) => {
    const value = group.avg?.sampleInterval;
    return typeof value === "number" && Number.isFinite(value) ? Math.max(max, value) : max;
  }, 1);
}
function categoryCount(category: VisibleCrawlerCategory, group: CloudflareRequestGroup) {
  const match = visible(group);
  return match?.identity.category === category ? group.count : 0;
}

export async function getCrawlerAnalytics(range: CrawlerRange, dependencies: ServiceDependencies = {}): Promise<CrawlerAnalyticsResponse> {
  const parsedRange = parseCrawlerRange(range);
  const now = dependencies.now ?? new Date();
  const cached = cache.get(parsedRange);
  if (!dependencies.bypassCache && cached && cached.expiresAt > now.getTime()) return cached.value;
  const env = resolveEnv(dependencies.env);
  const end = new Date(now.getTime());
  const start = new Date(end.getTime() - RANGE_MS[parsedRange]);
  const queryWindow = dependencies.queryWindow ?? queryCloudflareWindow;
  const results = await Promise.all(splitWindows(start, end).map((window) => queryWindow({ ...env, ...window, patterns: getAutomationFilterPatterns() })));
  const all = <K extends keyof (typeof results)[number]>(key: K) => results.flatMap((result) => result[key]);
  const agents = new Map<string, { category: VisibleCrawlerCategory; name: string; userAgent: string; requests: number }>();
  for (const group of all("byAgent")) {
    const match = visible(group); if (!match) continue;
    const key = `${match.identity.category}\u0000${match.identity.name}\u0000${match.userAgent}`;
    const row = agents.get(key) ?? { category: match.identity.category, name: match.identity.name, userAgent: match.userAgent, requests: 0 };
    row.requests += group.count; agents.set(key, row);
  }
  const trend = new Map<string, { bucket: string; identifiedAiCrawler: number; openGeoSelfTest: number; otherAutomation: number }>();
  for (const group of all("byTrend")) {
    const bucket = group.dimensions?.datetimeHour; if (!bucket || !visible(group)) continue;
    const row = trend.get(bucket) ?? { bucket, identifiedAiCrawler: 0, openGeoSelfTest: 0, otherAutomation: 0 };
    row[visible(group)!.identity.category === "identified_ai_crawler" ? "identifiedAiCrawler" : visible(group)!.identity.category === "open_geo_self_test" ? "openGeoSelfTest" : "otherAutomation"] += group.count;
    trend.set(bucket, row);
  }
  const paths = new Map<string, { path: string; identifiedAiCrawler: number; openGeoSelfTest: number; otherAutomation: number; total: number }>();
  for (const group of all("byPath")) {
    const path = group.dimensions?.clientRequestPath; const match = visible(group); if (!path || !match) continue;
    const row = paths.get(path) ?? { path, identifiedAiCrawler: 0, openGeoSelfTest: 0, otherAutomation: 0, total: 0 };
    const field = match.identity.category === "identified_ai_crawler" ? "identifiedAiCrawler" : match.identity.category === "open_geo_self_test" ? "openGeoSelfTest" : "otherAutomation";
    row[field] += group.count; row.total += group.count; paths.set(path, row);
  }
  const statuses = new Map<number, number>();
  for (const group of all("byStatus")) {
    const status = group.dimensions?.edgeResponseStatus; if (!Number.isFinite(status) || !visible(group)) continue;
    statuses.set(status!, (statuses.get(status!) ?? 0) + group.count);
  }
  const interval = Math.max(...results.flatMap((result) => Object.values(result).map(sampleInterval)));
  const response: CrawlerAnalyticsResponse = {
    meta: { range: parsedRange, start: start.toISOString(), end: end.toISOString(), generatedAt: now.toISOString(), source: "cloudflare-graphql", sampled: interval > 1, sampleInterval: interval },
    summary: {
      totalRequests: results.reduce((sum, result) => sum + count(result.total), 0),
      crawlerRequests: all("byAgent").reduce((sum, group) => sum + (visible(group) ? group.count : 0), 0),
      identifiedAiCrawler: all("byAgent").reduce((sum, group) => sum + categoryCount("identified_ai_crawler", group), 0),
      openGeoSelfTest: all("byAgent").reduce((sum, group) => sum + categoryCount("open_geo_self_test", group), 0),
      otherAutomation: all("byAgent").reduce((sum, group) => sum + categoryCount("other_automation", group), 0),
    },
    trend: [...trend.values()].sort((a, b) => a.bucket.localeCompare(b.bucket)),
    agents: [...agents.values()].sort((a, b) => b.requests - a.requests || a.userAgent.localeCompare(b.userAgent)),
    paths: [...paths.values()].sort((a, b) => b.total - a.total || a.path.localeCompare(b.path)),
    statuses: [...statuses].map(([status, requests]) => ({ status, requests })).sort((a, b) => b.requests - a.requests || a.status - b.status),
  };
  if (!dependencies.bypassCache) cache.set(parsedRange, { expiresAt: now.getTime() + CACHE_MS, value: response });
  return response;
}
