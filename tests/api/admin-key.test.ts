// @vitest-environment node
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

describe("GET /api/admin/[key]", () => {
  it("returns 404 for unknown config", async () => {
    // Test with module-level import to check the std err path
    const { GET } = await import("@/app/api/admin/[key]/route");
    const req = new NextRequest(new Request("http://localhost/api/admin/unknown"));
    const params = Promise.resolve({ key: "unknown" });
    const res = await GET(req, { params } as any);
    expect(res.status).toBe(404);
  });
})
