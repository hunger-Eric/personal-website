# Private Crawler Detection Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-accessible, password-protected `/admin/crawlers` dashboard that uses Cloudflare GraphQL Analytics to separate identified AI crawlers, Open GEO self-tests, and other automation by time, user agent, path, and status.

**Architecture:** Keep the existing production-disabled content admin unchanged. Add a narrow HTTP Basic Auth guard for only the crawler page and API, query Cloudflare from server-only modules, classify aggregated User-Agent groups locally, and render a server-side dashboard with URL-driven time-range controls. Cache successful analytics in process for five minutes; never persist IPs, raw logs, or credentials.

**Tech Stack:** Next.js 16 App Router and Proxy, React 19 server components, TypeScript, Tailwind CSS, Vitest, Testing Library, Cloudflare GraphQL Analytics API.

## Global Constraints

- Production access is limited to `/admin/crawlers` and `/api/admin/crawlers`; every other existing `/admin/*` and `/api/admin/*` route keeps its current production 404 behavior.
- Fixed Basic Auth username is `admin`; the password is read only from `CRAWLER_DASHBOARD_PASSWORD` and is never placed in a URL, response body, client bundle, or log.
- Cloudflare access uses only `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID`; the token must have Analytics Read for the target Zone only.
- Query hostname is derived from `SITE_URL`, currently `me.itheheda.online`; never mix `geo.itheheda.online` traffic into the response.
- Supported ranges are exactly `24h`, `7d`, and `30d`; reject every other value.
- Top-level categories are exactly `identified_ai_crawler`, `open_geo_self_test`, `other_automation`, and internal-only `unclassified`.
- User-Agent classification is declared identity, not verified operator identity; visible copy must say “已识别 AI 爬虫”, never “已验证真实 AI 爬虫”.
- Do not add a database, Worker, scheduled job, frontend beacon, chart dependency, IP collection, export, alert, or multi-user authentication.
- Do not modify or stage the existing untracked `.codegraph/`, `.codex/`, `.mimocode/`, `docs/superpowers/specs/2026-08-05-shijie-intelligence-brand-design.md`, or `scripts/sync_feishu_progress.py`.
- This plan covers local implementation and verification. Push, Vercel environment writes, deployment, and production QA require separate execution authority.

## File Map

- `lib/crawler-dashboard-auth.ts`: path matching, Basic header parsing, constant-time credential verification, and 401 challenge helpers.
- `lib/crawler-analytics/types.ts`: range, category, API response, raw Cloudflare group, and typed error contracts.
- `lib/crawler-analytics/classifier.ts`: ordered User-Agent rule table, classification, and GraphQL filter patterns.
- `lib/crawler-analytics/cloudflare.ts`: controlled GraphQL document, request execution, response validation, Cloudflare error mapping, and truncation detection.
- `lib/crawler-analytics/service.ts`: time-window splitting, hostname derivation, local classification/aggregation, five-minute cache, and final response assembly.
- `app/api/admin/crawlers/route.ts`: authenticated, no-store JSON endpoint.
- `app/admin/(crawler-dashboard)/crawlers/page.tsx`: protected server-rendered page and metadata.
- `components/admin/crawlers/CrawlerDashboard.tsx`: dashboard sections, tables, empty/error/sample messaging.
- `components/admin/crawlers/CrawlerTrendChart.tsx`: dependency-free accessible SVG trend chart.
- `config/copy/crawler-dashboard.ts`: centralized Chinese page and error copy.
- `scripts/validate-env.js`: optional crawler-dashboard environment diagnostics without breaking unrelated builds.
- Tests mirror each unit under `tests/lib`, `tests/api`, `tests/components/admin/crawlers`, and `tests/proxy.test.ts`.

---

### Task 1: Narrow Production Basic Auth Boundary

**Files:**
- Create: `lib/crawler-dashboard-auth.ts`
- Create: `tests/lib/crawler-dashboard-auth.test.ts`
- Modify: `proxy.ts`
- Modify: `tests/proxy.test.ts`

**Interfaces:**
- Consumes: `NextRequest` and `NextResponse` from `next/server`; `process.env.CRAWLER_DASHBOARD_PASSWORD`.
- Produces: `isCrawlerDashboardPath(pathname: string): boolean`, `verifyCrawlerDashboardRequest(request: NextRequest): boolean`, and `crawlerAuthChallenge(kind?: "page" | "api"): NextResponse`.

- [ ] **Step 1: Write failing authentication-unit tests**

```ts
// tests/lib/crawler-dashboard-auth.test.ts
import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  crawlerAuthChallenge,
  isCrawlerDashboardPath,
  verifyCrawlerDashboardRequest,
} from "@/lib/crawler-dashboard-auth";

const originalPassword = process.env.CRAWLER_DASHBOARD_PASSWORD;
const basic = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
const request = (path: string, authorization?: string) =>
  new NextRequest(`https://me.itheheda.online${path}`, {
    headers: authorization ? { authorization } : undefined,
  });

afterEach(() => {
  process.env.CRAWLER_DASHBOARD_PASSWORD = originalPassword;
});

