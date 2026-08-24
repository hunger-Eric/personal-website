import { describe, expect, it } from "vitest";
import { crawlerAnalyticsWorkerSchema } from "@/lib/crawler-analytics/worker-schema";

const valid = () => ({
  meta: { range: "30d", start: "2026-07-07T00:00:00.000Z", end: "2026-08-06T00:00:00.000Z", generatedAt: "2026-08-06T00:00:00.000Z", source: "cloudflare-worker-d1", bucket: "hour", retentionDays: 90, databaseInitializedAt: "2026-07-10T00:00:00.000Z", requestedWindowComplete: false, bestEffort: true, classifier: { aiCrawlerBots: "0.6.3", otherBots: "isbot@5.2.1" } },
  summary: { crawlerRequests: 3, identifiedAiCrawler: 1, openGeoSelfTest: 1, otherAutomation: 1 },
  human: {
    trackingStartedAt: "2026-08-05T00:00:00.000Z",
    requestedWindowComplete: false,
    pageViews: 7,
    trend: [{ bucket: "2026-08-05T23:00:00.000Z", pageViews: 7 }],
    paths: [{ path: "/articles", pageViews: 5 }, { path: "/", pageViews: 2 }],
    statuses: [{ status: 200, pageViews: 7 }],
    devices: [{ id: "desktop", pageViews: 4 }, { id: "mobile", pageViews: 3 }],
    browsers: [{ id: "chrome", pageViews: 4 }, { id: "safari", pageViews: 3 }],
    operatingSystems: [{ id: "windows", pageViews: 4 }, { id: "ios", pageViews: 3 }],
    countries: [{ countryCode: "CN", pageViews: 5 }, { countryCode: "US", pageViews: 2 }],
    regions: [{ countryCode: "CN", regionCode: "GD", regionName: "Guangdong", pageViews: 5 }],
  },
  trend: [], bots: [], paths: [{ path: "/", total: 3, identifiedAiCrawler: 1, openGeoSelfTest: 1, otherAutomation: 1 }], statuses: [{ status: 200, requests: 3 }],
  identityPreview: { mode: "shadow", shadowStartedAt: "2026-08-06T00:00:00.000Z", summary: { requests: 4, verifiedOfficial: 1, declaredUnverified: 1, suspectedSpoof: 1, otherAutomation: 1 }, bots: [{ id: "gptbot", name: "GPTBot", providerId: "openai", providerName: "OpenAI", verificationStatus: "verified_official", verificationMethod: "official_ip_range", requests: 1 }], rules: [
    { sourceId: "openai_gptbot", lastAttemptAt: "2026-08-06T00:00:00.000Z", lastSuccessAt: "2026-08-06T00:00:00.000Z", state: "fresh" },
    { sourceId: "openai_searchbot", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" }, { sourceId: "openai_chatgpt_user", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" }, { sourceId: "perplexity_bot", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" }, { sourceId: "perplexity_user", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" },
  ], chinaUaCoverage: [
    { id: "deepseekbot", name: "DeepSeekBot", providerName: "DeepSeek", purpose: "unknown", uaToken: "DeepSeekBot", verificationStatus: "declared_unverified", verificationMethod: "ua_only" },
    { id: "bytespider", name: "Bytespider", providerName: "ByteDance", purpose: "ai_training", uaToken: "Bytespider", verificationStatus: "declared_unverified", verificationMethod: "ua_only" },
  ] },
});

describe("crawler observer schema", () => {
  it("accepts 30d partial-history data", () => {
    const result = crawlerAnalyticsWorkerSchema.safeParse(valid());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.human?.regions[0]).toEqual({ countryCode: "CN", regionCode: "GD", regionName: "Guangdong", pageViews: 5 });
      expect(result.data.identityPreview?.chinaUaCoverage?.[0]).toMatchObject({ id: "deepseekbot", verificationStatus: "declared_unverified" });
    }
  });
  it("rejects malformed human browser analytics", () => {
    const negative = valid(); negative.human.pageViews = -1;
    expect(crawlerAnalyticsWorkerSchema.safeParse(negative).success).toBe(false);
    const unsafePath = valid(); unsafePath.human.paths[0].path = "not-a-path";
    expect(crawlerAnalyticsWorkerSchema.safeParse(unsafePath).success).toBe(false);
    const unknownDevice = valid(); unknownDevice.human.devices[0].id = "television";
    expect(crawlerAnalyticsWorkerSchema.safeParse(unknownDevice).success).toBe(false);
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
    const falseTrust = valid(); (falseTrust.identityPreview.chinaUaCoverage[0] as Record<string, unknown>).verificationStatus = "verified_official";
    expect(crawlerAnalyticsWorkerSchema.safeParse(falseTrust).success).toBe(false);
  });
});
