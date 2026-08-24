import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../src/index";
import { analytics, bucketStart, classify, excluded, handleFetch, observedPath, purge, scheduledMaintenance, validHmac } from "../src/core";
import migrationSql from "../migrations/0001_initial.sql?raw";
import identityMigrationSql from "../migrations/0002_identity_shadow.sql?raw";
import humanPageMigrationSql from "../migrations/0003_human_page_views.sql?raw";

const openGeoSecret = "open-geo-test-secret";
const readSecret = "observer-read-test-secret";

function base64Url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function signature(secret: string, canonical: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(canonical)));
}

function fakeDb(options: { failRun?: boolean; failIdentityRun?: boolean; batchRows?: Record<string, unknown>[][] } = {}) {
  const sql: string[] = [];
  const values: unknown[][] = [];
  const freshRuleRows = ["openai_gptbot", "openai_searchbot", "openai_chatgpt_user", "perplexity_bot", "perplexity_user"].map((source_id) => ({
    source_id,
    last_attempt_at: new Date().toISOString(),
    last_success_at: new Date().toISOString(),
  }));
  const prepared = (query: string) => {
    const result = {
      run: async () => {
        if (options.failRun || (options.failIdentityRun && query.includes("INSERT INTO crawler_identity_counts"))) throw new Error("d1 unavailable");
        return { success: true };
      },
      first: async () => null,
      all: async () => ({ results: freshRuleRows }),
    };
    return {
      ...result,
      bind: (...bound: unknown[]) => {
        sql.push(query);
        values.push(bound);
        return result;
      },
    };
  };
  return {
    db: { prepare: prepared, batch: async () => (options.batchRows ?? []).map((results) => ({ results })) },
    sql,
    values,
  };
}

function waitContext() {
  const tasks: Promise<unknown>[] = [];
  return { waitUntil(promise: Promise<unknown>) { tasks.push(promise); }, passThroughOnException() {}, props: {}, tasks } as unknown as ExecutionContext & { tasks: Promise<unknown>[] };
}

function withLocation(request: Request, location: { country: string | null; region: string | null; regionCode: string | null }): Request {
  Object.defineProperty(request, "cf", { value: location, configurable: true });
  return request;
}

function observerEnv(db: D1Database) {
  return { DB: db, OPEN_GEO_SELF_TEST_SECRET: openGeoSecret, OBSERVER_READ_SECRET: readSecret };
}

async function readRequest(range: "24h" | "7d" | "30d", host = "me.itheheda.online"): Promise<Request> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const canonical = `v1\nread\n${timestamp}\nGET\n${host}\n/_crawler-observer/v1/analytics\nrange=${range}`;
  return new Request(`https://${host}/_crawler-observer/v1/analytics?range=${range}`, {
    headers: { "X-Observer-Timestamp": timestamp, "X-Observer-Signature": await signature(readSecret, canonical) },
  });
}