describe("crawler dashboard auth", () => {
  it.each([
    "/admin/crawlers",
    "/admin/crawlers/",
    "/api/admin/crawlers",
    "/api/admin/crawlers/health",
  ])("matches only the crawler boundary: %s", (path) => {
    expect(isCrawlerDashboardPath(path)).toBe(true);
  });

  it.each(["/admin", "/admin/site", "/admin/crawlers-old", "/api/admin/save"])(
    "does not widen the old admin boundary: %s",
    (path) => expect(isCrawlerDashboardPath(path)).toBe(false)
  );

  it("accepts only fixed username admin and the configured password", () => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "long-random-secret";
    expect(
      verifyCrawlerDashboardRequest(
        request("/admin/crawlers", basic("admin", "long-random-secret"))
      )
    ).toBe(true);
    expect(
      verifyCrawlerDashboardRequest(
        request("/admin/crawlers", basic("owner", "long-random-secret"))
      )
    ).toBe(false);
    expect(
      verifyCrawlerDashboardRequest(request("/admin/crawlers", basic("admin", "wrong")))
    ).toBe(false);
  });

  it("fails closed for missing config and malformed headers", () => {
    delete process.env.CRAWLER_DASHBOARD_PASSWORD;
    expect(verifyCrawlerDashboardRequest(request("/admin/crawlers"))).toBe(false);
    expect(
      verifyCrawlerDashboardRequest(request("/admin/crawlers", "Bearer secret"))
    ).toBe(false);
  });

  it("returns a browser challenge without leaking secrets", async () => {
    const response = crawlerAuthChallenge("api");
    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe(
      'Basic realm="Crawler analytics", charset="UTF-8"'
    );
    expect(await response.text()).not.toContain("CRAWLER_DASHBOARD_PASSWORD");
  });
});
```

- [ ] **Step 2: Run the unit test and verify the missing-module failure**

Run: `npm test -- tests/lib/crawler-dashboard-auth.test.ts`

Expected: FAIL because `@/lib/crawler-dashboard-auth` does not exist.

- [ ] **Step 3: Implement the minimal fail-closed auth helper**

```ts
// lib/crawler-dashboard-auth.ts
import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const USERNAME = "admin";
const PAGE_PREFIX = "/admin/crawlers";
const API_PREFIX = "/api/admin/crawlers";
const CHALLENGE = 'Basic realm="Crawler analytics", charset="UTF-8"';

function matchesBoundary(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function safeEqual(left: string, right: string): boolean {
  return timingSafeEqual(digest(left), digest(right));
}

export function isCrawlerDashboardPath(pathname: string): boolean {
  return matchesBoundary(pathname, PAGE_PREFIX) || matchesBoundary(pathname, API_PREFIX);
}

export function verifyCrawlerDashboardRequest(request: NextRequest): boolean {
  const expectedPassword = process.env.CRAWLER_DASHBOARD_PASSWORD;
  const authorization = request.headers.get("authorization");
  if (!expectedPassword || !authorization?.startsWith("Basic ")) return false;

  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;
    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    return safeEqual(username, USERNAME) && safeEqual(password, expectedPassword);
  } catch {
    return false;
  }
}

export function crawlerAuthChallenge(kind: "page" | "api" = "page"): NextResponse {
  const response = kind === "api"
    ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    : new NextResponse("Unauthorized", { status: 401 });
  response.headers.set("WWW-Authenticate", CHALLENGE);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
```

- [ ] **Step 4: Add proxy tests proving the crawler exception is narrow**

Add to `tests/proxy.test.ts`:

```ts
describe("proxy — production crawler dashboard boundary", () => {
  const oldPassword = process.env.CRAWLER_DASHBOARD_PASSWORD;

  beforeEach(() => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "crawler-secret";
  });

  afterEach(() => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = oldPassword;
  });

  it("challenges an unauthenticated crawler page", () => {
    const response = proxy(request("/admin/crawlers"));
    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("Basic");
  });

  it("passes an authenticated crawler page without enabling the old admin", () => {
    const authorization = `Basic ${Buffer.from("admin:crawler-secret").toString("base64")}`;
    expect(
      proxy(request("/admin/crawlers", { authorization })).headers.get("x-middleware-next")
    ).toBe("1");
    delete process.env.ENABLE_ADMIN;
    expect(proxy(request("/admin/site", { authorization })).status).toBe(404);
  });
});
```

Update the start of `proxy()` before the old admin master switch:

```ts
if (isCrawlerDashboardPath(pathname)) {
  if (!verifyCrawlerDashboardRequest(request)) {
    return crawlerAuthChallenge(pathname.startsWith("/api/") ? "api" : "page");
  }
  return NextResponse.next();
}
```

- [ ] **Step 5: Run focused authentication tests**

Run: `npm test -- tests/lib/crawler-dashboard-auth.test.ts tests/proxy.test.ts`

Expected: both files PASS; the existing `/admin` login test remains green.

- [ ] **Step 6: Commit the isolated authentication boundary**

Stage only `lib/crawler-dashboard-auth.ts`, `tests/lib/crawler-dashboard-auth.test.ts`, `proxy.ts`, and `tests/proxy.test.ts`; delegate the local Git commit to `git_operator`.

Commit message: `feat: protect crawler dashboard boundary`

---

### Task 2: Typed Analytics Contract and User-Agent Classifier

**Files:**
- Create: `lib/crawler-analytics/types.ts`
- Create: `lib/crawler-analytics/classifier.ts`
- Create: `tests/lib/crawler-analytics-classifier.test.ts`

**Interfaces:**
- Consumes: normalized User-Agent strings from Cloudflare groups.
- Produces: `CrawlerRange`, `CrawlerCategory`, `CrawlerAnalyticsResponse`, `CrawlerAnalyticsError`, `classifyUserAgent(userAgent: string): CrawlerIdentity`, and `getAutomationFilterPatterns(): string[]`.

- [ ] **Step 1: Define failing classifier expectations**

```ts
// tests/lib/crawler-analytics-classifier.test.ts
import { describe, expect, it } from "vitest";
import {
  classifyUserAgent,
  getAutomationFilterPatterns,
} from "@/lib/crawler-analytics/classifier";

