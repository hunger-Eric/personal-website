// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

beforeEach(() => {
  vi.resetModules();
});

describe("GET /api/admin/deploy-status", () => {
  it("returns 400 when deployId parameter is missing", async () => {
    process.env.ENABLE_ADMIN = "true";
    process.env.ADMIN_TOKEN = "test-admin-token";
    process.env.VERCEL_TOKEN = "vercel-token-123";

    const { GET } = await import("@/app/api/admin/deploy-status/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/deploy-status", {
        headers: { Cookie: "admin_token=test-admin-token" },
      })
    );

    const res = await GET(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Missing deployId parameter");
  });

  it("returns 500 when VERCEL_TOKEN env var is missing", async () => {
    process.env.ENABLE_ADMIN = "true";
    process.env.ADMIN_TOKEN = "test-admin-token";
    delete process.env.VERCEL_TOKEN;

    const { GET } = await import("@/app/api/admin/deploy-status/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/deploy-status?deployId=dpl_abc123", {
        headers: { Cookie: "admin_token=test-admin-token" },
      })
    );

    const res = await GET(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Vercel token not configured");
  });

  it("returns deploy status on successful fetch (without teamId)", async () => {
    process.env.ENABLE_ADMIN = "true";
    process.env.ADMIN_TOKEN = "test-admin-token";
    process.env.VERCEL_TOKEN = "vercel-token-123";
    delete process.env.VERCEL_TEAM_ID;

    const mockDeployData = {
      state: "READY",
      readyAt: "2024-01-15T12:00:00Z",
    };

    vi.doMock("@/app/api/admin/deploy-status/route", () => {
      // We can't easily mock global fetch, so we mock the actual fetch call
      // Let's use a different approach: mock global fetch
      return {};
    });

    // Undo the doMock since we actually want the real module
    vi.doUnmock("@/app/api/admin/deploy-status/route");

    // Mock global fetch
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDeployData),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { GET } = await import("@/app/api/admin/deploy-status/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/deploy-status?deployId=dpl_abc123", {
        headers: { Cookie: "admin_token=test-admin-token" },
      })
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("READY");
    expect(body.readyAt).toBe("2024-01-15T12:00:00Z");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.vercel.com/v13/deployments/dpl_abc123",
      { headers: { Authorization: "Bearer vercel-token-123" } }
    );

    vi.unstubAllGlobals();
  });

  it("returns deploy status on successful fetch (with teamId)", async () => {
    process.env.ENABLE_ADMIN = "true";
    process.env.ADMIN_TOKEN = "test-admin-token";
    process.env.VERCEL_TOKEN = "vercel-token-123";
    process.env.VERCEL_TEAM_ID = "team_xyz";

    const mockDeployData = {
      readyState: "BUILDING",
      readyAt: null,
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDeployData),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { GET } = await import("@/app/api/admin/deploy-status/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/deploy-status?deployId=dpl_abc123", {
        headers: { Cookie: "admin_token=test-admin-token" },
      })
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("BUILDING");
    expect(body.readyAt).toBeNull();

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.vercel.com/v13/deployments/dpl_abc123?teamId=team_xyz",
      { headers: { Authorization: "Bearer vercel-token-123" } }
    );

    vi.unstubAllGlobals();
  });

  it("returns PENDING when fetch returns non-ok status", async () => {
    process.env.ENABLE_ADMIN = "true";
    process.env.ADMIN_TOKEN = "test-admin-token";
    process.env.VERCEL_TOKEN = "vercel-token-123";
    delete process.env.VERCEL_TEAM_ID;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    vi.stubGlobal("fetch", mockFetch);

    const { GET } = await import("@/app/api/admin/deploy-status/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/deploy-status?deployId=dpl_abc123", {
        headers: { Cookie: "admin_token=test-admin-token" },
      })
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("PENDING");

    vi.unstubAllGlobals();
  });

  it("returns UNKNOWN when fetch throws", async () => {
    process.env.ENABLE_ADMIN = "true";
    process.env.ADMIN_TOKEN = "test-admin-token";
    process.env.VERCEL_TOKEN = "vercel-token-123";
    delete process.env.VERCEL_TEAM_ID;

    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", mockFetch);

    const { GET } = await import("@/app/api/admin/deploy-status/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/deploy-status?deployId=dpl_abc123", {
        headers: { Cookie: "admin_token=test-admin-token" },
      })
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("UNKNOWN");

    vi.unstubAllGlobals();
  });
});
