// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrawlerDashboard, formatShare } from "@/components/admin/crawlers/CrawlerDashboard";
import type { CrawlerAnalyticsResponse } from "@/lib/crawler-analytics/types";

const fixture: CrawlerAnalyticsResponse = {
  meta: { range: "24h", start: "2026-08-05T12:00:00Z", end: "2026-08-06T12:00:00Z", generatedAt: "2026-08-06T12:00:00Z", source: "cloudflare-graphql", sampled: false, sampleInterval: 1 },
  summary: { totalRequests: 100, crawlerRequests: 12, identifiedAiCrawler: 4, openGeoSelfTest: 5, otherAutomation: 3 },
  trend: [{ bucket: "2026-08-06T10:00:00Z", identifiedAiCrawler: 2, openGeoSelfTest: 5, otherAutomation: 1 }],
  agents: [{ category: "identified_ai_crawler", name: "OpenAI", userAgent: "GPTBot/1.2", requests: 4 }],
  paths: [{ path: "/articles", identifiedAiCrawler: 4, openGeoSelfTest: 5, otherAutomation: 3, total: 12 }],
  statuses: [{ status: 200, requests: 12 }],
};

describe("CrawlerDashboard", () => {
  it("renders controls, summaries, and exact data rows", () => {
    const { container } = render(<CrawlerDashboard range="24h" data={fixture} />);
    expect(screen.getByRole("heading", { name: "AI 爬虫检测" })).toBeInTheDocument();
    ["24h", "7d", "30d"].forEach((range) => expect(screen.getByRole("link", { name: range })).toHaveAttribute("href", `?range=${range}`));
    ["12", "4", "5", "3", "GPTBot/1.2", "/articles", "200"].forEach((value) => expect(screen.getAllByText(value).length).toBeGreaterThan(0));
    ["占比：12%", "占比：33.3%", "占比：41.7%", "占比：25%"].forEach((value) => expect(screen.getByText(value)).toBeInTheDocument());
    expect(container.innerHTML).toContain("overflow-x-auto");
    expect(container.innerHTML).toContain("grid-cols-1");
  });

  it("formats shares deterministically, including a zero denominator", () => {
    expect(formatShare(1, 3)).toBe("33.3%");
    expect(formatShare(1, 0)).toBe("0%");
  });

  it("shows the sampling disclaimer and precise empty-state boundary", () => {
    const sampled = { ...fixture, meta: { ...fixture.meta, sampled: true, sampleInterval: 3 } };
    const empty = { ...fixture, meta: { ...fixture.meta, sampled: true, sampleInterval: 3 }, summary: { ...fixture.summary, crawlerRequests: 0, identifiedAiCrawler: 0, openGeoSelfTest: 0, otherAutomation: 0 }, trend: [], agents: [], paths: [], statuses: [] };
    const { rerender } = render(<CrawlerDashboard range="24h" data={sampled} />);
    expect(screen.getByText(/使用了采样/)).toBeInTheDocument();
    rerender(<CrawlerDashboard range="24h" data={empty} />);
    expect(screen.getByText(/不代表不存在未声明身份的爬虫/)).toBeInTheDocument();
    expect(screen.getByText("总请求基线：100")).toBeInTheDocument();
    expect(screen.getByText("查询窗口：2026-08-05T12:00:00Z 至 2026-08-06T12:00:00Z")).toBeInTheDocument();
    expect(screen.getByText("最后刷新：2026-08-06T12:00:00Z")).toBeInTheDocument();
    expect(screen.getByText(/使用了采样/)).toBeInTheDocument();
    expect(screen.getByText(/User-Agent/)).toBeInTheDocument();
  });

  it("shows the query window and last refresh in the non-empty footer", () => {
    render(<CrawlerDashboard range="24h" data={fixture} />);
    expect(screen.getByText("查询窗口：2026-08-05T12:00:00Z 至 2026-08-06T12:00:00Z")).toBeInTheDocument();
    expect(screen.getByText("最后刷新：2026-08-06T12:00:00Z")).toBeInTheDocument();
  });

  it.each(["configuration_missing", "cloudflare_auth_invalid", "cloudflare_permission_denied", "cloudflare_rate_limited", "cloudflare_unavailable", "unsupported_dataset", "result_truncated", "invalid_range"] as const)("renders typed error copy for %s", (errorCode) => {
    render(<CrawlerDashboard range="24h" errorCode={errorCode} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/.+/);
    expect(screen.queryByText("12")).not.toBeInTheDocument();
  });

  it("does not render credential, token, or IP fields", () => {
    const { container } = render(<CrawlerDashboard range="24h" data={fixture} />);
    expect(container.innerHTML).not.toMatch(/CRAWLER_DASHBOARD_PASSWORD|CLOUDFLARE_API_TOKEN|(?:\d{1,3}\.){3}\d{1,3}/);
  });
});