describe("crawler User-Agent classifier", () => {
  it.each([
    ["OpenGeoConsoleBot/1.0 (+https://github.com/open-geo-console)", "open_geo_self_test"],
    ["Mozilla/5.0 compatible; GPTBot/1.2", "identified_ai_crawler"],
    ["ClaudeBot/1.0", "identified_ai_crawler"],
    ["PerplexityBot/1.0", "identified_ai_crawler"],
    ["curl/8.7.1", "other_automation"],
    ["Googlebot/2.1", "other_automation"],
    ["Mozilla/5.0 Safari/605.1.15", "unclassified"],
  ])("classifies %s as %s", (userAgent, category) => {
    expect(classifyUserAgent(userAgent).category).toBe(category);
  });

  it("applies Open GEO before generic bot rules and ignores case", () => {
    expect(classifyUserAgent("opENgeOconSoleBOT/1.0")).toMatchObject({
      category: "open_geo_self_test",
      id: "open-geo-console",
    });
  });

  it("returns unique lowercase patterns for the GraphQL OR filter", () => {
    const patterns = getAutomationFilterPatterns();
    expect(patterns).toContain("opengeoconsolebot/");
    expect(patterns).toContain("gptbot");
    expect(new Set(patterns).size).toBe(patterns.length);
  });
});
```

- [ ] **Step 2: Run the classifier test and verify it fails**

Run: `npm test -- tests/lib/crawler-analytics-classifier.test.ts`

Expected: FAIL because the classifier module does not exist.

- [ ] **Step 3: Add the exact shared types**

Create `lib/crawler-analytics/types.ts` with these exported contracts:

```ts
export const CRAWLER_RANGES = ["24h", "7d", "30d"] as const;
export type CrawlerRange = (typeof CRAWLER_RANGES)[number];

export type CrawlerCategory =
  | "identified_ai_crawler"
  | "open_geo_self_test"
  | "other_automation"
  | "unclassified";

export type VisibleCrawlerCategory = Exclude<CrawlerCategory, "unclassified">;

export type CrawlerIdentity = {
  id: string;
  name: string;
  category: CrawlerCategory;
};

export type CloudflareRequestGroup = {
  count: number;
  avg?: { sampleInterval?: number | null } | null;
  dimensions?: {
    datetimeHour?: string | null;
    userAgent?: string | null;
    clientRequestPath?: string | null;
    edgeResponseStatus?: number | null;
  } | null;
};

export type CloudflareWindowResult = {
  total: CloudflareRequestGroup[];
  byAgent: CloudflareRequestGroup[];
  byTrend: CloudflareRequestGroup[];
  byPath: CloudflareRequestGroup[];
  byStatus: CloudflareRequestGroup[];
};

export type CrawlerAnalyticsResponse = {
  meta: {
    range: CrawlerRange;
    start: string;
    end: string;
    generatedAt: string;
    source: "cloudflare-graphql";
    sampled: boolean;
    sampleInterval: number;
  };
  summary: {
    totalRequests: number;
    crawlerRequests: number;
    identifiedAiCrawler: number;
    openGeoSelfTest: number;
    otherAutomation: number;
  };
  trend: Array<{
    bucket: string;
    identifiedAiCrawler: number;
    openGeoSelfTest: number;
    otherAutomation: number;
  }>;
  agents: Array<{
    category: VisibleCrawlerCategory;
    name: string;
    userAgent: string;
    requests: number;
  }>;
  paths: Array<{
    path: string;
    identifiedAiCrawler: number;
    openGeoSelfTest: number;
    otherAutomation: number;
    total: number;
  }>;
  statuses: Array<{ status: number; requests: number }>;
};

export type CrawlerAnalyticsErrorCode =
  | "configuration_missing"
  | "cloudflare_auth_invalid"
  | "cloudflare_permission_denied"
  | "cloudflare_rate_limited"
  | "cloudflare_unavailable"
  | "unsupported_dataset"
  | "result_truncated"
  | "invalid_range";

export class CrawlerAnalyticsError extends Error {
  constructor(
    public readonly code: CrawlerAnalyticsErrorCode,
    message: string,
    public readonly status = 500
  ) {
    super(message);
    this.name = "CrawlerAnalyticsError";
  }
}
```

- [ ] **Step 4: Implement ordered, explicit classifier rules**

Create `lib/crawler-analytics/classifier.ts` with ordered rules. Use these exact pattern groups:

```ts
import type { CrawlerIdentity, VisibleCrawlerCategory } from "./types";

type Rule = CrawlerIdentity & { patterns: readonly string[] };

const RULES: readonly Rule[] = [
  {
    id: "open-geo-console",
    name: "Open GEO Console",
    category: "open_geo_self_test",
    patterns: ["opengeoconsolebot/"],
  },
  {
    id: "openai",
    name: "OpenAI",
    category: "identified_ai_crawler",
    patterns: ["gptbot", "chatgpt-user", "oai-searchbot"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    category: "identified_ai_crawler",
    patterns: ["claudebot", "claude-searchbot", "claude-user"],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    category: "identified_ai_crawler",
    patterns: ["perplexitybot", "perplexity-user"],
  },
  {
    id: "meta-ai",
    name: "Meta AI",
    category: "identified_ai_crawler",
    patterns: ["meta-externalagent", "meta-externalfetcher"],
  },
  {
    id: "ai-data-crawler",
    name: "其他 AI 数据爬虫",
    category: "identified_ai_crawler",
    patterns: ["ccbot", "bytespider", "amazonbot"],
  },
  {
    id: "search-crawler",
    name: "搜索引擎爬虫",
    category: "other_automation",
    patterns: ["googlebot", "bingbot", "duckduckbot", "baiduspider", "yandexbot", "slurp"],
  },
  {
    id: "command-line-client",
    name: "命令行客户端",
    category: "other_automation",
    patterns: ["curl/", "wget/", "python-requests", "httpie/"],
  },
  {
    id: "monitoring-client",
    name: "监控程序",
    category: "other_automation",
    patterns: ["uptime", "pingdom"],
  },
  {
    id: "browser-automation",
    name: "浏览器自动化",
    category: "other_automation",
    patterns: ["headlesschrome", "playwright", "puppeteer", "selenium"],
  },
];

export function classifyUserAgent(userAgent: string): CrawlerIdentity {
  const normalized = userAgent.toLowerCase();
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => normalized.includes(pattern))) {
      return { id: rule.id, name: rule.name, category: rule.category };
    }
  }
  return { id: "unclassified", name: "未分类", category: "unclassified" };
}

