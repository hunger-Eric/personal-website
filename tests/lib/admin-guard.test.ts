// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  isAdminEnabled,
  verifyAdminToken,
  adminGuard,
} from "@/lib/admin-guard";

describe("isAdminEnabled", () => {
  const OLD_ENV = process.env.ENABLE_ADMIN;

  afterEach(() => {
    process.env.ENABLE_ADMIN = OLD_ENV;
  });

  it("returns true when ENABLE_ADMIN=true", () => {
    process.env.ENABLE_ADMIN = "true";
    expect(isAdminEnabled()).toBe(true);
  });

  it("returns false when ENABLE_ADMIN is not set", () => {
    delete process.env.ENABLE_ADMIN;
    expect(isAdminEnabled()).toBe(false);
  });

  it("returns false when ENABLE_ADMIN=false", () => {
    process.env.ENABLE_ADMIN = "false";
    expect(isAdminEnabled()).toBe(false);
  });

  it("returns false when ENABLE_ADMIN is empty string", () => {
    process.env.ENABLE_ADMIN = "";
    expect(isAdminEnabled()).toBe(false);
  });
});

describe("verifyAdminToken", () => {
  const OLD_TOKEN = process.env.ADMIN_TOKEN;

  afterEach(() => {
    process.env.ADMIN_TOKEN = OLD_TOKEN;
  });

  it("returns true when token matches", () => {
    process.env.ADMIN_TOKEN = "test-token-123";
    expect(verifyAdminToken("test-token-123")).toBe(true);
  });

  it("returns false when token does not match", () => {
    process.env.ADMIN_TOKEN = "test-token-123";
    expect(verifyAdminToken("wrong-token")).toBe(false);
  });

  it("returns false when token is null", () => {
    process.env.ADMIN_TOKEN = "test-token-123";
    expect(verifyAdminToken(null)).toBe(false);
  });

  it("returns false when ADMIN_TOKEN env var is not set", () => {
    delete process.env.ADMIN_TOKEN;
    expect(verifyAdminToken("anything")).toBe(false);
  });

  it("returns false when both token and env var are missing", () => {
    delete process.env.ADMIN_TOKEN;
    expect(verifyAdminToken(null)).toBe(false);
  });
});

describe("adminGuard", () => {
  const OLD_ENABLE = process.env.ENABLE_ADMIN;
  const OLD_TOKEN = process.env.ADMIN_TOKEN;

  afterEach(() => {
    process.env.ENABLE_ADMIN = OLD_ENABLE;
    process.env.ADMIN_TOKEN = OLD_TOKEN;
  });

  describe("without request (env-var-only check)", () => {
    it("returns null when admin is enabled", () => {
      process.env.ENABLE_ADMIN = "true";
      expect(adminGuard()).toBeNull();
    });

    it("returns 404 Response when admin is not enabled", () => {
      delete process.env.ENABLE_ADMIN;
      const result = adminGuard();
      expect(result).not.toBeNull();
      expect(result!.status).toBe(404);
    });

    it("returns JSON error body when admin is not enabled", async () => {
      delete process.env.ENABLE_ADMIN;
      const result = adminGuard()!;
      const body = await result.json();
      expect(body.error).toBe("Not Found");
    });
  });

  describe("with request (token auth check)", () => {
    // Minimal mock NextRequest with cookie support
    function mockRequest(tokenCookie?: string, queryToken?: string) {
      const url = queryToken
        ? `http://localhost/admin?token=${queryToken}`
        : "http://localhost/admin";
      return {
        nextUrl: new URL(url),
        headers: new Headers(),
        cookies: {
          get: (name: string) =>
            tokenCookie ? { value: tokenCookie } : undefined,
        },
      } as any;
    }

    it("returns null when request has valid token cookie", () => {
      process.env.ENABLE_ADMIN = "true";
      process.env.ADMIN_TOKEN = "my-secret-token";
      const req = mockRequest("my-secret-token");
      expect(adminGuard(req)).toBeNull();
    });

    it("returns null when request has valid token in query param", () => {
      process.env.ENABLE_ADMIN = "true";
      process.env.ADMIN_TOKEN = "my-secret-token";
      const req = mockRequest(undefined, "my-secret-token");
      expect(adminGuard(req)).toBeNull();
    });

    it("returns 404 when request has invalid token", () => {
      process.env.ENABLE_ADMIN = "true";
      process.env.ADMIN_TOKEN = "my-secret-token";
      const req = mockRequest("wrong-token");
      const result = adminGuard(req);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(404);
    });

    it("returns 404 when request has no token at all", () => {
      process.env.ENABLE_ADMIN = "true";
      process.env.ADMIN_TOKEN = "my-secret-token";
      const req = mockRequest();
      const result = adminGuard(req);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(404);
    });

    it("returns 404 when admin disabled even with valid token", () => {
      delete process.env.ENABLE_ADMIN;
      process.env.ADMIN_TOKEN = "my-secret-token";
      const req = mockRequest("my-secret-token");
      const result = adminGuard(req);
      expect(result).not.toBeNull();
      expect(result!.status).toBe(404);
    });
  });
});