describe("crawler observer cryptographic classification", () => {
  it("accepts valid HMAC and rejects stale or invalid signatures", async () => {
    const now = Date.now();
    const timestamp = String(Math.floor(now / 1000));
    const canonical = `v1\nself-test\n${timestamp}\nGET\nme.itheheda.online\n/`;
    const signed = await signature(openGeoSecret, canonical);
    await expect(validHmac(openGeoSecret, timestamp, signed, canonical, now)).resolves.toBe(true);
    await expect(validHmac(openGeoSecret, String(Math.floor(now / 1000) - 301), signed, canonical, now)).resolves.toBe(false);
    const byteTampered = `${signed[0] === "A" ? "B" : "A"}${signed.slice(1)}`;
    await expect(validHmac(openGeoSecret, timestamp, byteTampered, canonical, now)).resolves.toBe(false);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const lastIndex = alphabet.indexOf(signed.at(-1) ?? "");
    expect(lastIndex).toBeGreaterThanOrEqual(0);
    const nonCanonicalEquivalent = `${signed.slice(0, -1)}${alphabet[lastIndex | 1]}`;
    expect(nonCanonicalEquivalent).not.toBe(signed);
    await expect(validHmac(openGeoSecret, timestamp, nonCanonicalEquivalent, canonical, now)).resolves.toBe(false);
    for (const tampered of [
      canonical.replace("GET", "POST"),
      canonical.replace("me.itheheda.online", "attacker.example"),
      canonical.replace("\n/", "\n/changed"),
      `v1\nread\n${timestamp}\nGET\nme.itheheda.online\n/_crawler-observer/v1/analytics\nrange=7d`,
    ]) {
      await expect(validHmac(openGeoSecret, timestamp, signed, tampered, now)).resolves.toBe(false);
    }
  });

  it("prioritizes a valid Open GEO signature and separates declared Open GEO traffic from AI identities", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const canonical = `v1\nself-test\n${timestamp}\nGET\nme.itheheda.online\n/`;
    const signed = new Request("https://me.itheheda.online/", { headers: { "User-Agent": "GPTBot", "X-OpenGeo-Timestamp": timestamp, "X-OpenGeo-Signature": await signature(openGeoSecret, canonical) } });
    await expect(classify(signed, observerEnv(fakeDb().db as D1Database))).resolves.toMatchObject({ category: "open_geo_self_test" });
    const unsigned = new Request("https://me.itheheda.online/", { headers: { "User-Agent": "GPTBot" } });
    await expect(classify(unsigned, observerEnv(fakeDb().db as D1Database))).resolves.toMatchObject({ category: "identified_ai_crawler" });
    const declaredOpenGeo = new Request("https://me.itheheda.online/", { headers: { "User-Agent": "OpenGeoConsoleBot/1.0" } });
    await expect(classify(declaredOpenGeo, observerEnv(fakeDb().db as D1Database))).resolves.toMatchObject({
      category: "other_automation",
      id: "open-geo-declared-test",
      openGeoVerified: false,
    });
  });

  it("identifies known AI, generic automation, and ignores normal traffic", async () => {
    const env = observerEnv(fakeDb().db as D1Database);
    await expect(classify(new Request("https://me.itheheda.online/", { headers: { "User-Agent": "GPTBot" } }), env)).resolves.toMatchObject({ category: "identified_ai_crawler" });
    await expect(classify(new Request("https://me.itheheda.online/", { headers: { "User-Agent": "curl/8.4.0" } }), env)).resolves.toMatchObject({ category: "other_automation" });
    await expect(classify(new Request("https://me.itheheda.online/", { headers: { "User-Agent": "AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36" } }), env)).resolves.toBeNull();
  });
});