export function getAutomationFilterPatterns(): string[] {
  return [...new Set(RULES.flatMap((rule) => rule.patterns.map((pattern) => pattern.toLowerCase())))];
}

export function isVisibleCrawlerCategory(
  category: CrawlerIdentity["category"]
): category is VisibleCrawlerCategory {
  return category !== "unclassified";
}
```

- [ ] **Step 5: Run focused types/classifier tests**

Run: `npm test -- tests/lib/crawler-analytics-classifier.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the contract and classifier**

Stage only the two new library files and their test; delegate the local Git commit to `git_operator`.

Commit message: `feat: classify crawler user agents`

---

### Task 3: Cloudflare GraphQL Adapter and Aggregation Service

**Files:**
- Create: `lib/crawler-analytics/cloudflare.ts`
- Create: `lib/crawler-analytics/service.ts`
- Create: `tests/lib/crawler-analytics-cloudflare.test.ts`
- Create: `tests/lib/crawler-analytics-service.test.ts`
- Modify: `scripts/validate-env.js`

**Interfaces:**
- Consumes: `CloudflareWindowResult`, classifier functions, `SITE_URL`, three private environment variables, and an injectable `fetch`.
- Produces: `queryCloudflareWindow(input): Promise<CloudflareWindowResult>`, `getCrawlerAnalytics(range, dependencies?): Promise<CrawlerAnalyticsResponse>`, and `parseCrawlerRange(value): CrawlerRange`.

- [ ] **Step 1: Write failing adapter tests for the controlled query and error mapping**

Create `tests/lib/crawler-analytics-cloudflare.test.ts` with fixtures that assert:

```ts
import { describe, expect, it, vi } from "vitest";
import { queryCloudflareWindow } from "@/lib/crawler-analytics/cloudflare";

const input = {
  token: "token",
  zoneId: "zone",
  hostname: "me.itheheda.online",
  start: "2026-08-05T00:00:00.000Z",
  end: "2026-08-06T00:00:00.000Z",
  patterns: ["gptbot", "opengeoconsolebot/"],
};

describe("Cloudflare crawler query", () => {
  it("sends only fixed zone, hostname, time and automation filters", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            viewer: {
              zones: [{ total: [{ count: 12 }], byAgent: [], byTrend: [], byPath: [], byStatus: [] }],
            },
          },
          errors: null,
        }),
        { status: 200 }
      )
    );
    await queryCloudflareWindow({ ...input, fetchImpl });
    const [, init] = fetchImpl.mock.calls[0];
    const body = JSON.parse(String(init.body));
    expect(body.variables.zoneTag).toBe("zone");
    expect(body.variables.baseFilter).toMatchObject({
      clientRequestHTTPHost: "me.itheheda.online",
      requestSource: "eyeball",
    });
    expect(body.variables.crawlerFilter.OR).toEqual([
      { userAgent_like: "%gptbot%" },
      { userAgent_like: "%opengeoconsolebot/%" },
    ]);
    expect(init.headers.Authorization).toBe("Bearer token");
  });

  it.each([
    [401, "cloudflare_auth_invalid"],
    [403, "cloudflare_permission_denied"],
    [429, "cloudflare_rate_limited"],
    [500, "cloudflare_unavailable"],
  ])("maps HTTP %s to %s", async (status, code) => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status }));
    await expect(queryCloudflareWindow({ ...input, fetchImpl })).rejects.toMatchObject({ code });
  });

  it("fails instead of presenting truncated groups", async () => {
    const full = Array.from({ length: 5000 }, () => ({ count: 1, dimensions: { userAgent: "GPTBot" } }));
    const fetchImpl = vi.fn().mockResolvedValue(
      Response.json({
        data: { viewer: { zones: [{ total: [{ count: 5000 }], byAgent: full, byTrend: [], byPath: [], byStatus: [] }] } },
      })
    );
    await expect(queryCloudflareWindow({ ...input, fetchImpl })).rejects.toMatchObject({
      code: "result_truncated",
    });
  });
});
```

- [ ] **Step 2: Run the adapter test and verify the missing-module failure**

Run: `npm test -- tests/lib/crawler-analytics-cloudflare.test.ts`

Expected: FAIL because `cloudflare.ts` does not exist.

- [ ] **Step 3: Implement the fixed GraphQL document and response validation**

Use this document in `lib/crawler-analytics/cloudflare.ts`; callers can control variables only, never the query text:

