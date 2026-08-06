import { describe, expect, it } from "vitest";
import { crawlerAnalyticsWorkerSchema } from "@/lib/crawler-analytics/worker-schema";

const valid = () => ({
  meta: { range: "30d", start: "2026-07-07T00:00:00.000Z", end: "2026-08-06T00:00:00.000Z", generatedAt: "2026-08-06T00:00:00.000Z", source: "cloudflare-worker-d1", bucket: "hour", retentionDays: 90, databaseInitializedAt: "2026-07-10T00:00:00.000Z", requestedWindowComplete: false, bestEffort: true, classifier: { aiCrawlerBots: "0.6.3", otherBots: "isbot@5.2.1" } },
  summary: { crawlerRequests: 3, identifiedAiCrawler: 1, openGeoSelfTest: 1, otherAutomation: 1 },
  trend: [], bots: [], paths: [{ path: "/", total: 3, identifiedAiCrawler: 1, openGeoSelfTest: 1, otherAutomation: 1 }], statuses: [{ status: 200, requests: 3 }],
  identityPreview: { mode: "shadow", shadowStartedAt: "2026-08-06T00:00:00.000Z", summary: { requests: 4, verifiedOfficial: 1, declaredUnverified: 1, suspectedSpoof: 1, otherAutomation: 1 }, bots: [{ id: "gptbot", name: "GPTBot", providerId: "openai", providerName: "OpenAI", verificationStatus: "verified_official", verificationMethod: "official_ip_range", requests: 1 }], rules: [
    { sourceId: "openai_gptbot", lastAttemptAt: "2026-08-06T00:00:00.000Z", lastSuccessAt: "2026-08-06T00:00:00.000Z", state: "fresh" },
    { sourceId: "openai_searchbot", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" }, { sourceId: "openai_chatgpt_user", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" }, { sourceId: "perplexity_bot", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" }, { sourceId: "perplexity_user", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" },
  ] },
});

describe("crawler observer schema", () => {
  it("accepts 30d partial-history data", () => {
    expect(crawlerAnalyticsWorkerSchema.safeParse(valid()).success).toBe(true);
  });
  it("accepts a V1 response without the transitional identity preview", () => {
    const v1 = valid();
    delete v1.identityPreview;
    expect(crawlerAnalyticsWorkerSchema.safeParse(v1).success).toBe(true);
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
    const identitySummary = valid(); identitySummary.identityPreview.summary.requests = 5;
    expect(crawlerAnalyticsWorkerSchema.safeParse(identitySummary).success).toBe(false);
    const identityBots = valid(); identityBots.identityPreview.bots = Array.from({ length: 101 }, () => ({ id: "bot", name: "Bot", providerId: "provider", providerName: "Provider", verificationStatus: "declared_unverified" as const, verificationMethod: "ua_only" as const, requests: 0 }));
    expect(crawlerAnalyticsWorkerSchema.safeParse(identityBots).success).toBe(false);
    const leaked = valid(); (leaked.identityPreview.rules[0] as Record<string, unknown>).prefixes = ["203.0.113.0/24"];
    expect(crawlerAnalyticsWorkerSchema.safeParse(leaked).success).toBe(false);
  });
});
