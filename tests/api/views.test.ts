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

  it("returns 0 views for invalid slug", async () => {
    const { GET } = await import("@/app/api/views/[slug]/route");
    const req = new NextRequest(new Request("http://localhost/api/views/nonexistent"));
    const params = Promise.resolve({ slug: "nonexistent" });
    const res = await GET(req, { params } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.views).toBe(0);
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
});
