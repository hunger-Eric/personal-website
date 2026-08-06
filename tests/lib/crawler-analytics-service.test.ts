import { describe, expect, it, vi } from "vitest";
import { getCrawlerAnalytics, parseCrawlerRange } from "@/lib/crawler-analytics/service";

const env = { token: "token", zoneId: "zone", hostname: "me.itheheda.online" };
const now = new Date("2026-08-06T12:00:00.000Z");
const emptyWindow = { total: [{ count: 0 }], byAgent: [], byTrend: [], byPath: [], byStatus: [] };

describe("crawler analytics service", () => {
  it("defaults missing ranges and rejects unsupported ranges", () => {
    expect(parseCrawlerRange(undefined)).toBe("24h");
    expect(() => parseCrawlerRange("all")).toThrow(expect.objectContaining({ code: "invalid_range" }));
  });

  it("requires complete private configuration", async () => {
    await expect(getCrawlerAnalytics("24h", { now, env: { token: "", zoneId: "zone", hostname: "host" }, bypassCache: true })).rejects.toMatchObject({ code: "configuration_missing" });
  });

  it("aggregates visible categories while retaining total request baseline", async () => {
    const queryWindow = vi.fn().mockResolvedValue({
      total: [{ count: 100, avg: { sampleInterval: 1 } }],
      byAgent: [
        { count: 10, dimensions: { userAgent: "GPTBot/1.2" } },
        { count: 20, dimensions: { userAgent: "OpenGeoConsoleBot/1.0" } },
        { count: 5, dimensions: { userAgent: "curl/8.7.1" } },
        { count: 99, dimensions: { userAgent: "Safari" } },
      ],
      byTrend: [], byPath: [], byStatus: [],
    });
    const result = await getCrawlerAnalytics("24h", { now, env, queryWindow, bypassCache: true });
    expect(result.summary).toEqual({ totalRequests: 100, crawlerRequests: 35, identifiedAiCrawler: 10, openGeoSelfTest: 20, otherAutomation: 5 });
    expect(result.agents.map((agent) => agent.userAgent)).not.toContain("Safari");
  });

  it("splits 30 days into 30 ascending windows no longer than one day", async () => {
    const queryWindow = vi.fn().mockResolvedValue(emptyWindow);
    await getCrawlerAnalytics("30d", { now, env, queryWindow, bypassCache: true });
    expect(queryWindow).toHaveBeenCalledTimes(30);
    const windows = queryWindow.mock.calls.map(([value]) => [Date.parse(value.start), Date.parse(value.end)]);
    expect(windows.every(([start, end]) => end - start <= 24 * 60 * 60 * 1000)).toBe(true);
    expect(windows.slice(1).every(([start], index) => start === windows[index][1])).toBe(true);
  });

  it("aggregates and orders trend, paths, statuses, and agent rows", async () => {
    const queryWindow = vi.fn().mockResolvedValue({
      total: [{ count: 9 }],
      byAgent: [
        { count: 2, dimensions: { userAgent: "curl/8" } },
        { count: 7, dimensions: { userAgent: "GPTBot" } },
      ],
      byTrend: [
        { count: 2, dimensions: { datetimeHour: "2026-08-06T11:00:00Z", userAgent: "curl/8" } },
        { count: 3, dimensions: { datetimeHour: "2026-08-06T10:00:00Z", userAgent: "GPTBot" } },
      ],
      byPath: [
        { count: 2, dimensions: { clientRequestPath: "/z", userAgent: "curl/8" } },
        { count: 3, dimensions: { clientRequestPath: "/a", userAgent: "GPTBot" } },
      ],
      byStatus: [
        { count: 2, dimensions: { edgeResponseStatus: 404, userAgent: "curl/8" } },
        { count: 3, dimensions: { edgeResponseStatus: 200, userAgent: "GPTBot" } },
        { count: 9, dimensions: { edgeResponseStatus: 500, userAgent: "Safari" } },
      ],
    });
    const result = await getCrawlerAnalytics("24h", { now, env, queryWindow, bypassCache: true });
    expect(result.agents.map((row) => row.requests)).toEqual([7, 2]);
    expect(result.trend.map((row) => row.bucket)).toEqual(["2026-08-06T10:00:00Z", "2026-08-06T11:00:00Z"]);
    expect(result.paths.map((row) => [row.path, row.total])).toEqual([["/a", 3], ["/z", 2]]);
    expect(result.statuses).toEqual([{ status: 200, requests: 3 }, { status: 404, requests: 2 }]);
  });

  it("marks the response sampled using the maximum observed interval", async () => {
    const queryWindow = vi.fn().mockResolvedValue({ ...emptyWindow, total: [{ count: 10, avg: { sampleInterval: 3 } }] });
    const result = await getCrawlerAnalytics("24h", { now, env, queryWindow, bypassCache: true });
    expect(result.meta).toMatchObject({ sampled: true, sampleInterval: 3 });
  });

  it("caches only successful final responses for five minutes", async () => {
    const queryWindow = vi.fn().mockResolvedValue(emptyWindow);
    await getCrawlerAnalytics("7d", { now, env, queryWindow });
    await getCrawlerAnalytics("7d", { now: new Date(now.getTime() + 4 * 60 * 1000), env, queryWindow });
    expect(queryWindow).toHaveBeenCalledTimes(7);
  });
});
