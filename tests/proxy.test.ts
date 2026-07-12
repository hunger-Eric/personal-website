import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

function request(path = "/", headers?: HeadersInit) {
  return new NextRequest(`http://localhost${path}`, { headers });
}

describe("proxy — homepage traffic", () => {
  it("keeps campaign and social visitors on the enterprise homepage", () => {
    for (const path of ["/?utm_source=instagram", "/?fbclid=abc", "/?ttclid=xyz", "/?igshid=abc"]) {
      expect(proxy(request(path)).headers.get("x-middleware-next")).toBe("1");
    }
    expect(proxy(request("/", { referer: "https://www.tiktok.com/some/path" })).headers.get("x-middleware-next")).toBe("1");
  });

  it("passes through normal homepage requests", () => {
    expect(proxy(request("/")).headers.get("x-middleware-next")).toBe("1");
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

  it("redirects unauthenticated /admin to login", () => {
    const res = proxy(request("/admin"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });
});