describe("crawler observer website isolation", () => {
  it("records likely human HTML page views without private request data", async () => {
    const fake = fakeDb();
    const ctx = waitContext();
    const request = withLocation(new Request("https://me.itheheda.online/articles?campaign=private", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
        "CF-Connecting-IP": "198.51.100.42",
      },
    }), { country: "CN", region: "Guangdong", regionCode: "GD" });
    await handleFetch(request, observerEnv(fake.db as D1Database), ctx, async () => new Response("page", {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }));
    await Promise.all(ctx.tasks);
    expect(fake.sql.some((query) => query.includes("INSERT INTO human_page_counts"))).toBe(true);
    expect(fake.sql.some((query) => query.includes("INSERT INTO human_client_counts"))).toBe(true);
    expect(fake.sql.some((query) => query.includes("INSERT INTO human_location_counts"))).toBe(true);
    expect(fake.values.flat()).toContain("/articles");
    expect(fake.values.flat()).toEqual(expect.arrayContaining(["desktop", "chrome", "windows"]));
    expect(fake.values.flat()).toEqual(expect.arrayContaining(["CN", "GD", "Guangdong"]));
    const persisted = JSON.stringify(fake.values);
    expect(persisted).not.toContain("campaign=private");
    expect(persisted).not.toContain("198.51.100.42");
    expect(persisted).not.toContain("Chrome/126.0.0.0");
    expect(persisted).not.toContain("city");
  });

  it("does not count automation, assets, or non-GET requests as human page views", async () => {
    const fake = fakeDb();
    const ctx = waitContext();
    const html = () => new Response("page", { headers: { "Content-Type": "text/html" } });
    await handleFetch(new Request("https://me.itheheda.online/", { headers: { "User-Agent": "GPTBot" } }), observerEnv(fake.db as D1Database), ctx, html);
    await handleFetch(new Request("https://me.itheheda.online/logo.png", { headers: { "User-Agent": "Mozilla/5.0 Chrome/126.0.0.0 Safari/537.36" } }), observerEnv(fake.db as D1Database), ctx, async () => new Response("image", { headers: { "Content-Type": "image/png" } }));
    await handleFetch(new Request("https://me.itheheda.online/contact", { method: "POST", headers: { "User-Agent": "Mozilla/5.0 Chrome/126.0.0.0 Safari/537.36" } }), observerEnv(fake.db as D1Database), ctx, html);
    await Promise.all(ctx.tasks);
    expect(fake.sql.some((query) => query.includes("INSERT INTO human_page_counts"))).toBe(false);
  });
  it("aggregates mobile Safari, tablet Safari, Android Chrome, and WeChat without storing raw User-Agents", async () => {
    const fake = fakeDb();
    const ctx = waitContext();
    const agents = [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0",
    ];
    for (const userAgent of agents) {
      await handleFetch(new Request("https://me.itheheda.online/articles", { headers: { "User-Agent": userAgent } }), observerEnv(fake.db as D1Database), ctx, async () => new Response("page", { headers: { "Content-Type": "text/html" } }));
    }
    await Promise.all(ctx.tasks);
    const clientRows = fake.values.filter((_, index) => fake.sql[index]?.includes("INSERT INTO human_client_counts"));
    expect(clientRows).toEqual([
      [bucketStart(), "mobile", "safari", "ios"],
      [bucketStart(), "tablet", "safari", "ios"],
      [bucketStart(), "mobile", "chrome", "android"],
      [bucketStart(), "mobile", "wechat", "android"],
    ]);
    expect(JSON.stringify(clientRows)).not.toContain("Mozilla/5.0");
  });
  it("calls the origin exactly once, returns its exact response, and strips private request data from V1 and V2 persistence", async () => {
    const fake = fakeDb();
    const ctx = waitContext();
    const origin = new Response("origin body", { status: 202, headers: { "x-origin": "yes" } });
    let calls = 0;
    const request = new Request("https://me.itheheda.online/blog?email=private@example.com", { headers: { "User-Agent": "GPTBot raw-user-agent-value", "CF-Connecting-IP": "198.51.100.99" } });
    const returned = await handleFetch(request, observerEnv(fake.db as D1Database), ctx, async () => { calls += 1; return origin; });
    await Promise.all(ctx.tasks);
    expect(calls).toBe(1);
    expect(returned).toBe(origin);
    expect(returned.headers.get("x-origin")).toBe("yes");
    expect(JSON.stringify(fake.values)).not.toContain("private@example.com");
    expect(JSON.stringify(fake.values)).not.toContain("raw-user-agent-value");
    expect(JSON.stringify(fake.values)).not.toContain("198.51.100.99");
    expect(JSON.stringify(fake.values)).not.toContain("origin body");
    expect(fake.values.flat()).toContain("/blog");
    expect(fake.sql[0]).toContain("INSERT INTO crawler_counts");
    expect(fake.sql.some((query) => query.includes("INSERT INTO crawler_identity_counts"))).toBe(true);
  });

  it("never persists excluded paths and isolates D1 failures from the origin response", async () => {
    const excludedDb = fakeDb();
    const excludedCtx = waitContext();
    await handleFetch(new Request("https://me.itheheda.online/admin/secret", { headers: { "User-Agent": "GPTBot" } }), observerEnv(excludedDb.db as D1Database), excludedCtx, async () => new Response("ok"));
    await Promise.all(excludedCtx.tasks);
    expect(excludedDb.sql).toHaveLength(0);
    expect(excluded("/api/admin/crawlers")).toBe(true);
    expect(excluded("/_crawler-observer/v1/analytics")).toBe(true);
    expect(excluded("/_next/static/chunks/app.js")).toBe(true);
    expect(observedPath(`/${"x".repeat(2049)}`)).toBe("/__path_too_long__");

    const failing = fakeDb({ failRun: true });
    const ctx = waitContext();
    const origin = new Response(null, { status: 204 });
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      await expect(handleFetch(new Request("https://me.itheheda.online/?secret=query", { headers: { "User-Agent": "GPTBot full-user-agent-suffix", "CF-Connecting-IP": "198.51.100.77" } }), observerEnv(failing.db as D1Database), ctx, async () => origin)).resolves.toBe(origin);
      await expect(Promise.all(ctx.tasks)).resolves.toBeDefined();
      const logs = error.mock.calls.flat().join(" ");
      expect(logs).not.toContain("query");
      expect(logs).not.toContain("full-user-agent-suffix");
      expect(logs).not.toContain("198.51.100.77");
    } finally {
      error.mockRestore();
    }
  });

  it("keeps the origin response and V1 write when the V2 shadow write fails", async () => {
    const fake = fakeDb({ failIdentityRun: true });
    const ctx = waitContext();
    const origin = new Response("origin", { status: 202 });
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      await expect(handleFetch(new Request("https://me.itheheda.online/blog?private=query", {
        headers: { "User-Agent": "GPTBot raw-user-agent-value", "CF-Connecting-IP": "198.51.100.99" },
      }), observerEnv(fake.db as D1Database), ctx, async () => origin)).resolves.toBe(origin);
      await expect(Promise.all(ctx.tasks)).resolves.toBeDefined();
      expect(fake.sql.some((query) => query.includes("INSERT INTO crawler_counts"))).toBe(true);
      expect(fake.sql.some((query) => query.includes("INSERT INTO crawler_identity_counts"))).toBe(true);
      const logs = error.mock.calls.flat().join(" ");
      ["private=query", "raw-user-agent-value", "198.51.100.99"].forEach((value) => expect(logs).not.toContain(value));
    } finally {
      error.mockRestore();
    }
  });

  it("redacts sensitive dynamic segments but preserves useful article slugs before D1 binding", async () => {
    const fake = fakeDb();
    const ctx = waitContext();
    const email = "reader@example.com";
    const uuid = "123e4567-e89b-12d3-a456-426614174000";
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature";
    const random = "Qm9VvV2w4Y8sP1aD7fGh3JkL5nRb6TcX";
    const hexToken = "a1b2c3d4e5f60718293a4b5c6d7e8f90";
    const requests = [
      [`/profile/${email}`, "/profile/:email"],
      [`/orders/${uuid}`, "/orders/:uuid"],
      [`/magic-link/${jwt}`, "/magic-link/:token"],
      [`/invite/${random}`, "/invite/:token"],
      [`/reset/${hexToken}`, "/reset/:token"],
      [`/resource/${hexToken}`, "/resource/:token"],
      ["/blog/worker-observability-with-d1", "/blog/worker-observability-with-d1"],
    ] as const;
    for (const [path] of requests) {
      await handleFetch(new Request(`https://me.itheheda.online${path}`, { headers: { "User-Agent": "GPTBot" } }), observerEnv(fake.db as D1Database), ctx, async () => new Response("ok"));
    }
    await Promise.all(ctx.tasks);
    const bound = JSON.stringify(fake.values);
    for (const [raw, normalized] of requests) {
      expect(observedPath(raw)).toBe(normalized);
      expect(bound).toContain(normalized);
    }
    expect(bound).not.toContain(email);
    expect(bound).not.toContain(uuid);
    expect(bound).not.toContain(jwt);
    expect(bound).not.toContain(random);
    expect(bound).not.toContain(hexToken);
  });
});

