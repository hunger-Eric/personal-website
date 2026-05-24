// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

beforeEach(() => {
  vi.resetModules();
});

describe("GET /api/admin/[key] - unauthorized", () => {
  it("returns 401 when no admin cookie is present", async () => {
    // Temporarily unset ADMIN_TOKEN so adminGuard fails
    const orig = process.env.ADMIN_TOKEN;
    const origEnable = process.env.ENABLE_ADMIN;
    delete process.env.ADMIN_TOKEN;
    delete process.env.ENABLE_ADMIN;
    try {
      const { GET } = await import("@/app/api/admin/[key]/route");
      const req = new NextRequest(new Request("http://localhost/api/admin/site", {}));
      const params = Promise.resolve({ key: "site" });
      const res = await GET(req, { params } as any);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBeDefined();
    } finally {
      process.env.ADMIN_TOKEN = orig;
      process.env.ENABLE_ADMIN = origEnable;
    }
  });
});
