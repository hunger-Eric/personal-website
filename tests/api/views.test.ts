// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn().mockImplementation(() => {
    throw new Error("No CF context in test");
  }),
}));

vi.mock("@/lib/mdx/mdx", () => ({
  getArticleSlugs: vi.fn().mockResolvedValue(["test-article", "hello-world"]),
}));

import { getCloudflareContext } from "@opennextjs/cloudflare";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/views/[slug]", () => {
  it("returns views for valid slug", async () => {
    const { GET } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(new Request("http://localhost/api/views/test-article"));
    const params = Promise.resolve({ slug: "test-article" });
    const res = await GET(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.views).toBe("number");
  });

  it("returns 0 views for invalid slug (not in manifest)", async () => {
    const { GET } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(new Request("http://localhost/api/views/nonexistent"));
    const params = Promise.resolve({ slug: "nonexistent" });
    const res = await GET(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.views).toBe(0);
  });

  it("returns 0 views for slug with invalid characters", async () => {
    const { GET } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(new Request("http://localhost/api/views/../../../etc"));
    const params = Promise.resolve({ slug: "../../../etc" });
    const res = await GET(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.views).toBe(0);
  });

  it("returns 0 views for empty slug", async () => {
    const { GET } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(new Request("http://localhost/api/views/"));
    const params = Promise.resolve({ slug: "" });
    const res = await GET(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.views).toBe(0);
  });

  it("returns views from KV when KV is available", async () => {
    const mockKv = {
      get: vi.fn().mockResolvedValue("42"),
      put: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getCloudflareContext).mockReturnValueOnce({
      env: { ARTICLE_VIEWS: mockKv },
    });

    const { GET } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(new Request("http://localhost/api/views/test-article"));
    const params = Promise.resolve({ slug: "test-article" });
    const res = await GET(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.views).toBe(42);
    expect(mockKv.get).toHaveBeenCalledWith("views:test-article");
  });

  it("returns Cache-Control: no-store header", async () => {
    const { GET } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(new Request("http://localhost/api/views/test-article"));
    const params = Promise.resolve({ slug: "test-article" });
    const res = await GET(req, { params } as any);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});

describe("POST /api/views/[slug]", () => {
  it("returns views for valid slug", async () => {
    const { POST } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(new Request("http://localhost/api/views/test-article", { method: "POST" }));
    const params = Promise.resolve({ slug: "test-article" });
    const res = await POST(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.views).toBe("number");
  });

  it("increments views and writes to KV when KV is available", async () => {
    const mockKv = {
      get: vi.fn().mockImplementation((key: string) => {
        // Return null for rate-limit keys so throttle doesn't block
        if (key.startsWith("rl:")) return null;
        return null; // start with no views
      }),
      put: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getCloudflareContext).mockReturnValueOnce({
      env: { ARTICLE_VIEWS: mockKv },
    });

    const { POST } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(new Request("http://localhost/api/views/test-article", { method: "POST" }));
    const params = Promise.resolve({ slug: "test-article" });
    const res = await POST(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.views).toBe(1);
    expect(mockKv.put).toHaveBeenCalledWith("views:test-article", "1");
  });

  it("does not increment when cookie dedupe is present", async () => {
    const mockKv = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key.startsWith("rl:")) return null;
        return "10";
      }),
      put: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getCloudflareContext).mockReturnValueOnce({
      env: { ARTICLE_VIEWS: mockKv },
    });

    const { POST } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(
      new Request("http://localhost/api/views/test-article", {
        method: "POST",
        headers: { Cookie: "vw_test-article=1" },
      })
    );
    const params = Promise.resolve({ slug: "test-article" });
    const res = await POST(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    // Should NOT increment — cookie dedupe prevents it
    expect(body.views).toBe(10);
    // KV put should NOT be called (no increment happened)
    expect(mockKv.put).not.toHaveBeenCalledWith("views:test-article", "11");
  });

  it("blocks increment for bot User-Agent", async () => {
    const mockKv = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key.startsWith("rl:")) return null;
        return null;
      }),
      put: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getCloudflareContext).mockReturnValueOnce({
      env: { ARTICLE_VIEWS: mockKv },
    });

    const { POST } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(
      new Request("http://localhost/api/views/test-article", {
        method: "POST",
        headers: { "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" },
      })
    );
    const params = Promise.resolve({ slug: "test-article" });
    const res = await POST(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    // Bots are blocked — views stay at 0
    expect(body.views).toBe(0);
    expect(mockKv.put).not.toHaveBeenCalled();
  });

  it("blocks increment for curl User-Agent", async () => {
    const mockKv = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key.startsWith("rl:")) return null;
        return null;
      }),
      put: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getCloudflareContext).mockReturnValueOnce({
      env: { ARTICLE_VIEWS: mockKv },
    });

    const { POST } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(
      new Request("http://localhost/api/views/test-article", {
        method: "POST",
        headers: { "User-Agent": "curl/7.68.0" },
      })
    );
    const params = Promise.resolve({ slug: "test-article" });
    const res = await POST(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.views).toBe(0);
  });

  it("blocks increment for python-requests User-Agent", async () => {
    const mockKv = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key.startsWith("rl:")) return null;
        return null;
      }),
      put: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getCloudflareContext).mockReturnValueOnce({
      env: { ARTICLE_VIEWS: mockKv },
    });

    const { POST } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(
      new Request("http://localhost/api/views/test-article", {
        method: "POST",
        headers: { "User-Agent": "python-requests/2.28.0" },
      })
    );
    const params = Promise.resolve({ slug: "test-article" });
    const res = await POST(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.views).toBe(0);
  });

  it("blocks increment when DNT header is set", async () => {
    const mockKv = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key.startsWith("rl:")) return null;
        return "7";
      }),
      put: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getCloudflareContext).mockReturnValueOnce({
      env: { ARTICLE_VIEWS: mockKv },
    });

    const { POST } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(
      new Request("http://localhost/api/views/test-article", {
        method: "POST",
        headers: { DNT: "1" },
      })
    );
    const params = Promise.resolve({ slug: "test-article" });
    const res = await POST(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.views).toBe(7);
    expect(mockKv.put).not.toHaveBeenCalled();
  });

  it("blocks increment when Sec-GPC header is set", async () => {
    const mockKv = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key.startsWith("rl:")) return null;
        return "3";
      }),
      put: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getCloudflareContext).mockReturnValueOnce({
      env: { ARTICLE_VIEWS: mockKv },
    });

    const { POST } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(
      new Request("http://localhost/api/views/test-article", {
        method: "POST",
        headers: { "Sec-GPC": "1" },
      })
    );
    const params = Promise.resolve({ slug: "test-article" });
    const res = await POST(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.views).toBe(3);
    expect(mockKv.put).not.toHaveBeenCalled();
  });

  it("returns 0 views for invalid slug on POST", async () => {
    const { POST } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(new Request("http://localhost/api/views/../dangerous", { method: "POST" }));
    const params = Promise.resolve({ slug: "../dangerous" });
    const res = await POST(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.views).toBe(0);
  });

  it("sets dedupe cookie on response", async () => {
    const { POST } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(new Request("http://localhost/api/views/test-article", { method: "POST" }));
    const params = Promise.resolve({ slug: "test-article" });
    const res = await POST(req, { params } as any);
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("vw_test-article=1");
  });

  it("includes Cache-Control: no-store on POST response", async () => {
    const { POST } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(new Request("http://localhost/api/views/test-article", { method: "POST" }));
    const params = Promise.resolve({ slug: "test-article" });
    const res = await POST(req, { params } as any);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});
