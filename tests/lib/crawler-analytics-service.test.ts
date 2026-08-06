import { afterEach, describe, expect, it, vi } from "vitest";
import { getCrawlerAnalytics, parseCrawlerRange } from "@/lib/crawler-analytics/service";

const now = new Date("2026-08-06T12:00:00.000Z");
const response = {
  meta: {
    range: "7d", start: "2026-07-30T12:00:00.000Z", end: "2026-08-06T12:00:00.000Z", generatedAt: "2026-08-06T12:00:00.000Z",
    source: "cloudflare-worker-d1", bucket: "hour", retentionDays: 90, databaseInitializedAt: "2026-08-01T00:00:00.000Z",
    requestedWindowComplete: false, bestEffort: true, classifier: { aiCrawlerBots: "0.6.3", otherBots: "isbot@5.2.1" },
  },
  summary: { crawlerRequests: 2, identifiedAiCrawler: 1, openGeoSelfTest: 1, otherAutomation: 0 },
  trend: [], bots: [], paths: [], statuses: [],
};

function base64Url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function signature(secret: string, canonical: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(canonical)));
}

describe("crawler observer analytics service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults missing ranges and rejects unsupported ranges", () => {
    expect(parseCrawlerRange(undefined)).toBe("24h");
    expect(() => parseCrawlerRange("all")).toThrow(expect.objectContaining({ code: "invalid_range" }));
  });

  it("requires the observer read secret", async () => {
    await expect(getCrawlerAnalytics("24h", { now, env: { readSecret: "" } })).rejects.toMatchObject({ code: "configuration_missing" });
  });

  it("signs the canonical custom-domain request and validates the response", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await getCrawlerAnalytics("7d", { now, env: { readSecret: "secret" }, fetch });
    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).toBe("https://crawler-observer.itheheda.online/_crawler-observer/v1/analytics?range=7d");
    expect(init).toMatchObject({ method: "GET", cache: "no-store", headers: { "X-Observer-Timestamp": "1786017600" } });
    expect(init.headers["X-Observer-Signature"]).toBe(
      await signature("secret", "v1\nread\n1786017600\nGET\ncrawler-observer.itheheda.online\n/_crawler-observer/v1/analytics\nrange=7d")
    );
    expect(result).toEqual(response);
    expect(error).not.toHaveBeenCalled();
  });

  it.each([
    [401, "observer_auth_invalid"], [429, "observer_unavailable"], [500, "observer_unavailable"],
  ])("maps worker status %s to %s", async (status, code) => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status }));
    await expect(getCrawlerAnalytics("24h", { now, env: { readSecret: "secret" }, fetch })).rejects.toMatchObject({ code });
  });

  it("maps network and schema failures to observer_unavailable", async () => {
    await expect(getCrawlerAnalytics("24h", { now, env: { readSecret: "secret" }, fetch: vi.fn().mockRejectedValue(new Error("offline")) })).rejects.toMatchObject({ code: "observer_unavailable" });
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...response, summary: {} }), { status: 200 }));
    await expect(getCrawlerAnalytics("7d", { now, env: { readSecret: "secret" }, fetch })).rejects.toMatchObject({ code: "observer_unavailable" });
  });

  it("logs one safe structured event for a fetch failure", async () => {
    const secret = "read-secret-must-not-log";
    const error = new Error(`network ${secret}`);
    error.cause = { code: "ECONNRESET;Authorization=leak" };
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(getCrawlerAnalytics("24h", { now, env: { readSecret: secret }, fetch: vi.fn().mockRejectedValue(error) })).rejects.toMatchObject({ code: "observer_unavailable" });
    expect(consoleError).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(JSON.stringify({
      event: "crawler_observer_read_failed", stage: "fetch", errorName: "Error", causeCode: "ECONNRESETAuthorizationleak",
    }));
    expect(String(consoleError.mock.calls[0][0])).not.toContain(secret);
  });

  it("logs one safe structured event for a non-ok response", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const bodySecret = "response-body-must-not-log";
    const fetch = vi.fn().mockResolvedValue(new Response(bodySecret, { status: 503 }));
    await expect(getCrawlerAnalytics("24h", { now, env: { readSecret: "secret" }, fetch })).rejects.toMatchObject({ code: "observer_unavailable" });
    expect(consoleError).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(JSON.stringify({
      event: "crawler_observer_read_failed", stage: "http_status", status: 503,
    }));
    expect(String(consoleError.mock.calls[0][0])).not.toContain(bodySecret);
  });

  it("logs one safe structured event for invalid JSON", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetch = vi.fn().mockResolvedValue(new Response("not-json-secret", { status: 200 }));
    await expect(getCrawlerAnalytics("24h", { now, env: { readSecret: "secret" }, fetch })).rejects.toMatchObject({ code: "observer_unavailable" });
    expect(consoleError).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(JSON.stringify({ event: "crawler_observer_read_failed", stage: "invalid_json" }));
    expect(String(consoleError.mock.calls[0][0])).not.toContain("not-json-secret");
  });

  it("logs one safe structured event for an invalid schema", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const schemaSecret = "schema-value-must-not-log";
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...response, meta: { ...response.meta, source: schemaSecret } }), { status: 200 }));
    await expect(getCrawlerAnalytics("24h", { now, env: { readSecret: "secret" }, fetch })).rejects.toMatchObject({ code: "observer_unavailable" });
    expect(consoleError).toHaveBeenCalledOnce();
    expect(consoleError).toHaveBeenCalledWith(JSON.stringify({ event: "crawler_observer_read_failed", stage: "invalid_schema" }));
    expect(String(consoleError.mock.calls[0][0])).not.toContain(schemaSecret);
  });
});