```ts
const GROUP_LIMIT = 5000;
const GRAPHQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";
const QUERY = `
  query CrawlerTraffic($zoneTag: string, $baseFilter: filter, $crawlerFilter: filter) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        total: httpRequestsAdaptiveGroups(limit: 1, filter: $baseFilter, orderBy: [count_DESC]) {
          count
          avg { sampleInterval }
        }
        byAgent: httpRequestsAdaptiveGroups(limit: 5000, filter: $crawlerFilter, orderBy: [count_DESC]) {
          count
          avg { sampleInterval }
          dimensions { userAgent }
        }
        byTrend: httpRequestsAdaptiveGroups(limit: 5000, filter: $crawlerFilter, orderBy: [count_DESC]) {
          count
          avg { sampleInterval }
          dimensions { datetimeHour userAgent }
        }
        byPath: httpRequestsAdaptiveGroups(limit: 5000, filter: $crawlerFilter, orderBy: [count_DESC]) {
          count
          avg { sampleInterval }
          dimensions { clientRequestPath userAgent }
        }
        byStatus: httpRequestsAdaptiveGroups(limit: 5000, filter: $crawlerFilter, orderBy: [count_DESC]) {
          count
          avg { sampleInterval }
          dimensions { edgeResponseStatus userAgent }
        }
      }
    }
  }
`;
```

Implement `queryCloudflareWindow` to:

1. create `baseFilter` from start/end/hostname/`requestSource: "eyeball"`;
2. create `crawlerFilter` with the same base plus `OR: patterns.map(pattern => ({ userAgent_like: `%${pattern}%` }))`;
3. use `AbortSignal.timeout(10_000)` and `cache: "no-store"`;
4. map HTTP 401/403/429/5xx to the typed codes;
5. map GraphQL field/schema errors to `unsupported_dataset` and other GraphQL errors to `cloudflare_unavailable`;
6. reject a missing/empty Zone result;
7. reject any grouped array with exactly `GROUP_LIMIT` rows as `result_truncated`;
8. return only the five typed arrays.

- [ ] **Step 4: Write failing service tests for time windows, aggregation and caching**

Create `tests/lib/crawler-analytics-service.test.ts` using an injected `queryWindow` function. Cover these exact behaviors:

```ts
it("aggregates visible categories while retaining total request baseline", async () => {
  const queryWindow = vi.fn().mockResolvedValue({
    total: [{ count: 100, avg: { sampleInterval: 1 } }],
    byAgent: [
      { count: 10, dimensions: { userAgent: "GPTBot/1.2" } },
      { count: 20, dimensions: { userAgent: "OpenGeoConsoleBot/1.0" } },
      { count: 5, dimensions: { userAgent: "curl/8.7.1" } },
    ],
    byTrend: [],
    byPath: [],
    byStatus: [],
  });
  const result = await getCrawlerAnalytics("24h", {
    now: new Date("2026-08-06T12:00:00.000Z"),
    env: { token: "token", zoneId: "zone", hostname: "me.itheheda.online" },
    queryWindow,
    bypassCache: true,
  });
  expect(result.summary).toEqual({
    totalRequests: 100,
    crawlerRequests: 35,
    identifiedAiCrawler: 10,
    openGeoSelfTest: 20,
    otherAutomation: 5,
  });
});

it("splits 30 days into five windows no longer than six days", async () => {
  const queryWindow = vi.fn().mockResolvedValue({ total: [{ count: 0 }], byAgent: [], byTrend: [], byPath: [], byStatus: [] });
  await getCrawlerAnalytics("30d", {
    now: new Date("2026-08-06T12:00:00.000Z"),
    env: { token: "token", zoneId: "zone", hostname: "me.itheheda.online" },
    queryWindow,
    bypassCache: true,
  });
  expect(queryWindow).toHaveBeenCalledTimes(5);
});

it("marks the response sampled using the maximum observed interval", async () => {
  const queryWindow = vi.fn().mockResolvedValue({
    total: [{ count: 10, avg: { sampleInterval: 3 } }],
    byAgent: [], byTrend: [], byPath: [], byStatus: [],
  });
  const result = await getCrawlerAnalytics("24h", {
    now: new Date("2026-08-06T12:00:00.000Z"),
    env: { token: "token", zoneId: "zone", hostname: "me.itheheda.online" },
    queryWindow,
    bypassCache: true,
  });
  expect(result.meta).toMatchObject({ sampled: true, sampleInterval: 3 });
});
```

Also test missing env as `configuration_missing`, invalid range as `invalid_range`, aggregation by bucket/path/status, descending table sort, chronological trend sort, and a five-minute cache hit that avoids a second `queryWindow` call.

- [ ] **Step 5: Implement the service with bounded windows and pure reducers**

In `lib/crawler-analytics/service.ts`:

```ts
const RANGE_MS = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
} as const;
const MAX_WINDOW_MS = 6 * 24 * 60 * 60 * 1000;
const CACHE_MS = 5 * 60 * 1000;
```

Implement these internal steps in named pure functions so tests can exercise behavior without network calls:

- treat a missing range as `24h`, validate every supplied value with `CRAWLER_RANGES.includes`, and throw `invalid_range` for any other value;
- resolve token and Zone ID from private env and hostname from `new URL(SITE_URL).hostname`;
- split `[start, end)` into ascending windows no longer than six days;
- call `queryCloudflareWindow` for each window with `getAutomationFilterPatterns()`;
- sum total counts across windows;
- classify every grouped User-Agent again locally and discard unexpected `unclassified` rows from crawler totals;
- aggregate agent rows by category/name/exact User-Agent;
- aggregate trend by hour and visible category;
- aggregate paths by path and visible category;
- aggregate status counts only for visible crawler groups;
- set `sampleInterval` to the maximum finite observed interval and `sampled` to `sampleInterval > 1`;
- store only successful final responses in a module-local `Map<CrawlerRange, CacheEntry>` for five minutes.

The dependency interface must be:

```ts
type ServiceDependencies = {
  now?: Date;
  env?: { token: string; zoneId: string; hostname: string };
  queryWindow?: typeof queryCloudflareWindow;
  bypassCache?: boolean;
};

export function parseCrawlerRange(value: string | null | undefined): CrawlerRange;
export async function getCrawlerAnalytics(
  range: CrawlerRange,
  dependencies?: ServiceDependencies
): Promise<CrawlerAnalyticsResponse>;
```

