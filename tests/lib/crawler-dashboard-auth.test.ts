import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  crawlerAuthChallenge,
  isCrawlerDashboardPath,
  verifyCrawlerDashboardRequest,
} from "@/lib/crawler-dashboard-auth";

const originalPassword = process.env.CRAWLER_DASHBOARD_PASSWORD;
const basic = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
const request = (path: string, authorization?: string) =>
  new NextRequest(`https://me.itheheda.online${path}`, {
    headers: authorization ? { authorization } : undefined,
  });

afterEach(() => {
  process.env.CRAWLER_DASHBOARD_PASSWORD = originalPassword;
});

describe("crawler dashboard auth", () => {
  it.each([
    "/admin/crawlers",
    "/admin/crawlers/",
    "/api/admin/crawlers",
    "/api/admin/crawlers/health",
  ])("matches only the crawler boundary: %s", (path) => {
    expect(isCrawlerDashboardPath(path)).toBe(true);
  });

  it.each(["/admin", "/admin/site", "/admin/crawlers-old", "/api/admin/save"])(
    "does not widen the old admin boundary: %s",
    (path) => expect(isCrawlerDashboardPath(path)).toBe(false)
  );

  it("accepts only fixed username admin and the configured password", () => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "long-random-secret";
    expect(
      verifyCrawlerDashboardRequest(
        request("/admin/crawlers", basic("admin", "long-random-secret"))
      )
    ).toBe(true);
    expect(
      verifyCrawlerDashboardRequest(
        request("/admin/crawlers", basic("owner", "long-random-secret"))
      )
    ).toBe(false);
    expect(
      verifyCrawlerDashboardRequest(request("/admin/crawlers", basic("admin", "wrong")))
    ).toBe(false);
  });

  it("fails closed for missing config and malformed headers", () => {
    delete process.env.CRAWLER_DASHBOARD_PASSWORD;
    expect(verifyCrawlerDashboardRequest(request("/admin/crawlers"))).toBe(false);
    expect(
      verifyCrawlerDashboardRequest(request("/admin/crawlers", "Bearer secret"))
    ).toBe(false);
  });

  it("returns a browser challenge without leaking secrets", async () => {
    const response = crawlerAuthChallenge("api");
    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe(
      'Basic realm="Crawler analytics", charset="UTF-8"'
    );
    expect(await response.text()).not.toContain("CRAWLER_DASHBOARD_PASSWORD");
  });
});
