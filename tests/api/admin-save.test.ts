// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

process.env.ENABLE_ADMIN = "true";
process.env.ADMIN_TOKEN = "test-admin-token";

// Mock github-photo
vi.mock("@/lib/github-photo", () => ({
  getRepoFile: vi.fn(),
  upsertRepoFile: vi.fn(),
}));

import { getRepoFile, upsertRepoFile } from "@/lib/github-photo";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/admin/save", () => {
  it("saves config with valid key: site", async () => {
    vi.mocked(getRepoFile).mockResolvedValueOnce({ sha: "abc123", path: "config/site.json" });
    vi.mocked(upsertRepoFile).mockResolvedValueOnce(undefined);

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({
          key: "site",
          content: { title: "My Site" },
          message: "feat: update site config",
        }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("site 配置已保存");

    expect(getRepoFile).toHaveBeenCalledWith("config/site.json");
    expect(upsertRepoFile).toHaveBeenCalledWith(
      "config/site.json",
      expect.any(String),
      "feat: update site config",
      "utf-8",
      "abc123"
    );
  });

  it("saves config without existing sha (new file)", async () => {
    vi.mocked(getRepoFile).mockResolvedValueOnce(null);
    vi.mocked(upsertRepoFile).mockResolvedValueOnce(undefined);

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({
          key: "navbar",
          content: { items: [] },
        }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(upsertRepoFile).toHaveBeenCalledWith(
      "config/navbar.json",
      expect.any(String),
      expect.stringContaining("navbar"),
      "utf-8",
      undefined
    );
  });

  it("uses default commit message when not provided", async () => {
    vi.mocked(getRepoFile).mockResolvedValueOnce(null);
    vi.mocked(upsertRepoFile).mockResolvedValueOnce(undefined);

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({
          key: "about",
          content: { bio: "hi" },
        }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(upsertRepoFile).toHaveBeenCalledWith(
      "config/about.json",
      expect.any(String),
      "feat: update about config via admin panel",
      "utf-8",
      undefined
    );
  });

  it("saves config for key: theme", async () => {
    vi.mocked(getRepoFile).mockResolvedValueOnce({ sha: "def456", path: "config/theme.json" });
    vi.mocked(upsertRepoFile).mockResolvedValueOnce(undefined);

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({
          key: "theme",
          content: { primary: "#000" },
        }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(getRepoFile).toHaveBeenCalledWith("config/theme.json");
  });

  it("saves config for key: photography", async () => {
    vi.mocked(getRepoFile).mockResolvedValueOnce({ sha: "ghi789", path: "config/photography.json" });
    vi.mocked(upsertRepoFile).mockResolvedValueOnce(undefined);

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({
          key: "photography",
          content: { projects: [] },
        }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("saves config for key: pages", async () => {
    vi.mocked(getRepoFile).mockResolvedValueOnce({ sha: "jkl012", path: "config/pages.json" });
    vi.mocked(upsertRepoFile).mockResolvedValueOnce(undefined);

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({
          key: "pages",
          content: { pages: [] },
        }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("returns 400 when key is missing", async () => {
    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({ content: { foo: "bar" } }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing key or content");
  });

  it("returns 400 when content is missing", async () => {
    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({ key: "site" }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing key or content");
  });

  it("returns 400 when key and content are both missing", async () => {
    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({}),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown config key", async () => {
    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({ key: "invalidKey", content: { foo: "bar" } }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Unknown config key: invalidKey");
  });

  it("returns 500 when getRepoFile throws", async () => {
    vi.mocked(getRepoFile).mockRejectedValueOnce(new Error("API rate limited"));

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({ key: "site", content: { title: "Test" } }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("API rate limited");

    consoleErrorSpy.mockRestore();
  });

  it("returns 500 when upsertRepoFile throws", async () => {
    vi.mocked(getRepoFile).mockResolvedValueOnce(null);
    vi.mocked(upsertRepoFile).mockRejectedValueOnce(new Error("Push conflict"));

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({ key: "site", content: { title: "Test" } }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Push conflict");

    consoleErrorSpy.mockRestore();
  });

  it("returns 500 with fallback error message", async () => {
    vi.mocked(getRepoFile).mockRejectedValueOnce({});

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({ key: "site", content: { title: "Test" } }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("保存失败");

    consoleErrorSpy.mockRestore();
  });
});

describe("deploy trigger", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.VERCEL_TOKEN;
    delete process.env.VERCEL_TEAM_ID;
    vi.clearAllMocks();
  });

  afterAll(() => {
    process.env.VERCEL_TOKEN = originalEnv.VERCEL_TOKEN;
    process.env.VERCEL_TEAM_ID = originalEnv.VERCEL_TEAM_ID;
  });

  it("triggers Vercel deploy with teamId when VERCEL_TOKEN is set", async () => {
    process.env.VERCEL_TOKEN = "test-vercel-token";
    process.env.VERCEL_TEAM_ID = "team_abc123";

    vi.mocked(getRepoFile).mockResolvedValueOnce({ sha: "abc123", path: "config/site.json" });
    vi.mocked(upsertRepoFile).mockResolvedValueOnce(undefined);

    const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "dpl_deploy123" }), { status: 200 })
    );

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({ key: "site", content: { title: "My Site" } }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.deployId).toBe("dpl_deploy123");

    // Verify fetch URL includes teamId
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.vercel.com/v13/deployments?teamId=team_abc123",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-vercel-token",
        }),
      })
    );

    mockFetch.mockRestore();
  });

  it("triggers Vercel deploy without teamId when VERCEL_TEAM_ID is not set", async () => {
    process.env.VERCEL_TOKEN = "test-vercel-token";
    // VERCEL_TEAM_ID intentionally not set

    vi.mocked(getRepoFile).mockResolvedValueOnce({ sha: "abc123", path: "config/site.json" });
    vi.mocked(upsertRepoFile).mockResolvedValueOnce(undefined);

    const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ uid: "dpl_deploy456" }), { status: 200 })
    );

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({ key: "site", content: { title: "My Site" } }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.deployId).toBe("dpl_deploy456");

    // Verify fetch URL does NOT include teamId
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.vercel.com/v13/deployments",
      expect.any(Object)
    );

    mockFetch.mockRestore();
  });

  it("handles deploy fetch failure gracefully (non-fatal)", async () => {
    process.env.VERCEL_TOKEN = "test-vercel-token";

    vi.mocked(getRepoFile).mockResolvedValueOnce({ sha: "abc123", path: "config/site.json" });
    vi.mocked(upsertRepoFile).mockResolvedValueOnce(undefined);

    const mockFetch = vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network timeout"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({ key: "site", content: { title: "My Site" } }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    // deployId should be null when fetch fails
    expect(body.deployId).toBeNull();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Vercel deploy trigger failed (non-fatal):",
      expect.any(Error)
    );

    mockFetch.mockRestore();
    consoleSpy.mockRestore();
  });

  it("skips deploy trigger when VERCEL_TOKEN is not set", async () => {
    // VERCEL_TOKEN not set

    vi.mocked(getRepoFile).mockResolvedValueOnce({ sha: "abc123", path: "config/site.json" });
    vi.mocked(upsertRepoFile).mockResolvedValueOnce(undefined);

    const mockFetch = vi.spyOn(globalThis, "fetch");

    const { POST } = await import("@/app/api/admin/save/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: "admin_token=test-admin-token" },
        body: JSON.stringify({ key: "site", content: { title: "My Site" } }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.deployId).toBeNull();

    // fetch should NOT have been called
    expect(mockFetch).not.toHaveBeenCalled();

    mockFetch.mockRestore();
  });
});
