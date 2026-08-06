import { describe, expect, it } from "vitest";
import { crawlerAnalyticsWorkerSchema } from "@/lib/crawler-analytics/worker-schema";

const valid = () => ({
  meta: { range: "30d", start: "2026-07-07T00:00:00.000Z", end: "2026-08-06T00:00:00.000Z", generatedAt: "2026-08-06T00:00:00.000Z", source: "cloudflare-worker-d1", bucket: "hour", retentionDays: 90, databaseInitializedAt: "2026-07-10T00:00:00.000Z", requestedWindowComplete: false, bestEffort: true, classifier: { aiCrawlerBots: "0.6.3", otherBots: "isbot@5.2.1" } },
  summary: { crawlerRequests: 3, identifiedAiCrawler: 1, openGeoSelfTest: 1, otherAutomation: 1 },
  trend: [], bots: [], paths: [{ path: "/", total: 3, identifiedAiCrawler: 1, openGeoSelfTest: 1, otherAutomation: 1 }], statuses: [{ status: 200, requests: 3 }],
});

describe("crawler observer schema", () => {
  it("accepts 30d partial-history data", () => {
    expect(crawlerAnalyticsWorkerSchema.safeParse(valid()).success).toBe(true);
  });
  it("rejects invalid count boundaries and contract sums", () => {
    const status = valid(); status.statuses[0].status = 600;
    expect(crawlerAnalyticsWorkerSchema.safeParse(status).success).toBe(false);
    const summary = valid(); summary.summary.crawlerRequests = 4;
    expect(crawlerAnalyticsWorkerSchema.safeParse(summary).success).toBe(false);
    const path = valid(); path.paths[0].total = 4;
    expect(crawlerAnalyticsWorkerSchema.safeParse(path).success).toBe(false);
  });
  it("rejects oversized collections and unsafe path or bot fields", () => {
    const unsafe = valid(); unsafe.paths[0].path = "no-leading-slash";
    expect(crawlerAnalyticsWorkerSchema.safeParse(unsafe).success).toBe(false);
    const oversized = valid(); oversized.bots = Array.from({ length: 51 }, (_, index) => ({ id: String(index), name: "bot", category: "other_automation" as const, requests: 0 }));
    expect(crawlerAnalyticsWorkerSchema.safeParse(oversized).success).toBe(false);
  });
});