- [ ] **Step 6: Add optional build-time environment diagnostics**

Append three non-required entries to `ENV_VARS` in `scripts/validate-env.js`:

```js
{
  name: "CRAWLER_DASHBOARD_PASSWORD",
  required: false,
  description: "Private crawler dashboard Basic Auth password",
  usedBy: ["Crawler Analytics Admin"],
},
{
  name: "CLOUDFLARE_API_TOKEN",
  required: false,
  description: "Zone-scoped Cloudflare Analytics Read token",
  usedBy: ["Crawler Analytics Admin"],
},
{
  name: "CLOUDFLARE_ZONE_ID",
  required: false,
  description: "Cloudflare Zone ID for crawler analytics",
  usedBy: ["Crawler Analytics Admin"],
},
```

- [ ] **Step 7: Run focused data-layer tests**

Run: `npm test -- tests/lib/crawler-analytics-classifier.test.ts tests/lib/crawler-analytics-cloudflare.test.ts tests/lib/crawler-analytics-service.test.ts`

Expected: all files PASS with no real Cloudflare call.

- [ ] **Step 8: Commit the Cloudflare data layer**

Stage only the two data modules, two tests, and `scripts/validate-env.js`; delegate the local Git commit to `git_operator`.

Commit message: `feat: query cloudflare crawler analytics`

---

### Task 4: Authenticated Crawler Analytics API

**Files:**
- Create: `app/api/admin/crawlers/route.ts`
- Create: `tests/api/admin-crawlers.test.ts`

**Interfaces:**
- Consumes: `verifyCrawlerDashboardRequest`, `crawlerAuthChallenge`, `parseCrawlerRange`, and `getCrawlerAnalytics`.
- Produces: `GET /api/admin/crawlers?range=24h|7d|30d` with either `CrawlerAnalyticsResponse` or `{ error: { code, message } }`.

- [ ] **Step 1: Write failing route tests**

Create `tests/api/admin-crawlers.test.ts` and mock `@/lib/crawler-analytics/service`. Assert:

```ts
it("returns 401 with a Basic challenge before touching Cloudflare", async () => {
  const response = await GET(new NextRequest("https://me.itheheda.online/api/admin/crawlers"));
  expect(response.status).toBe(401);
  expect(response.headers.get("www-authenticate")).toContain("Basic");
  expect(getCrawlerAnalytics).not.toHaveBeenCalled();
});

it("returns private no-store analytics for a valid request", async () => {
  process.env.CRAWLER_DASHBOARD_PASSWORD = "secret";
  vi.mocked(getCrawlerAnalytics).mockResolvedValue(fixtureResponse);
  const response = await GET(authenticatedRequest("?range=7d"));
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(getCrawlerAnalytics).toHaveBeenCalledWith("7d");
});

it.each([
  ["invalid_range", 400],
  ["configuration_missing", 503],
  ["cloudflare_auth_invalid", 502],
  ["cloudflare_permission_denied", 502],
  ["cloudflare_rate_limited", 503],
  ["unsupported_dataset", 502],
  ["result_truncated", 502],
  ["cloudflare_unavailable", 502],
])("maps %s to HTTP %s without exposing upstream bodies", async (code, status) => {
  // Configure auth, reject the mocked service with CrawlerAnalyticsError, and assert the code/status.
});
```

- [ ] **Step 2: Run the route test and verify it fails**

Run: `npm test -- tests/api/admin-crawlers.test.ts`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement the API route**

```ts
// app/api/admin/crawlers/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  crawlerAuthChallenge,
  verifyCrawlerDashboardRequest,
} from "@/lib/crawler-dashboard-auth";
import {
  CrawlerAnalyticsError,
  type CrawlerAnalyticsErrorCode,
} from "@/lib/crawler-analytics/types";
import {
  getCrawlerAnalytics,
  parseCrawlerRange,
} from "@/lib/crawler-analytics/service";

export const dynamic = "force-dynamic";

const STATUS_BY_CODE: Record<CrawlerAnalyticsErrorCode, number> = {
  invalid_range: 400,
  configuration_missing: 503,
  cloudflare_auth_invalid: 502,
  cloudflare_permission_denied: 502,
  cloudflare_rate_limited: 503,
  cloudflare_unavailable: 502,
  unsupported_dataset: 502,
  result_truncated: 502,
};

export async function GET(request: NextRequest) {
  if (!verifyCrawlerDashboardRequest(request)) return crawlerAuthChallenge("api");

  try {
    const range = parseCrawlerRange(request.nextUrl.searchParams.get("range"));
    const data = await getCrawlerAnalytics(range);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const typed =
      error instanceof CrawlerAnalyticsError
        ? error
        : new CrawlerAnalyticsError("cloudflare_unavailable", "Crawler analytics unavailable");
    return NextResponse.json(
      { error: { code: typed.code, message: typed.message } },
      {
        status: STATUS_BY_CODE[typed.code],
        headers: { "Cache-Control": "private, no-store" },
      }
    );
  }
}
```

- [ ] **Step 4: Run route and proxy tests**

Run: `npm test -- tests/api/admin-crawlers.test.ts tests/proxy.test.ts`

Expected: PASS; API auth is enforced both in Proxy and in the route.

- [ ] **Step 5: Commit the authenticated endpoint**

Stage only the API route and its test; delegate the local Git commit to `git_operator`.

Commit message: `feat: expose private crawler analytics api`

---

### Task 5: Server-Rendered Private Dashboard