describe("crawler observer private analytics", () => {
  const batchRows = [
    [{ category: "identified_ai_crawler", requests: 3 }],
    [{ bucket_start: bucketStart(), category: "identified_ai_crawler", requests: 3 }],
    [{ bot_id: "gptbot", bot_name: "GPTBot", category: "identified_ai_crawler", requests: 3 }],
    [{ path: "/", openGeoSelfTest: 0, identifiedAiCrawler: 3, otherAutomation: 0, total: 3 }],
    [{ status: 200, requests: 3 }],
    [{ value: "2026-01-01T00:00:00.000Z" }],
    [{ verification_status: "declared_unverified", requests: 3 }],
    [{ bot_id: "gptbot", bot_name: "GPTBot", provider_id: "openai", provider_name: "OpenAI", verification_status: "declared_unverified", verification_method: "ua_only", requests: 3 }],
    [],
    [{ value: "2026-08-06T00:00:00.000Z" }],
    [{ pageViews: 7 }],
    [{ bucket_start: bucketStart(), pageViews: 7 }],
    [{ path: "/articles", pageViews: 5 }, { path: "/", pageViews: 2 }],
    [{ status: 200, pageViews: 7 }],
    [{ value: "2026-08-05T00:00:00.000Z" }],
    [{ id: "desktop", pageViews: 4 }, { id: "mobile", pageViews: 3 }],
    [{ id: "chrome", pageViews: 4 }, { id: "safari", pageViews: 3 }],
    [{ id: "windows", pageViews: 4 }, { id: "ios", pageViews: 3 }],
    [{ countryCode: "CN", pageViews: 5 }, { countryCode: "US", pageViews: 2 }],
    [{ countryCode: "CN", regionCode: "GD", regionName: "Guangdong", pageViews: 4 }, { countryCode: "US", regionCode: "CA", regionName: "California", pageViews: 2 }],
  ];

  it.each(["24h", "7d", "30d"] as const)("returns the locked %s API schema", async (range) => {
    const response = await analytics(await readRequest(range), observerEnv(fakeDb({ batchRows }).db as D1Database));
    expect(response.status).toBe(200);
    const body = await response.json() as { meta: { range: string }; trend: Array<Record<string, unknown>>; summary: Record<string, unknown>; human: { pageViews: number; paths: Array<Record<string, unknown>>; devices: Array<Record<string, unknown>>; browsers: Array<Record<string, unknown>>; operatingSystems: Array<Record<string, unknown>>; countries: Array<Record<string, unknown>>; regions: Array<Record<string, unknown>> } };
    expect(body.meta.range).toBe(range);
    expect(body.trend).toHaveLength(range === "24h" ? 24 : range === "7d" ? 168 : 720);
    expect(body.trend[0]).toHaveProperty("bucket");
    expect(body.trend[0]).not.toHaveProperty("start");
    expect(body.summary).toMatchObject({ crawlerRequests: 3, identifiedAiCrawler: 3, openGeoSelfTest: 0, otherAutomation: 0 });
    expect(body.human).toMatchObject({ pageViews: 7 });
    expect(body.human.trend.some((row) => row.pageViews === 7)).toBe(true);
    expect(body.human.paths[0]).toMatchObject({ path: "/articles", pageViews: 5 });
    expect(body.human.devices[0]).toEqual({ id: "desktop", pageViews: 4 });
    expect(body.human.browsers[0]).toEqual({ id: "chrome", pageViews: 4 });
    expect(body.human.operatingSystems[0]).toEqual({ id: "windows", pageViews: 4 });
    expect(body.human.countries[0]).toEqual({ countryCode: "CN", pageViews: 5 });
    expect(body.human.regions[0]).toEqual({ countryCode: "CN", regionCode: "GD", regionName: "Guangdong", pageViews: 4 });
    const identityPreview = (body as { identityPreview: { mode: string; summary: Record<string, number>; rules: Array<Record<string, unknown>>; chinaUaCoverage: Array<Record<string, unknown>> } }).identityPreview;
    expect(identityPreview.mode).toBe("shadow");
    expect(identityPreview.summary).toMatchObject({ requests: 3, declaredUnverified: 3 });
    expect(identityPreview.rules).toHaveLength(5);
    expect(identityPreview.rules[0]).toMatchObject({ sourceId: "openai_gptbot", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" });
    expect(identityPreview.chinaUaCoverage).toHaveLength(6);
    expect(identityPreview.chinaUaCoverage).toContainEqual(expect.objectContaining({ id: "deepseekbot", providerName: "DeepSeek", purpose: "unknown", uaToken: "DeepSeekBot", verificationStatus: "declared_unverified" }));
    expect(identityPreview.chinaUaCoverage).toContainEqual(expect.objectContaining({ id: "bytespider", providerName: "ByteDance", purpose: "ai_training", uaToken: "Bytespider", verificationStatus: "declared_unverified" }));
  });

  it("rejects unauthenticated, malformed, and non-GET reads", async () => {
    const env = observerEnv(fakeDb({ batchRows }).db as D1Database);
    await expect(analytics(new Request("https://me.itheheda.online/_crawler-observer/v1/analytics?range=24h"), env)).resolves.toMatchObject({ status: 401 });
    await expect(analytics(new Request("https://me.itheheda.online/_crawler-observer/v1/analytics?range=24h&range=7d"), env)).resolves.toMatchObject({ status: 400 });
    await expect(analytics(new Request("https://me.itheheda.online/_crawler-observer/v1/analytics?range=24h", { method: "POST" }), env)).resolves.toMatchObject({ status: 405 });
  });

  it("accepts either configured read host and rejects a host-tampered signature", async () => {
    const observer = observerEnv(fakeDb({ batchRows }).db as D1Database);
    await expect(analytics(await readRequest("24h", "me.itheheda.online"), observer)).resolves.toMatchObject({ status: 200 });
    await expect(analytics(await readRequest("24h", "crawler-observer.itheheda.online"), observer)).resolves.toMatchObject({ status: 200 });
    const tampered = await readRequest("24h", "me.itheheda.online");
    const tamperedUrl = new URL(tampered.url);
    const headers = new Headers(tampered.headers);
    await expect(analytics(new Request(`https://crawler-observer.itheheda.online${tamperedUrl.pathname}${tamperedUrl.search}`, { headers }), observer)).resolves.toMatchObject({ status: 401 });
    await expect(analytics(await readRequest("24h", "untrusted.example"), observer)).resolves.toMatchObject({ status: 401 });
  });

  it("purges only counts older than the 90-day retention boundary", async () => {
    const fake = fakeDb();
    await purge({ DB: fake.db as D1Database });
    expect(fake.sql[0]).toContain("DELETE FROM crawler_counts");
    expect(fake.sql.some((query) => query.includes("DELETE FROM human_page_counts"))).toBe(true);
    expect(fake.sql.some((query) => query.includes("DELETE FROM human_client_counts"))).toBe(true);
    expect(fake.sql.some((query) => query.includes("DELETE FROM human_location_counts"))).toBe(true);
    expect(fake.sql[1]).toContain("DELETE FROM crawler_identity_counts");
    expect(fake.values.map((value) => value[0])).toEqual([bucketStart() - 90 * 24 * 3600, bucketStart() - 90 * 24 * 3600, bucketStart() - 90 * 24 * 3600, bucketStart() - 90 * 24 * 3600, bucketStart() - 90 * 24 * 3600]);
  });

  it("continues purging and syncing Perplexity when OpenAI rule sources fail", async () => {
    const fake = fakeDb();
    const fetcher = vi.fn().mockImplementation(async (url: string) => {
      if (url.startsWith("https://openai.com/")) throw new Error("source unavailable");
      return new Response(JSON.stringify({
        creationTime: "2026-08-06T00:00:00.000000",
        prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
      }));
    });
    vi.stubGlobal("fetch", fetcher);
    try {
      await scheduledMaintenance(observerEnv(fake.db as D1Database));
    } finally {
      vi.unstubAllGlobals();
    }
    expect(fake.sql.some((query) => query.includes("DELETE FROM crawler_counts"))).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(5);
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual(expect.arrayContaining([
      "https://www.perplexity.ai/perplexitybot.json",
      "https://www.perplexity.ai/perplexity-user.json",
    ]));
  });
});

describe("crawler observer custom domain isolation", () => {
  it("serves a valid signed analytics read on its custom domain without calling the origin", async () => {
    const observer = observerEnv(fakeDb({ batchRows: [[], [], [], [], [], [{ value: "2026-01-01T00:00:00.000Z" }], [], [], [], [{ value: "2026-08-06T00:00:00.000Z" }]] }).db as D1Database);
    const ctx = waitContext();
    const origin = vi.fn(async () => new Response("must not be called"));
    const response = await handleFetch(await readRequest("24h", "crawler-observer.itheheda.online"), observer, ctx, origin);
    expect(response.status).toBe(200);
    expect(origin).not.toHaveBeenCalled();
    expect(ctx.tasks).toHaveLength(0);
  });

  it("serves only the exact analytics path on its custom domain and never calls the origin", async () => {
    const observer = observerEnv(fakeDb({ batchRows: [[], [], [], [], [], [{ value: "2026-01-01T00:00:00.000Z" }]] }).db as D1Database);
    const ctx = waitContext();
    const origin = vi.fn(async () => new Response("must not be called"));
    const response = await handleFetch(new Request("https://crawler-observer.itheheda.online/not-the-api"), observer, ctx, origin);
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(origin).not.toHaveBeenCalled();
    expect(ctx.tasks).toHaveLength(0);
  });

  it("rejects custom-domain analytics POST requests without calling the origin", async () => {
    const observer = observerEnv(fakeDb().db as D1Database);
    const ctx = waitContext();
    const origin = vi.fn(async () => new Response("must not be called"));
    const response = await handleFetch(new Request("https://crawler-observer.itheheda.online/_crawler-observer/v1/analytics?range=24h", { method: "POST" }), observer, ctx, origin);
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(origin).not.toHaveBeenCalled();
    expect(ctx.tasks).toHaveLength(0);
  });

  it("rejects invalid custom-domain analytics signatures without calling the origin", async () => {
    const observer = observerEnv(fakeDb().db as D1Database);
    const ctx = waitContext();
    const origin = vi.fn(async () => new Response("must not be called"));
    const request = await readRequest("24h", "crawler-observer.itheheda.online");
    const headers = new Headers(request.headers);
    headers.set("X-Observer-Signature", "not-a-valid-hmac");
    const response = await handleFetch(new Request(request.url, { headers }), observer, ctx, origin);
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(origin).not.toHaveBeenCalled();
    expect(ctx.tasks).toHaveLength(0);
  });

  it("rejects unknown hosts without calling the origin", async () => {
    const observer = observerEnv(fakeDb().db as D1Database);
    const ctx = waitContext();
    const origin = vi.fn(async () => new Response("must not be called"));
    const response = await handleFetch(new Request("https://untrusted.example/"), observer, ctx, origin);
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(origin).not.toHaveBeenCalled();
    expect(ctx.tasks).toHaveLength(0);
  });

  it("forwards ordinary me host requests exactly once", async () => {
    const observer = observerEnv(fakeDb().db as D1Database);
    const ctx = waitContext();
    const originResponse = new Response("origin");
    const origin = vi.fn(async () => originResponse);
    await expect(handleFetch(new Request("https://me.itheheda.online/ordinary", { headers: { "User-Agent": "Mozilla/5.0" } }), observer, ctx, origin)).resolves.toBe(originResponse);
    expect(origin).toHaveBeenCalledTimes(1);
    await Promise.all(ctx.tasks);
  });
});

describe("crawler observer Miniflare D1 integration", () => {
  beforeEach(async () => {
    for (const statement of migrationSql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)) {
      await env.DB.prepare(statement).run();
    }
    for (const statement of identityMigrationSql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)) {
      await env.DB.prepare(statement).run();
    }
    for (const statement of humanPageMigrationSql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)) {
      await env.DB.prepare(statement).run();
    }
    await env.DB.prepare("DELETE FROM crawler_counts").run();
    await env.DB.prepare("DELETE FROM crawler_identity_counts").run();
    await env.DB.prepare("DELETE FROM human_page_counts").run();
    await env.DB.prepare("DELETE FROM human_location_counts").run();
    await env.DB.prepare("DELETE FROM crawler_rule_sets").run();
  });

  it("has a dedicated privacy-preserving human page-view table", async () => {
    const tables = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('human_page_counts', 'human_client_counts', 'human_location_counts') ORDER BY name").all<{ name: string }>();
    expect(tables.results.map((row) => row.name)).toEqual(["human_client_counts", "human_location_counts", "human_page_counts"]);
  });

  it("applies the migration, upserts real D1 counts, aggregates analytics, and purges through the scheduled handler", async () => {
    const ctx = waitContext();
    const request = new Request("https://me.itheheda.online/integration-path?private=query", { headers: { "User-Agent": "GPTBot" } });
    await handleFetch(request, env, ctx, async () => new Response("origin", { status: 201 }));
    await handleFetch(request, env, ctx, async () => new Response("origin", { status: 201 }));
    await Promise.all(ctx.tasks);
    const count = await env.DB.prepare("SELECT count, path, status FROM crawler_counts WHERE path = ?").bind("/integration-path").first<{ count: number; path: string; status: number }>();
    expect(count).toEqual({ count: 2, path: "/integration-path", status: 201 });

    const bootstrapFetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify({
      creationTime: "2026-08-06T00:00:00.000Z", prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
    })));
    vi.stubGlobal("fetch", bootstrapFetcher);
    const report = await analytics(await readRequest("24h"), observerEnv(env.DB));
    vi.unstubAllGlobals();
    expect(report.status).toBe(200);
    const body = await report.json() as { summary: { crawlerRequests: number }; trend: Array<{ bucket: string }> };
    expect(body.summary.crawlerRequests).toBe(2);
    expect(body.trend).toHaveLength(24);
    expect(body.trend[0]?.bucket).toMatch(/Z$/);
    expect(bootstrapFetcher).toHaveBeenCalledTimes(5);
    const bootstrappedRules = await env.DB.prepare("SELECT COUNT(*) count FROM crawler_rule_sets WHERE last_success_at IS NOT NULL").first<{ count: number }>();
    expect(bootstrappedRules?.count).toBe(5);

    const oldBucket = bucketStart() - 90 * 24 * 3600 - 3600;
    await env.DB.prepare("INSERT INTO crawler_counts (bucket_start, bot_id, bot_name, category, path, status, count) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(oldBucket, "gptbot", "GPTBot", "identified_ai_crawler", "/old", 200, 1)
      .run();
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      creationTime: "2026-08-06T00:00:00.000Z", prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
    })));
    vi.stubGlobal("fetch", fetcher);
    try {
      const scheduledCtx = waitContext();
      worker.scheduled({} as ScheduledEvent, env, scheduledCtx);
      await Promise.all(scheduledCtx.tasks);
    } finally {
      vi.unstubAllGlobals();
    }
    const old = await env.DB.prepare("SELECT count FROM crawler_counts WHERE path = ?").bind("/old").first<{ count: number }>();
    expect(old).toBeNull();
  });

  it("stores declared Open GEO traffic separately without granting signed trust", async () => {
    const ctx = waitContext();
    const request = new Request("https://me.itheheda.online/open-geo-check", {
      headers: { "User-Agent": "OpenGeoConsoleBot/1.0 (+https://github.com/open-geo-console)" },
    });

    await handleFetch(request, observerEnv(env.DB), ctx, async () => new Response("origin", { status: 200 }));
    await Promise.all(ctx.tasks);

    const v1 = await env.DB.prepare("SELECT bot_id, category, path, count FROM crawler_counts WHERE path = ?")
      .bind("/open-geo-check")
      .first<{ bot_id: string; category: string; path: string; count: number }>();
    expect(v1).toEqual({ bot_id: "open-geo-declared-test", category: "other_automation", path: "/open-geo-check", count: 1 });
    const v2 = await env.DB.prepare("SELECT bot_id, provider_id, verification_status, verification_method FROM crawler_identity_counts WHERE path = ?")
      .bind("/open-geo-check")
      .first<{ bot_id: string; provider_id: string; verification_status: string; verification_method: string }>();
    expect(v2).toEqual({
      bot_id: "open-geo-declared-test",
      provider_id: "open-geo",
      verification_status: "declared_unverified",
      verification_method: "ua_only",
    });

    const assetCtx = waitContext();
    await handleFetch(new Request("https://me.itheheda.online/images/hero.png", {
      headers: { "User-Agent": "OpenGeoConsoleBot/1.0" },
    }), env, assetCtx, async () => new Response("image", { status: 200 }));
    await Promise.all(assetCtx.tasks);
    const asset = await env.DB.prepare("SELECT count FROM crawler_counts WHERE path = ?").bind("/images/hero.png").first<{ count: number }>();
    expect(asset).toBeNull();
  });

  it("persists signed Open GEO traffic as trusted in both V1 and V2", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const path = "/signed-open-geo-check";
    const canonical = `v1\nself-test\n${timestamp}\nGET\nme.itheheda.online\n${path}`;
    const request = new Request(`https://me.itheheda.online${path}`, {
      headers: {
        "User-Agent": "GPTBot",
        "X-OpenGeo-Timestamp": timestamp,
        "X-OpenGeo-Signature": await signature(openGeoSecret, canonical),
      },
    });
    const ctx = waitContext();

    await handleFetch(request, observerEnv(env.DB), ctx, async () => new Response("origin", { status: 200 }));
    await Promise.all(ctx.tasks);

    const v1 = await env.DB.prepare("SELECT bot_id, category FROM crawler_counts WHERE path = ?").bind(path).first<{ bot_id: string; category: string }>();
    expect(v1).toEqual({ bot_id: "open-geo-self-test", category: "open_geo_self_test" });
    const v2 = await env.DB.prepare("SELECT bot_id, verification_status, verification_method FROM crawler_identity_counts WHERE path = ?").bind(path).first<{
      bot_id: string; verification_status: string; verification_method: string;
    }>();
    expect(v2).toEqual({ bot_id: "open-geo-self-test", verification_status: "verified_official", verification_method: "signed_hmac" });
  });

  it("persists a post-sync official crawler request as verified", async () => {
    const now = new Date();
    await env.DB.prepare("INSERT INTO crawler_rule_sets (source_id, source_url, prefixes_json, content_sha256, source_created_at, last_attempt_at, last_success_at, last_error_code) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)")
      .bind("openai_searchbot", "https://openai.com/searchbot.json", '["203.0.113.0/24"]', "0".repeat(64), now.toISOString(), now.toISOString(), now.toISOString())
      .run();
    const path = "/official-oai-check";
    const request = new Request(`https://me.itheheda.online${path}`, {
      headers: { "User-Agent": "OAI-SearchBot/1.0", "CF-Connecting-IP": "203.0.113.8" },
    });
    const ctx = waitContext();

    await handleFetch(request, env, ctx, async () => new Response("origin", { status: 200 }));
    await Promise.all(ctx.tasks);

    const v2 = await env.DB.prepare("SELECT bot_id, verification_status, verification_method FROM crawler_identity_counts WHERE path = ?").bind(path).first<{
      bot_id: string; verification_status: string; verification_method: string;
    }>();
    expect(v2).toEqual({ bot_id: "oai-searchbot", verification_status: "verified_official", verification_method: "official_ip_range" });
  });

  it("creates privacy-preserving V2 shadow tables", async () => {
    for (const statement of identityMigrationSql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)) {
      await env.DB.prepare(statement).run();
    }
    const columns = await env.DB.prepare("PRAGMA table_info(crawler_identity_counts)").all<{ name: string }>();
    const names = columns.results.map((column) => column.name);
    expect(names).toContain("verification_status");
    expect(names).toContain("verification_method");
    expect(names).not.toContain("ip");
    expect(names).not.toContain("ip_hash");
    expect(names).not.toContain("user_agent");
    const meta = await env.DB.prepare("SELECT value FROM crawler_identity_meta WHERE key = 'shadow_started_at'").first<{ value: string }>();
    expect(meta?.value).toMatch(/Z$/);
  });
});
