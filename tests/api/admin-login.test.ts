// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

beforeEach(() => {
  vi.resetModules();
});

describe("POST /api/admin/login", () => {
  it("returns 200 and sets cookie when password matches", async () => {
    process.env.ADMIN_PASSWORD = "supersecret";
    process.env.ADMIN_TOKEN = "test-token-123";

    const { POST } = await import("@/app/api/admin/login/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "supersecret" }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);

    const cookieHeader = res.headers.get("set-cookie");
    expect(cookieHeader).toBeTruthy();
    expect(cookieHeader).toContain("admin_token=test-token-123");
    expect(cookieHeader).toContain("HttpOnly");
    expect(cookieHeader).toContain("Secure");
    expect(cookieHeader.toLowerCase()).toContain("samesite=strict");
    expect(cookieHeader).toContain("Max-Age=604800");
  });

  it("returns 401 when password is wrong", async () => {
    process.env.ADMIN_PASSWORD = "supersecret";
    process.env.ADMIN_TOKEN = "test-token-123";

    const { POST } = await import("@/app/api/admin/login/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "wrongpassword" }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe("密码错误");
  });

  it("returns 500 when ADMIN_PASSWORD env var is missing", async () => {
    delete process.env.ADMIN_PASSWORD;
    process.env.ADMIN_TOKEN = "test-token-123";

    const { POST } = await import("@/app/api/admin/login/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "anything" }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Admin password not configured");
  });

  it("returns 500 when ADMIN_TOKEN env var is missing even with correct password", async () => {
    process.env.ADMIN_PASSWORD = "supersecret";
    delete process.env.ADMIN_TOKEN;

    const { POST } = await import("@/app/api/admin/login/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "supersecret" }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Admin token not configured");
  });

  it("returns 400 when request body is invalid JSON", async () => {
    process.env.ADMIN_PASSWORD = "supersecret";
    process.env.ADMIN_TOKEN = "test-token-123";

    const { POST } = await import("@/app/api/admin/login/route");
    const req = new NextRequest(
      new Request("http://localhost/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json-at-all",
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Invalid request");
  });
});