**Files:**
- Create: `config/copy/crawler-dashboard.ts`
- Create: `components/admin/crawlers/CrawlerTrendChart.tsx`
- Create: `components/admin/crawlers/CrawlerDashboard.tsx`
- Create: `app/admin/(crawler-dashboard)/crawlers/page.tsx`
- Create: `tests/components/admin/crawlers/CrawlerTrendChart.test.tsx`
- Create: `tests/components/admin/crawlers/CrawlerDashboard.test.tsx`
- Create: `tests/crawler-dashboard-page.test.tsx`

**Interfaces:**
- Consumes: `CrawlerAnalyticsResponse`, `CrawlerAnalyticsError`, `parseCrawlerRange`, and `getCrawlerAnalytics`.
- Produces: responsive, noindex server page with URL links for three ranges, accessible trend graphic, summary cards, agent/path/status tables, and truthful error/empty/sample states.

- [ ] **Step 1: Add failing trend-chart tests**

```tsx
// tests/components/admin/crawlers/CrawlerTrendChart.test.tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrawlerTrendChart } from "@/components/admin/crawlers/CrawlerTrendChart";

const trend = [
  { bucket: "2026-08-06T10:00:00Z", identifiedAiCrawler: 2, openGeoSelfTest: 5, otherAutomation: 1 },
  { bucket: "2026-08-06T11:00:00Z", identifiedAiCrawler: 3, openGeoSelfTest: 0, otherAutomation: 2 },
];

describe("CrawlerTrendChart", () => {
  it("renders an accessible graphic and a textual fallback table", () => {
    render(<CrawlerTrendChart trend={trend} />);
    expect(screen.getByRole("img", { name: "自动化请求趋势" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "自动化请求趋势数据" })).toBeInTheDocument();
    expect(screen.getByText("2026-08-06 10:00")).toBeInTheDocument();
  });

  it("renders a clear empty state without an invalid SVG path", () => {
    const { container } = render(<CrawlerTrendChart trend={[]} />);
    expect(screen.getByText("所选时间内没有可绘制的自动化趋势")).toBeInTheDocument();
    expect(container.querySelector("path[d*='NaN']")).toBeNull();
  });
});
```

- [ ] **Step 2: Add failing dashboard tests for success, empty, sampled and errors**

`tests/components/admin/crawlers/CrawlerDashboard.test.tsx` must assert:

- heading “AI 爬虫检测”; three range links with `?range=24h|7d|30d`;
- summary values for all three visible categories;
- exact User-Agent and path rows;
- sampled copy when `meta.sampled === true`;
- empty explanation that does not claim there were no undeclared bots;
- error copy for every `CrawlerAnalyticsErrorCode`;
- no raw token/password/IP text in rendered HTML;
- table wrappers use overflow classes and summary cards use single-column mobile classes.

- [ ] **Step 3: Run component tests and verify missing-component failures**

Run: `npm test -- tests/components/admin/crawlers/CrawlerTrendChart.test.tsx tests/components/admin/crawlers/CrawlerDashboard.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 4: Implement centralized Chinese copy**

Create `config/copy/crawler-dashboard.ts` with exact labels for title, description, ranges, three categories, tables, sampling disclaimer, User-Agent disclaimer, empty state, and the eight error codes. Required error actions:

```ts
export const crawlerDashboardCopy = {
  title: "AI 爬虫检测",
  description: "区分已识别 AI 爬虫、Open GEO 自测和其他自动化请求。",
  source: "Cloudflare GraphQL Analytics",
  categories: {
    identified_ai_crawler: "已识别 AI 爬虫",
    open_geo_self_test: "Open GEO 自测",
    other_automation: "其他自动化",
  },
  empty: "所选时间内未识别到自动化流量；这不代表不存在未声明身份的爬虫。",
  sampled: "Cloudflare 对该时间范围使用了采样，显示数量为估算值。",
  identityDisclaimer: "分类依据请求声明的 User-Agent，不代表运营方身份已经验证。",
  errors: {
    configuration_missing: "爬虫检测尚未配置 Cloudflare 只读凭据。",
    cloudflare_auth_invalid: "Cloudflare Token 无效或已经过期。",
    cloudflare_permission_denied: "Cloudflare Token 缺少目标 Zone 的 Analytics Read 权限。",
    cloudflare_rate_limited: "Cloudflare 暂时限制了查询，请稍后再试。",
    cloudflare_unavailable: "Cloudflare Analytics 当前不可用。",
    unsupported_dataset: "当前 Cloudflare 套餐或 Zone 不支持所需分析维度。",
    result_truncated: "结果超过当前安全查询上限，未展示不完整统计。",
    invalid_range: "时间范围无效，请选择 24 小时、7 天或 30 天。",
  },
} as const;
```

- [ ] **Step 5: Implement the dependency-free accessible trend chart**

`CrawlerTrendChart` must:

- compute width 720, height 240, padding 32, and a non-zero denominator `Math.max(1, ...totals)`;
- draw three polylines or paths using semantic CSS variables (`--accent`, `--warning`, `--muted`), never raw template colors;
- include `<svg role="img" aria-label="自动化请求趋势">` and a `<title>`;
- include a visually compact but screen-reader-readable table containing every bucket and three values;
- return the explicit empty copy when `trend.length === 0`.

- [ ] **Step 6: Implement the dashboard shell and data sections**

`CrawlerDashboard` accepts:

```ts
type Props = {
  range: CrawlerRange;
  data?: CrawlerAnalyticsResponse;
  errorCode?: CrawlerAnalyticsErrorCode;
};
```

Render:

- a standalone max-width page with a back-to-site link, no old `AdminSidebar`;
- range controls as normal links so the server rerenders without client state;
- four summary cards: automation total plus three categories;
- `CrawlerTrendChart`;
- agent table (`name`, declared User-Agent, category, requests);
- path table (`path`, each category, total);
- status table (`status`, requests);
- generated time, source, sampling message and identity disclaimer;
- no-data state when `crawlerRequests === 0`;
- only the typed error panel when `errorCode` exists, never zero-value cards.

- [ ] **Step 7: Add the dedicated server page and noindex metadata**

```tsx
// app/admin/(crawler-dashboard)/crawlers/page.tsx
import type { Metadata } from "next";
import { CrawlerDashboard } from "@/components/admin/crawlers/CrawlerDashboard";
import {
  getCrawlerAnalytics,
  parseCrawlerRange,
} from "@/lib/crawler-analytics/service";
import {
  CrawlerAnalyticsError,
  type CrawlerAnalyticsErrorCode,
} from "@/lib/crawler-analytics/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "AI 爬虫检测 | Admin",
  robots: { index: false, follow: false },
};

