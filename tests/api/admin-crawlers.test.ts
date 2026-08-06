import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { CrawlerAnalyticsError, type CrawlerAnalyticsResponse } from "@/lib/crawler-analytics/types";

vi.mock("@/lib/crawler-analytics/service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/crawler-analytics/service")>("@/lib/crawler-analytics/service");
  return { ...actual, getCrawlerAnalytics: vi.fn() };
});
import { GET } from "@/app/api/admin/crawlers/route";
import { getCrawlerAnalytics } from "@/lib/crawler-analytics/service";

const fixture: CrawlerAnalyticsResponse = {
  meta: { range: "7d", start: "2026-08-01T00:00:00.000Z", end: "2026-08-08T00:00:00.000Z", generatedAt: "2026-08-08T00:00:00.000Z", source: "cloudflare-worker-d1", bucket: "hour", retentionDays: 90, databaseInitializedAt: "2026-08-01T00:00:00.000Z", requestedWindowComplete: true, bestEffort: true, classifier: { aiCrawlerBots: "0.6.3", otherBots: "isbot@5.2.1" } },
  summary: { crawlerRequests: 2, identifiedAiCrawler: 1, openGeoSelfTest: 1, otherAutomation: 0 }, trend: [], bots: [], paths: [], statuses: [],
};
const request = (query = "", auth = true) => new NextRequest(`https://me.itheheda.online/api/admin/crawlers${query}`, { headers: auth ? { Authorization: `Basic ${Buffer.from("admin:secret").toString("base64")}` } : {} });

describe("GET /api/admin/crawlers", () => {
  beforeEach(() => { vi.clearAllMocks(); process.env.CRAWLER_DASHBOARD_PASSWORD = "secret"; });
  it("keeps Basic Auth before the observer service", async () => {
    const result = await GET(request("", false));
    expect(result.status).toBe(401); expect(result.headers.get("www-authenticate")).toContain("Basic"); expect(getCrawlerAnalytics).not.toHaveBeenCalled();
  });
  it("returns private no-store observer data", async () => {
    vi.mocked(getCrawlerAnalytics).mockResolvedValue(fixture);
    const result = await GET(request("?range=7d"));
    expect(result.status).toBe(200); expect(result.headers.get("cache-control")).toBe("private, no-store"); expect(getCrawlerAnalytics).toHaveBeenCalledWith("7d");
  });
  it("rejects invalid ranges without invoking the observer", async () => {
    const result = await GET(request("?range=nope"));
    expect(result.status).toBe(400); expect(getCrawlerAnalytics).not.toHaveBeenCalled();
  });
  it.each([["observer_auth_invalid", 502], ["observer_unavailable", 502], ["configuration_missing", 503]] as const)("maps %s to HTTP %s", async (code, status) => {
    vi.mocked(getCrawlerAnalytics).mockRejectedValue(new CrawlerAnalyticsError(code, "secret upstream detail"));
    const result = await GET(request());
    expect(result.status).toBe(status); await expect(result.json()).resolves.toEqual({ error: { code, message: code === "configuration_missing" ? "Crawler observer is not configured" : "Crawler observer is unavailable" } });
  });
});
