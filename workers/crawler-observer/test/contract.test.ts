import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import worker from "../src/index";
import { analytics, bucketStart, classify, excluded, handleFetch, observedPath, purge, validHmac } from "../src/core";
import migrationSql from "../migrations/0001_initial.sql?raw";

const openGeoSecret = "open-geo-test-secret";
const readSecret = "observer-read-test-secret";

function base64Url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function signature(secret: string, canonical: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(canonical)));
}

function fakeDb(options: { failRun?: boolean; batchRows?: Record<string, unknown>[][] } = {}) {
  const sql: string[] = [];
  const values: unknown[][] = [];
  const prepared = (query: string) => ({
    bind: (...bound: unknown[]) => {
      sql.push(query);
      values.push(bound);
      return { run: async () => { if (options.failRun) throw new Error("d1 unavailable"); return { success: true }; } };
    },
  });
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

function observerEnv(db: D1Database) {
  return { DB: db, OPEN_GEO_SELF_TEST_SECRET: openGeoSecret, OBSERVER_READ_SECRET: readSecret };
}

async function readRequest(range: "24h" | "7d" | "30d"): Promise<Request> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const canonical = `v1\nread\n${timestamp}\nGET\nme.itheheda.online\n/_crawler-observer/v1/analytics\nrange=${range}`;
  return new Request(`https://me.itheheda.online/_crawler-observer/v1/analytics?range=${range}`, {
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

  it("prioritizes a valid Open GEO signature and never treats an unsigned UA as self-test", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const canonical = `v1\nself-test\n${timestamp}\nGET\nme.itheheda.online\n/`;
    const signed = new Request("https://me.itheheda.online/", { headers: { "User-Agent": "GPTBot", "X-OpenGeo-Timestamp": timestamp, "X-OpenGeo-Signature": await signature(openGeoSecret, canonical) } });
    await expect(classify(signed, observerEnv(fakeDb().db as D1Database))).resolves.toMatchObject({ category: "open_geo_self_test" });
    const unsigned = new Request("https://me.itheheda.online/", { headers: { "User-Agent": "GPTBot" } });
    await expect(classify(unsigned, observerEnv(fakeDb().db as D1Database))).resolves.toMatchObject({ category: "identified_ai_crawler" });
  });

  it("identifies known AI, generic automation, and ignores normal traffic", async () => {
    const env = observerEnv(fakeDb().db as D1Database);
    await expect(classify(new Request("https://me.itheheda.online/", { headers: { "User-Agent": "GPTBot" } }), env)).resolves.toMatchObject({ category: "identified_ai_crawler" });
    await expect(classify(new Request("https://me.itheheda.online/", { headers: { "User-Agent": "curl/8.4.0" } }), env)).resolves.toMatchObject({ category: "other_automation" });
    await expect(classify(new Request("https://me.itheheda.online/", { headers: { "User-Agent": "AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36" } }), env)).resolves.toBeNull();
  });
});

