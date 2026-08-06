// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrawlerDashboard } from "@/components/admin/crawlers/CrawlerDashboard";
import type { CrawlerAnalyticsResponse } from "@/lib/crawler-analytics/types";

const fixture: CrawlerAnalyticsResponse = {
  meta: { range: "24h", start: "2026-08-05T12:00:00.000Z", end: "2026-08-06T12:00:00.000Z", generatedAt: "2026-08-06T12:00:00.000Z", source: "cloudflare-worker-d1", bucket: "hour", retentionDays: 90, databaseInitializedAt: "2026-08-01T00:00:00.000Z", requestedWindowComplete: false, bestEffort: true, classifier: { aiCrawlerBots: "0.6.3", otherBots: "isbot@5.2.1" } },
  summary: { crawlerRequests: 12, identifiedAiCrawler: 4, openGeoSelfTest: 5, otherAutomation: 3 }, trend: [], bots: [{ id: "openai", name: "OpenAI", category: "identified_ai_crawler", requests: 4 }], paths: [], statuses: [],
};
describe("CrawlerDashboard", () => {
  it("restores all ranges and renders Worker bot data without User-Agents", () => {
    const { container } = render(<CrawlerDashboard range="24h" data={fixture} />);
    ["24h", "7d", "30d"].forEach((range) => expect(screen.getByRole("link", { name: range })).toHaveAttribute("href", `?range=${range}`));
    expect(screen.getAllByText("Cloudflare Worker + D1").length).toBeGreaterThan(0); expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(container.textContent).not.toContain("声明的 User-Agent"); expect(container.textContent).not.toContain("总请求基线");
    expect(container.textContent).not.toContain("占比：100%");
  });
  it("states incomplete history without claiming the whole window has no crawlers", () => {
    render(<CrawlerDashboard range="24h" data={{ ...fixture, summary: { crawlerRequests: 0, identifiedAiCrawler: 0, openGeoSelfTest: 0, otherAutomation: 0 } }} />);
    expect(screen.getByText(/记录器初始化前无历史/)).toBeInTheDocument(); expect(screen.getByText(/不代表不存在未声明身份的爬虫/)).toBeInTheDocument();
  });
  it.each(["configuration_missing", "observer_auth_invalid", "observer_unavailable", "invalid_range"] as const)("renders %s", (errorCode) => {
    render(<CrawlerDashboard range="24h" errorCode={errorCode} />); expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
