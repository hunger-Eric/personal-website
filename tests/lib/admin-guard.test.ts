// @vitest-environment node
import { describe, it, expect } from "vitest";
import { isAdminEnabled, adminGuard } from "@/lib/admin-guard";

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

describe("adminGuard", () => {
  const OLD_ENV = process.env.ENABLE_ADMIN;

  afterEach(() => {
    process.env.ENABLE_ADMIN = OLD_ENV;
  });

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
