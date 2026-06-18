import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

function request(path = "/", headers?: HeadersInit) {
  return new NextRequest(`http://localhost${path}`, { headers });
}

describe("proxy — homepage social redirect", () => {
  it("redirects ?utm_source=instagram to /links", () => {
    const res = proxy(request("/?utm_source=instagram"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/links");
  });

  it("redirects UTM aliases: ig, tt, link_in_bio", () => {
    for (const src of ["ig", "tt", "link_in_bio"]) {
      const res = proxy(request(`/?utm_source=${src}`));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost/links");
    }
  });

  it("matches utm_source case-insensitively and trims whitespace", () => {
    const res = proxy(request("/?utm_source=Instagram"));
    expect(res.status).toBe(307);

    const res2 = proxy(request("/?utm_source=%20tiktok%20"));
    expect(res2.status).toBe(307);
  });

  it("redirects fbclid param", () => {
    const res = proxy(request("/?fbclid=abc123"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/links");
  });

  it("redirects ttclid param", () => {
    const res = proxy(request("/?ttclid=xyz"));
    expect(res.status).toBe(307);
  });

  it("redirects igshid param", () => {
    const res = proxy(request("/?igshid=abc"));
    expect(res.status).toBe(307);
  });

  it("redirects empty click-ID params (presence is the contract)", () => {
    for (const param of ["fbclid", "ttclid", "igshid"]) {
      const res = proxy(request(`/?${param}=`));
      expect(res.status).toBe(307);
    }
  });

  it("redirects social referer", () => {
    const res = proxy(request("/", { referer: "https://www.tiktok.com/some/path" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/links");
  });

  it("redirects social referer subdomains", () => {
    const res = proxy(request("/", { referer: "https://m.facebook.com/profile" }));
    expect(res.status).toBe(307);
  });

  it("does not redirect invalid or lookalike referers", () => {
    const res = proxy(request("/", { referer: "https://notinstagram.com/page" }));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("does not redirect ?gclid=abc (Google ads fallthrough)", () => {
    const res = proxy(request("/?gclid=abc"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("passes through normal homepage requests", () => {
    const res = proxy(request("/"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("does not redirect social params on /links", () => {
    const res = proxy(request("/links?utm_source=instagram"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
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