export default async function CrawlerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  let range;
  try {
    range = parseCrawlerRange((await searchParams).range);
  } catch {
    range = "24h" as const;
    return <CrawlerDashboard range={range} errorCode="invalid_range" />;
  }

  try {
    const data = await getCrawlerAnalytics(range);
    return <CrawlerDashboard range={range} data={data} />;
  } catch (error) {
    const errorCode: CrawlerAnalyticsErrorCode =
      error instanceof CrawlerAnalyticsError ? error.code : "cloudflare_unavailable";
    return <CrawlerDashboard range={range} errorCode={errorCode} />;
  }
}
```

- [ ] **Step 8: Test page wiring without network calls**

In `tests/crawler-dashboard-page.test.tsx`, mock `@/lib/crawler-analytics/service`, await the page function, then render its result. Verify default `24h`, requested `7d`, invalid-range error, successful data, and typed service failure. The test must assert `getCrawlerAnalytics` is never called for an invalid range.

- [ ] **Step 9: Run all dashboard tests**

Run: `npm test -- tests/components/admin/crawlers/CrawlerTrendChart.test.tsx tests/components/admin/crawlers/CrawlerDashboard.test.tsx tests/crawler-dashboard-page.test.tsx`

Expected: PASS in jsdom with no network access.

- [ ] **Step 10: Commit the private dashboard UI**

Stage only the copy, two components, page, and three tests; delegate the local Git commit to `git_operator`.

Commit message: `feat: add private crawler analytics dashboard`

---

### Task 6: Full Regression and Read-Only Capability Check

**Files:**
- Modify only files required to correct failures caused by Tasks 1–5.
- Do not create receipts, screenshots, reports, or unrelated cleanup files.

**Interfaces:**
- Consumes: complete local feature and optional local Cloudflare credentials supplied through environment variables.
- Produces: regression evidence and a truthful boundary between local completion and production verification.

- [ ] **Step 1: Run the focused crawler suite**

Run:

```powershell
npm test -- tests/lib/crawler-dashboard-auth.test.ts tests/lib/crawler-analytics-classifier.test.ts tests/lib/crawler-analytics-cloudflare.test.ts tests/lib/crawler-analytics-service.test.ts tests/api/admin-crawlers.test.ts tests/components/admin/crawlers/CrawlerTrendChart.test.tsx tests/components/admin/crawlers/CrawlerDashboard.test.tsx tests/crawler-dashboard-page.test.tsx tests/proxy.test.ts
```

Expected: all focused tests PASS.

- [ ] **Step 2: Run repository-wide static and automated validation**

Run each command separately:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: zero new lint errors, typecheck PASS, full Vitest suite PASS, and production build PASS. Existing warnings may be reported but not expanded into unrelated cleanup.

- [ ] **Step 3: Perform a local HTTP behavior check**

Start the built app with only a temporary local `CRAWLER_DASHBOARD_PASSWORD` and without Cloudflare credentials. Verify:

- `/admin/crawlers` without Authorization returns 401 and `WWW-Authenticate`;
- the same path with correct Basic Auth renders the explicit configuration-missing state;
- `/admin/site` remains unavailable under the existing production rule;
- `/api/admin/crawlers` without auth returns 401 JSON;
- authenticated API returns `configuration_missing`, not empty success data.

Stop the local process after the check. Do not store the temporary password.

- [ ] **Step 4: If credentials are already available locally, run one read-only Cloudflare capability query**

Use the application service or authenticated local API for `range=24h`; do not call Cloudflare mutation endpoints. Verify the target Zone supports `userAgent`, `datetimeHour`, `clientRequestPath`, `edgeResponseStatus`, and `sampleInterval` for `httpRequestsAdaptiveGroups`, and confirm the GraphQL variables filter `clientRequestHTTPHost` to `me.itheheda.online`.

If credentials are absent, record only: “Cloudflare live capability not verified: credentials unavailable.” Do not ask for or print the token.

- [ ] **Step 5: Inspect the final diff and scope**

Run:

```powershell
git status --short --branch
git diff --stat origin/main...HEAD
git diff --check origin/main...HEAD
```

Expected: only the approved spec, plan, crawler feature, and crawler tests are present; protected untracked items remain unstaged; `git diff --check` returns no whitespace errors.

- [ ] **Step 6: Commit only any test-driven integration corrections**

If Step 2 or 3 required scoped corrections, delegate one local commit to `git_operator`.

Commit message: `test: validate crawler analytics dashboard`

If no corrections were needed, do not create an empty commit.

- [ ] **Step 7: Stop at the local-completion boundary**

Report exact test/build results and whether the read-only Cloudflare capability check ran. Do not push, set Vercel variables, deploy, or claim production availability until the user separately authorizes those external writes and production QA.
