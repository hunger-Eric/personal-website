import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { CrawlerAnalyticsResponse } from "@/lib/crawler-analytics/types";

vi.mock("@/lib/crawler-analytics/service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/crawler-analytics/service")>();
  return { ...actual, getCrawlerAnalytics: vi.fn() };
});

import {
  DELETE,
  GET,
  OPTIONS,
  PATCH,
  POST,
  PUT,
} from "@/app/api/admin/crawlers/route";
import { getCrawlerAnalytics } from "@/lib/crawler-analytics/service";
import { CrawlerAnalyticsError } from "@/lib/crawler-analytics/types";

const originalPassword = process.env.CRAWLER_DASHBOARD_PASSWORD;
const fixtureResponse: CrawlerAnalyticsResponse = {
  meta: {
    range: "7d",
    start: "2026-08-01T00:00:00.000Z",
    end: "2026-08-08T00:00:00.000Z",
    generatedAt: "2026-08-08T00:00:00.000Z",
    source: "cloudflare-graphql",
    sampled: false,
    sampleInterval: 1,
  },
  summary: {
    totalRequests: 3,
    crawlerRequests: 2,
    identifiedAiCrawler: 1,
    openGeoSelfTest: 1,
    otherAutomation: 0,
  },
  trend: [],
  agents: [],
  paths: [],
  statuses: [],
};

function authenticatedRequest(query = ""): NextRequest {
  const authorization = `Basic ${Buffer.from("admin:secret").toString("base64")}`;
  return new NextRequest(`https://me.itheheda.online/api/admin/crawlers${query}`, {
    headers: { authorization },
  });
}

afterEach(() => {
  process.env.CRAWLER_DASHBOARD_PASSWORD = originalPassword;
  vi.clearAllMocks();
});

describe("GET /api/admin/crawlers", () => {
  it("returns 401 with a Basic challenge before touching Cloudflare", async () => {
    delete process.env.CRAWLER_DASHBOARD_PASSWORD;

    const response = await GET(
      new NextRequest("https://me.itheheda.online/api/admin/crawlers")
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("Basic");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(getCrawlerAnalytics).not.toHaveBeenCalled();
  });

  it("returns private no-store analytics for a valid request", async () => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "secret";
    vi.mocked(getCrawlerAnalytics).mockResolvedValue(fixtureResponse);

    const response = await GET(authenticatedRequest("?range=7d"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(getCrawlerAnalytics).toHaveBeenCalledWith("7d");
    await expect(response.json()).resolves.toEqual(fixtureResponse);
  });

  it("defaults an omitted range to 24h", async () => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "secret";
    vi.mocked(getCrawlerAnalytics).mockResolvedValue(fixtureResponse);

    const response = await GET(authenticatedRequest());

    expect(response.status).toBe(200);
    expect(getCrawlerAnalytics).toHaveBeenCalledWith("24h");
  });

  it("rejects an exact-match invalid range without calling analytics", async () => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "secret";

    const response = await GET(authenticatedRequest("?range=7d%20"));

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({
      error: { code: "invalid_range", message: "Unsupported crawler analytics range" },
    });
    expect(getCrawlerAnalytics).not.toHaveBeenCalled();
  });

  it.each([
    "?range=7d&range=7d",
    "?range=7d&range=invalid",
  ])("rejects duplicate range values: %s", async (query) => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "secret";

    const response = await GET(authenticatedRequest(query));

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({
      error: { code: "invalid_range", message: "Unsupported crawler analytics range" },
    });
    expect(getCrawlerAnalytics).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid_range", 400, "Unsupported crawler analytics range"],
    ["configuration_missing", 503, "Crawler analytics is not configured"],
    ["cloudflare_auth_invalid", 502, "Crawler analytics is unavailable"],
    ["cloudflare_permission_denied", 502, "Crawler analytics is unavailable"],
    ["cloudflare_rate_limited", 503, "Crawler analytics is unavailable"],
    ["unsupported_dataset", 502, "Crawler analytics is unavailable"],
    ["result_truncated", 502, "Crawler analytics is unavailable"],
    ["cloudflare_unavailable", 502, "Crawler analytics is unavailable"],
  ] as const)("maps %s to HTTP %s with a stable safe payload", async (code, status, message) => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "secret";
    vi.mocked(getCrawlerAnalytics).mockRejectedValue(
      new CrawlerAnalyticsError(code, "upstream body includes token=secret", 599)
    );

    const response = await GET(authenticatedRequest("?range=7d"));

    expect(response.status).toBe(status);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({ error: { code, message } });
  });
});

describe("non-GET /api/admin/crawlers methods", () => {
  it("returns an authenticated private no-store OPTIONS response", async () => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "secret";

    const response = await OPTIONS(authenticatedRequest());

    expect(response.status).toBe(204);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("allow")).toBe("GET, HEAD, OPTIONS");
  });

  it("challenges unauthenticated OPTIONS before responding", async () => {
    delete process.env.CRAWLER_DASHBOARD_PASSWORD;

    const response = await OPTIONS(
      new NextRequest("https://me.itheheda.online/api/admin/crawlers", {
        method: "OPTIONS",
      })
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("Basic");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it.each([
    ["POST", POST],
    ["PUT", PUT],
    ["PATCH", PATCH],
    ["DELETE", DELETE],
  ])("returns authenticated 405 safe JSON for %s", async (method, handler) => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "secret";

    const response = await handler(authenticatedRequest());

    expect(response.status).toBe(405);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("allow")).toBe("GET, HEAD, OPTIONS");
    await expect(response.json()).resolves.toEqual({ error: { code: "method_not_allowed", message: "Method not allowed" } });
  });

  it.each([POST, PUT, PATCH, DELETE])("challenges unauthenticated unsupported methods", async (handler) => {
    delete process.env.CRAWLER_DASHBOARD_PASSWORD;

    const response = await handler(
      new NextRequest("https://me.itheheda.online/api/admin/crawlers", { method: "POST" })
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("Basic");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });
});
