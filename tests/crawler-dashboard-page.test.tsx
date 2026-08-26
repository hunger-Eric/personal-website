// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CrawlerAnalyticsResponse } from "@/lib/crawler-analytics/types";
vi.mock("@/lib/crawler-analytics/service", () => ({ parseCrawlerRange: vi.fn((value) => value ?? "24h"), parseCrawlerSite: vi.fn((value) => value ?? "personal"), getCrawlerAnalytics: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
import * as service from "@/lib/crawler-analytics/service";
import { redirect } from "next/navigation";
import CrawlerDashboardPage, { metadata } from "@/app/admin/(crawler-dashboard)/crawlers/page";

const response: CrawlerAnalyticsResponse = {
  meta: { range: "7d", start: "2026-08-01T00:00:00.000Z", end: "2026-08-06T00:00:00.000Z", generatedAt: "2026-08-06T00:00:00.000Z", source: "cloudflare-worker-d1", bucket: "hour", retentionDays: 90, databaseInitializedAt: "2026-08-01T00:00:00.000Z", requestedWindowComplete: true, bestEffort: true, classifier: { aiCrawlerBots: "0.6.3", otherBots: "isbot@5.2.1" } },
  summary: { crawlerRequests: 1, identifiedAiCrawler: 1, openGeoSelfTest: 0, otherAutomation: 0 }, trend: [], bots: [], paths: [], statuses: [],
  identityPreview: { mode: "shadow", shadowStartedAt: "2026-08-06T00:00:00.000Z", summary: { requests: 4, verifiedOfficial: 1, declaredUnverified: 1, suspectedSpoof: 1, otherAutomation: 1 }, bots: [{ id: "gptbot", name: "GPTBot", providerId: "openai", providerName: "OpenAI", verificationStatus: "verified_official", verificationMethod: "official_ip_range", requests: 1 }], rules: [
    { sourceId: "openai_gptbot", lastAttemptAt: "2026-08-06T00:00:00.000Z", lastSuccessAt: "2026-08-06T00:00:00.000Z", state: "fresh" },
    { sourceId: "openai_searchbot", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" }, { sourceId: "openai_chatgpt_user", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" }, { sourceId: "perplexity_bot", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" }, { sourceId: "perplexity_user", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" },
  ] },
};
describe("CrawlerDashboardPage", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(service.parseCrawlerRange).mockImplementation((value) => (value ?? "24h") as "24h"); vi.mocked(service.parseCrawlerSite).mockImplementation((value) => (value ?? "personal") as "personal"); vi.mocked(service.getCrawlerAnalytics).mockResolvedValue(response); });
  it("redirects the legacy combined route to the human page while preserving range", async () => {
    await CrawlerDashboardPage({ searchParams: Promise.resolve({ range: "7d" }) });
    expect(redirect).toHaveBeenCalledWith("/admin/crawlers/human?site=personal&range=7d");
    expect(service.getCrawlerAnalytics).not.toHaveBeenCalled();
  });
  it("falls back to 24h when the legacy route receives an invalid range", async () => {
    vi.mocked(service.parseCrawlerRange).mockImplementation(() => { throw new Error("bad"); });
    await CrawlerDashboardPage({ searchParams: Promise.resolve({ range: "bad" }) });
    expect(redirect).toHaveBeenCalledWith("/admin/crawlers/human?site=personal&range=24h");
  });
  it("preserves Open GEO selection in the legacy redirect", async () => {
    await CrawlerDashboardPage({ searchParams: Promise.resolve({ site: "open_geo", range: "30d" }) });
    expect(redirect).toHaveBeenCalledWith("/admin/crawlers/human?site=open_geo&range=30d");
  });
  it("uses noindex metadata", () => expect(metadata.robots).toEqual({ index: false, follow: false }));
});
