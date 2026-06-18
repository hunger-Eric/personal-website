// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

process.env.ENABLE_ADMIN = "true";
process.env.ADMIN_TOKEN = "test-admin-token";

type RouteContext = {
  params: Promise<{ key: string }>;
};

beforeEach(() => {
  vi.resetModules();
});

function adminRequest(path: string) {
  return new NextRequest(new Request(`http://localhost${path}`, {
    headers: { Cookie: "admin_token=test-admin-token" },
  }));
}

describe("GET /api/admin/[key]", () => {
  it("returns 404 for unknown config key", async () => {
    const { GET } = await import("@/app/api/admin/[key]/route");
    const context: RouteContext = {
      params: Promise.resolve({ key: "unknown" }),
    };
    const res = await GET(adminRequest("/api/admin/unknown"), context);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Unknown config");
  });

  it("returns static config payload for a known config key", async () => {
    const { GET } = await import("@/app/api/admin/[key]/route");
    const context: RouteContext = {
      params: Promise.resolve({ key: "site" }),
    };
    const res = await GET(adminRequest("/api/admin/site"), context);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.config).toEqual(expect.objectContaining({}));
  });

  it("returns navbar config without relying on runtime require aliases", async () => {
    const { GET } = await import("@/app/api/admin/[key]/route");
    const context: RouteContext = {
      params: Promise.resolve({ key: "navbar" }),
    };
    const res = await GET(adminRequest("/api/admin/navbar"), context);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.config).toHaveProperty("logo");
  });
});
