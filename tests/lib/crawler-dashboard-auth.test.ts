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

  it("accepts only fixed username admin and the configured password", async () => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "long-random-secret";
    expect(
      await verifyCrawlerDashboardRequest(
        request("/admin/crawlers", basic("admin", "long-random-secret"))
      )
    ).toBe(true);
    expect(
      await verifyCrawlerDashboardRequest(
        request("/admin/crawlers", basic("owner", "long-random-secret"))
      )
    ).toBe(false);
    expect(
      await verifyCrawlerDashboardRequest(request("/admin/crawlers", basic("admin", "wrong")))
    ).toBe(false);
  });

  it("accepts UTF-8 passwords and rejects an incorrect UTF-8 password", async () => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "\u5bc6\u7801\ud83d\udd10";
    await expect(
      verifyCrawlerDashboardRequest(request("/admin/crawlers", basic("admin", "\u5bc6\u7801\ud83d\udd10")))
    ).resolves.toBe(true);
    await expect(
      verifyCrawlerDashboardRequest(request("/admin/crawlers", basic("admin", "\u5bc6\u7801\ud83d\udd11")))
    ).resolves.toBe(false);
  });

  it("preserves colons after the username separator as part of the password", async () => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "part:two:three";
    await expect(
      verifyCrawlerDashboardRequest(request("/admin/crawlers", basic("admin", "part:two:three")))
    ).resolves.toBe(true);
  });

  it.each(["basic", "BASIC", "BaSiC"]) (
    "accepts a case-insensitive Basic scheme: %s",
    async (scheme) => {
      process.env.CRAWLER_DASHBOARD_PASSWORD = "configured";
      await expect(
        verifyCrawlerDashboardRequest(
          request("/admin/crawlers", `${scheme}   ${basic("admin", "configured").slice(6)}`)
        )
      ).resolves.toBe(true);
    }
  );

  it("fails closed for missing config and malformed headers", async () => {
    delete process.env.CRAWLER_DASHBOARD_PASSWORD;
    await expect(verifyCrawlerDashboardRequest(request("/admin/crawlers"))).resolves.toBe(false);
    await expect(
      verifyCrawlerDashboardRequest(request("/admin/crawlers", "Bearer secret"))
    ).resolves.toBe(false);
    process.env.CRAWLER_DASHBOARD_PASSWORD = "configured";
    await expect(
      verifyCrawlerDashboardRequest(request("/admin/crawlers", "Basic not-a-valid-base64"))
    ).resolves.toBe(false);
    await expect(
      verifyCrawlerDashboardRequest(request("/admin/crawlers", "Basic"))
    ).resolves.toBe(false);
    await expect(
      verifyCrawlerDashboardRequest(request("/admin/crawlers", `Basic\t${basic("admin", "configured").slice(6)}`))
    ).resolves.toBe(false);
  });

  it("has no Node-only crypto or Buffer dependency", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("../../lib/crawler-dashboard-auth.ts", import.meta.url), "utf8")
    );
    expect(source).not.toMatch(/node:crypto|\bBuffer\b/);
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