describe("crawler observer website isolation", () => {
  it("calls the origin exactly once, returns its exact response, and strips query and UA from persistence", async () => {
    const fake = fakeDb();
    const ctx = waitContext();
    const origin = new Response("origin body", { status: 202, headers: { "x-origin": "yes" } });
    let calls = 0;
    const request = new Request("https://me.itheheda.online/blog?email=private@example.com", { headers: { "User-Agent": "GPTBot raw-user-agent-value" } });
    const returned = await handleFetch(request, observerEnv(fake.db as D1Database), ctx, async () => { calls += 1; return origin; });
    await Promise.all(ctx.tasks);
    expect(calls).toBe(1);
    expect(returned).toBe(origin);
    expect(returned.headers.get("x-origin")).toBe("yes");
    expect(JSON.stringify(fake.values)).not.toContain("private@example.com");
    expect(JSON.stringify(fake.values)).not.toContain("raw-user-agent-value");
    expect(fake.values.flat()).toContain("/blog");
  });

  it("never persists excluded paths and isolates D1 failures from the origin response", async () => {
    const excludedDb = fakeDb();
    const excludedCtx = waitContext();
    await handleFetch(new Request("https://me.itheheda.online/admin/secret", { headers: { "User-Agent": "GPTBot" } }), observerEnv(excludedDb.db as D1Database), excludedCtx, async () => new Response("ok"));
    await Promise.all(excludedCtx.tasks);
    expect(excludedDb.sql).toHaveLength(0);
    expect(excluded("/api/admin/crawlers")).toBe(true);
    expect(excluded("/_crawler-observer/v1/analytics")).toBe(true);
    expect(observedPath(`/${"x".repeat(2049)}`)).toBe("/__path_too_long__");

    const failing = fakeDb({ failRun: true });
    const ctx = waitContext();
    const origin = new Response(null, { status: 204 });
    await expect(handleFetch(new Request("https://me.itheheda.online/", { headers: { "User-Agent": "GPTBot" } }), observerEnv(failing.db as D1Database), ctx, async () => origin)).resolves.toBe(origin);
    await expect(Promise.all(ctx.tasks)).resolves.toBeDefined();
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
  ];

  it.each(["24h", "7d", "30d"] as const)("returns the locked %s API schema", async (range) => {
    const response = await analytics(await readRequest(range), observerEnv(fakeDb({ batchRows }).db as D1Database));
    expect(response.status).toBe(200);
    const body = await response.json() as { meta: { range: string }; trend: Array<Record<string, unknown>>; summary: Record<string, unknown> };
    expect(body.meta.range).toBe(range);
    expect(body.trend).toHaveLength(range === "24h" ? 24 : range === "7d" ? 168 : 720);
    expect(body.trend[0]).toHaveProperty("bucket");
    expect(body.trend[0]).not.toHaveProperty("start");
    expect(body.summary).toMatchObject({ crawlerRequests: 3, identifiedAiCrawler: 3, openGeoSelfTest: 0, otherAutomation: 0 });
  });

  it("rejects unauthenticated, malformed, and non-GET reads", async () => {
    const env = observerEnv(fakeDb({ batchRows }).db as D1Database);
    await expect(analytics(new Request("https://me.itheheda.online/_crawler-observer/v1/analytics?range=24h"), env)).resolves.toMatchObject({ status: 401 });
    await expect(analytics(new Request("https://me.itheheda.online/_crawler-observer/v1/analytics?range=24h&range=7d"), env)).resolves.toMatchObject({ status: 400 });
    await expect(analytics(new Request("https://me.itheheda.online/_crawler-observer/v1/analytics?range=24h", { method: "POST" }), env)).resolves.toMatchObject({ status: 405 });
  });

  it("purges only counts older than the 90-day retention boundary", async () => {
    const fake = fakeDb();
    await purge({ DB: fake.db as D1Database });
    expect(fake.sql[0]).toContain("DELETE FROM crawler_counts");
    expect(fake.values[0]?.[0]).toBe(bucketStart() - 90 * 24 * 3600);
  });
});

describe("crawler observer Miniflare D1 integration", () => {
  beforeEach(async () => {
    for (const statement of migrationSql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)) {
      await env.DB.prepare(statement).run();
    }
    await env.DB.prepare("DELETE FROM crawler_counts").run();
  });

  it("applies the migration, upserts real D1 counts, aggregates analytics, and purges through the scheduled handler", async () => {
    const ctx = waitContext();
    const request = new Request("https://me.itheheda.online/integration-path?private=query", { headers: { "User-Agent": "GPTBot" } });
    await handleFetch(request, env, ctx, async () => new Response("origin", { status: 201 }));
    await handleFetch(request, env, ctx, async () => new Response("origin", { status: 201 }));
    await Promise.all(ctx.tasks);
    const count = await env.DB.prepare("SELECT count, path, status FROM crawler_counts WHERE path = ?").bind("/integration-path").first<{ count: number; path: string; status: number }>();
    expect(count).toEqual({ count: 2, path: "/integration-path", status: 201 });

    const report = await analytics(await readRequest("24h"), observerEnv(env.DB));
    expect(report.status).toBe(200);
    const body = await report.json() as { summary: { crawlerRequests: number }; trend: Array<{ bucket: string }> };
    expect(body.summary.crawlerRequests).toBe(2);
    expect(body.trend).toHaveLength(24);
    expect(body.trend[0]?.bucket).toMatch(/Z$/);

    const oldBucket = bucketStart() - 90 * 24 * 3600 - 3600;
    await env.DB.prepare("INSERT INTO crawler_counts (bucket_start, bot_id, bot_name, category, path, status, count) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(oldBucket, "gptbot", "GPTBot", "identified_ai_crawler", "/old", 200, 1)
      .run();
    const scheduledCtx = waitContext();
    worker.scheduled({} as ScheduledEvent, env, scheduledCtx);
    await Promise.all(scheduledCtx.tasks);
    const old = await env.DB.prepare("SELECT count FROM crawler_counts WHERE path = ?").bind("/old").first<{ count: number }>();
    expect(old).toBeNull();
  });
});
