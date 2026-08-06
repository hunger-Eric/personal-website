import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

function request(path = "/", headers?: HeadersInit) {
  return new NextRequest(`http://localhost${path}`, { headers });
}

describe("proxy — homepage traffic", () => {
  it("keeps campaign and social visitors on the enterprise homepage", async () => {
    for (const path of ["/?utm_source=instagram", "/?fbclid=abc", "/?ttclid=xyz", "/?igshid=abc"]) {
      expect((await proxy(request(path))).headers.get("x-middleware-next")).toBe("1");
    }
    expect((await proxy(request("/", { referer: "https://www.tiktok.com/some/path" }))).headers.get("x-middleware-next")).toBe("1");
  });

  it("passes through normal homepage requests", async () => {
    expect((await proxy(request("/"))).headers.get("x-middleware-next")).toBe("1");
  });
});

describe("proxy - production crawler dashboard boundary", () => {
  const oldPassword = process.env.CRAWLER_DASHBOARD_PASSWORD;

  beforeEach(() => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = "crawler-secret";
  });

  afterEach(() => {
    process.env.CRAWLER_DASHBOARD_PASSWORD = oldPassword;
  });

  it("challenges an unauthenticated crawler page", async () => {
    const response = await proxy(request("/admin/crawlers"));
    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("Basic");
  });

  it("returns a Basic Auth JSON challenge for an unauthenticated crawler API request", async () => {
    const response = await proxy(request("/api/admin/crawlers"));
    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("Basic");
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("passes an authenticated crawler page without enabling the old admin", async () => {
    const authorization = `Basic ${Buffer.from("admin:crawler-secret").toString("base64")}`;
    expect(
      (await proxy(request("/admin/crawlers", { authorization }))).headers.get("x-middleware-next")
    ).toBe("1");
    delete process.env.ENABLE_ADMIN;
    expect((await proxy(request("/admin/site", { authorization }))).status).toBe(404);
  });

  it("passes an authenticated crawler API request", async () => {
    const authorization = `Basic ${Buffer.from("admin:crawler-secret").toString("base64")}`;
    expect(
      (await proxy(request("/api/admin/crawlers", { authorization }))).headers.get("x-middleware-next")
    ).toBe("1");
  });

  it("keeps crawler API near-matches under the legacy 404 boundary", async () => {
    delete process.env.ENABLE_ADMIN;
    const authorization = `Basic ${Buffer.from("admin:crawler-secret").toString("base64")}`;
    expect((await proxy(request("/api/admin/crawlers-old", { authorization }))).status).toBe(404);
  });
});

describe("proxy — admin auth still works", () => {
  const OLD_ENABLE = process.env.ENABLE_ADMIN;
  const OLD_TOKEN = process.env.ADMIN_TOKEN;

  beforeEach(() => {
    process.env.ENABLE_ADMIN = "true";
    process.env.ADMIN_TOKEN = "test-token";
  });

  afterEach(() => {
    process.env.ENABLE_ADMIN = OLD_ENABLE;
    process.env.ADMIN_TOKEN = OLD_TOKEN;
  });

  it("redirects unauthenticated /admin to login", async () => {
    const res = await proxy(request("/admin"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });
});
