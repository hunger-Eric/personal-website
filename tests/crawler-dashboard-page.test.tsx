// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CrawlerAnalyticsResponse } from "@/lib/crawler-analytics/types";

const service = vi.hoisted(() => ({
  getCrawlerAnalytics: vi.fn(),
  parseCrawlerRange: vi.fn((value: string | undefined) => value ?? "24h"),
}));
vi.mock("@/lib/crawler-analytics/service", () => service);

import CrawlerDashboardPage, { metadata } from "@/app/admin/(crawler-dashboard)/crawlers/page";

const response: CrawlerAnalyticsResponse = {
  meta: { range: "7d", start: "2026-08-01T00:00:00Z", end: "2026-08-06T00:00:00Z", generatedAt: "2026-08-06T00:00:00Z", source: "cloudflare-graphql", sampled: false, sampleInterval: 1 },
  summary: { totalRequests: 2, crawlerRequests: 1, identifiedAiCrawler: 1, openGeoSelfTest: 0, otherAutomation: 0 }, trend: [], agents: [], paths: [], statuses: [],
};

describe("CrawlerDashboardPage", () => {
  beforeEach(() => { vi.clearAllMocks(); service.parseCrawlerRange.mockImplementation((value) => value ?? "24h"); service.getCrawlerAnalytics.mockResolvedValue(response); });
  it("uses the default range and renders fetched server data", async () => {
    render(await CrawlerDashboardPage({ searchParams: Promise.resolve({}) }));
    expect(service.getCrawlerAnalytics).toHaveBeenCalledWith("24h");
  });
  it("uses the requested supported range", async () => {
    render(await CrawlerDashboardPage({ searchParams: Promise.resolve({ range: "7d" }) }));
    expect(service.getCrawlerAnalytics).toHaveBeenCalledWith("7d");
  });
  it("shows invalid range without calling service", async () => {
    service.parseCrawlerRange.mockImplementation(() => { throw new Error("invalid"); });
    render(await CrawlerDashboardPage({ searchParams: Promise.resolve({ range: "bad" }) }));
    expect(service.getCrawlerAnalytics).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
  it("rejects duplicate ranges without calling the analytics service", async () => {
    render(await CrawlerDashboardPage({ searchParams: Promise.resolve({ range: ["7d", "7d"] }) }));
    expect(service.getCrawlerAnalytics).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
  it("maps typed service failures to an error panel", async () => {
    const { CrawlerAnalyticsError } = await import("@/lib/crawler-analytics/types");
    service.getCrawlerAnalytics.mockRejectedValue(new CrawlerAnalyticsError("cloudflare_rate_limited", "nope"));
    render(await CrawlerDashboardPage({ searchParams: Promise.resolve({ range: "7d" }) }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
  it("sets noindex metadata", () => expect(metadata.robots).toEqual({ index: false, follow: false }));
});
