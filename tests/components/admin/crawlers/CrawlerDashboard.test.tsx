// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CrawlerDashboard } from "@/components/admin/crawlers/CrawlerDashboard";
import type { CrawlerAnalyticsResponse } from "@/lib/crawler-analytics/types";

const fixture: CrawlerAnalyticsResponse = {
  meta: { range: "24h", start: "2026-08-05T12:00:00.000Z", end: "2026-08-06T12:00:00.000Z", generatedAt: "2026-08-06T12:00:00.000Z", source: "cloudflare-worker-d1", bucket: "hour", retentionDays: 90, databaseInitializedAt: "2026-08-01T00:00:00.000Z", requestedWindowComplete: false, bestEffort: true, classifier: { aiCrawlerBots: "0.6.3", otherBots: "isbot@5.2.1" } },
  summary: { crawlerRequests: 12, identifiedAiCrawler: 4, openGeoSelfTest: 5, otherAutomation: 3 }, trend: [], bots: [{ id: "openai", name: "OpenAI", category: "identified_ai_crawler", requests: 4 }], paths: [], statuses: [],
  identityPreview: { mode: "shadow", shadowStartedAt: "2026-08-06T00:00:00.000Z", summary: { requests: 4, verifiedOfficial: 1, declaredUnverified: 1, suspectedSpoof: 1, otherAutomation: 1 }, bots: [{ id: "gptbot", name: "GPTBot", providerId: "openai", providerName: "OpenAI", verificationStatus: "verified_official", verificationMethod: "official_ip_range", requests: 1 }], rules: [
    { sourceId: "openai_gptbot", lastAttemptAt: "2026-08-06T00:00:00.000Z", lastSuccessAt: "2026-08-06T00:00:00.000Z", state: "fresh" },
    { sourceId: "openai_searchbot", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" }, { sourceId: "openai_chatgpt_user", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" }, { sourceId: "perplexity_bot", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" }, { sourceId: "perplexity_user", lastAttemptAt: null, lastSuccessAt: null, state: "unavailable" },
  ], chinaUaCoverage: [
    { id: "deepseekbot", name: "DeepSeekBot", providerName: "DeepSeek", purpose: "unknown", uaToken: "DeepSeekBot", verificationStatus: "declared_unverified", verificationMethod: "ua_only" },
    { id: "bytespider", name: "Bytespider", providerName: "ByteDance", purpose: "ai_training", uaToken: "Bytespider", verificationStatus: "declared_unverified", verificationMethod: "ua_only" },
  ] },
};
describe("CrawlerDashboard", () => {
  it("shows privacy-preserving human browser page views separately from automation", () => {
    const data = {
      ...fixture,
      human: {
        trackingStartedAt: "2026-08-06T00:00:00.000Z",
        requestedWindowComplete: false,
        pageViews: 9,
        trend: [{ bucket: "2026-08-06T11:00:00.000Z", pageViews: 9 }],
        paths: [{ path: "/articles", pageViews: 6 }, { path: "/", pageViews: 3 }],
        statuses: [{ status: 200, pageViews: 9 }],
        devices: [{ id: "desktop", pageViews: 5 }, { id: "mobile", pageViews: 4 }],
        browsers: [{ id: "chrome", pageViews: 5 }, { id: "safari", pageViews: 4 }],
        operatingSystems: [{ id: "windows", pageViews: 5 }, { id: "ios", pageViews: 4 }],
        countries: [{ countryCode: "CN", pageViews: 6 }, { countryCode: "US", pageViews: 3 }],
        regions: [{ countryCode: "CN", regionCode: "GD", regionName: "Guangdong", pageViews: 6 }, { countryCode: "US", regionCode: "CA", regionName: "California", pageViews: 3 }],
      },
    } as CrawlerAnalyticsResponse;
    const Dashboard = CrawlerDashboard as unknown as (props: Parameters<typeof CrawlerDashboard>[0] & { view: "human" | "machines" }) => React.ReactNode;
    const { container } = render(<Dashboard view="human" range="24h" data={data} />);
    const human = within(container.querySelector("[aria-labelledby='human-traffic-title']") as HTMLElement);
    expect(human.getByRole("heading", { name: "人类浏览器访问" })).toBeInTheDocument();
    expect(human.getAllByText("页面访问")[0].nextSibling).toHaveTextContent("9");
    expect(screen.getByRole("table", { name: "人类访问热门页面" })).toHaveTextContent("/articles");
    expect(screen.getByText(/不是独立访客数/)).toBeInTheDocument();
    expect(screen.getByText(/人类访问统计从 2026-08-06T00:00:00.000Z 开始/)).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "访问设备" })).toHaveTextContent("桌面设备");
    expect(screen.getByRole("table", { name: "访问浏览器" })).toHaveTextContent("Chrome");
    expect(screen.getByRole("table", { name: "操作系统" })).toHaveTextContent("Windows");
    expect(screen.getByRole("table", { name: "国家/地区" })).toHaveTextContent("中国");
    expect(screen.getByRole("table", { name: "省/州" })).toHaveTextContent("Guangdong");
    expect(screen.queryByRole("heading", { name: "自动化请求趋势" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "机器访问" })).toHaveAttribute("href", "/admin/crawlers/machines?range=24h");
  });
  it("keeps crawler evidence on the machine page and preserves the selected range in page navigation", () => {
    const Dashboard = CrawlerDashboard as unknown as (props: Parameters<typeof CrawlerDashboard>[0] & { view: "human" | "machines" }) => React.ReactNode;
    render(<Dashboard view="machines" range="7d" data={fixture} />);
    expect(screen.getByRole("heading", { name: "机器访问" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "自动化请求趋势" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "人类浏览器访问" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "人类访问" })).toHaveAttribute("href", "/admin/crawlers/human?range=7d");
    expect(screen.getByRole("link", { name: "7d" })).toHaveAttribute("href", "/admin/crawlers/machines?range=7d");
  });
  it("restores all ranges and renders Worker bot data without User-Agents", () => {
    const { container } = render(<CrawlerDashboard range="24h" data={fixture} />);
    ["24h", "7d", "30d"].forEach((range) => expect(screen.getByRole("link", { name: range })).toHaveAttribute("href", `/admin/crawlers/machines?range=${range}`));
    expect(screen.getAllByText("Cloudflare Worker + D1").length).toBeGreaterThan(0); expect(screen.getAllByText("OpenAI").length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain("Mozilla/5.0"); expect(container.textContent).not.toContain("总请求基线");
    expect(container.textContent).not.toContain("占比：100%");
  });
  it("renders the V2 identity preview without exposing verification inputs", () => {
    const { container } = render(<CrawlerDashboard range="24h" data={fixture} />);
    const dashboard = within(container);
    expect(dashboard.getByText("V2 身份验证预览")).toBeInTheDocument();
    expect(dashboard.getAllByText("官方可信").length).toBeGreaterThan(0);
    expect(dashboard.getAllByText("仅声明身份").length).toBeGreaterThan(0);
    expect(dashboard.getAllByText("疑似伪装").length).toBeGreaterThan(0);
    expect(dashboard.getAllByText("其他自动化").length).toBeGreaterThan(0);
    expect(dashboard.getByText("官方 IP 范围")).toBeInTheDocument();
    expect(dashboard.getByText(/影子模式不会改变当前正式统计/)).toBeInTheDocument();
    expect(dashboard.getByText(/2026-08-06T00:00:00.000Z/)).toBeInTheDocument();
    const chinaCoverage = dashboard.getByRole("table", { name: "中国爬虫规则覆盖" });
    expect(chinaCoverage).toHaveTextContent("DeepSeekBot");
    expect(chinaCoverage).toHaveTextContent("Bytespider");
    expect(chinaCoverage).toHaveTextContent("仅声明身份");
    expect(dashboard.getByText(/DeepSeek 当前没有公开官方爬虫身份或强验证资料/)).toBeInTheDocument();
    ["203.0.113.8", "203.0.113.0/24", "CF-Connecting-IP", "Mozilla/5.0"].forEach((value) => expect(container.textContent).not.toContain(value));
  });
  it("keeps the V1 dashboard visible without rendering the V2 identity preview", () => {
    const v1 = { ...fixture };
    delete v1.identityPreview;
    render(<CrawlerDashboard range="24h" data={v1} />);
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.queryByText("V2 身份验证预览")).not.toBeInTheDocument();
  });
  it("states incomplete history without claiming the whole window has no crawlers", () => {
    render(<CrawlerDashboard range="24h" data={{ ...fixture, summary: { crawlerRequests: 0, identifiedAiCrawler: 0, openGeoSelfTest: 0, otherAutomation: 0 } }} />);
    expect(screen.getByText(/记录器初始化前无历史/)).toBeInTheDocument(); expect(screen.getByText(/不代表不存在未声明身份的爬虫/)).toBeInTheDocument();
    expect(screen.getByText("V2 身份验证预览")).toBeInTheDocument();
  });
  it.each(["configuration_missing", "observer_auth_invalid", "observer_unavailable", "invalid_range"] as const)("renders %s", (errorCode) => {
    render(<CrawlerDashboard range="24h" errorCode={errorCode} />); expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
