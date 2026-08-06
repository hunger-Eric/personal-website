import { describe, expect, it, vi } from "vitest";
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

describe("crawler observer analytics service", () => {
  it("defaults missing ranges and rejects unsupported ranges", () => {
    expect(parseCrawlerRange(undefined)).toBe("24h");
    expect(() => parseCrawlerRange("all")).toThrow(expect.objectContaining({ code: "invalid_range" }));
  });

  it("requires the observer read secret", async () => {
    await expect(getCrawlerAnalytics("24h", { now, env: { readSecret: "" } })).rejects.toMatchObject({ code: "configuration_missing" });
  });

  it("signs the canonical same-origin request and validates the response", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    const result = await getCrawlerAnalytics("7d", { now, env: { readSecret: "secret" }, fetch });
    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).toBe("https://me.itheheda.online/_crawler-observer/v1/analytics?range=7d");
    expect(init).toMatchObject({ method: "GET", cache: "no-store", headers: { "X-Observer-Timestamp": "1786017600" } });
    expect(init.headers["X-Observer-Signature"]).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(result).toEqual(response);
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
});
