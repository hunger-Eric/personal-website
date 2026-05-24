// @vitest-environment node
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock photo-auth
const mockSignSessionToken = vi.fn();
const mockSignPhotoToken = vi.fn();
vi.mock("@/lib/photo-auth", () => ({
  signSessionToken: mockSignSessionToken,
  signPhotoToken: mockSignPhotoToken,
}));

const mockPhotoProjects = vi.hoisted(() => [
  {
    id: "proj1",
    photos: [
      { id: "photo1", src: "/images/1.jpg", private: true },
      { id: "photo2", src: "/images/2.jpg", private: false },
      { id: "photo3", src: "/images/3.jpg", private: true },
    ],
  },
]);
vi.mock("@/config/photography.json", () => ({
  default: { get projects() { return mockPhotoProjects; } },
}));

function createRequest(body?: any): NextRequest {
  return new NextRequest("http://localhost/api/auth/photo-session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function importHandler() {
  const mod = await import("@/app/api/auth/photo-session/route");
  return mod.POST;
}

describe("POST /api/auth/photo-session", () => {
  beforeAll(() => {
    process.env.PRIVATE_PHOTO_PIN = "123456";
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid JSON body", async () => {
    const POST = await importHandler();
    const req = new NextRequest("http://localhost/api/auth/photo-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not-json{",
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe("Invalid JSON");
  });

  it("returns 403 for wrong PIN", async () => {
    const POST = await importHandler();
    const req = createRequest({ pin: "wrong-pin" });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(json.error).toBe("Invalid PIN");
  });

  it("returns session token and private photo tokens on success", async () => {
    mockSignSessionToken.mockReturnValue("session-token-abc");
    mockSignPhotoToken
      .mockReturnValueOnce("token-photo1")
      .mockReturnValueOnce("token-photo3");

    const POST = await importHandler();
    const req = createRequest({ pin: "123456" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.sessionToken).toBe("session-token-abc");
    expect(json.photos).toHaveLength(2);
    expect(json.photos[0]).toEqual({ id: "photo1", token: "token-photo1" });
    expect(json.photos[1]).toEqual({ id: "photo3", token: "token-photo3" });
    expect(json.expiresIn).toBe(86400);
    expect(mockSignSessionToken).toHaveBeenCalledOnce();
  });

  it("filters only private photos", async () => {
    mockSignSessionToken.mockReturnValue("session");
    mockSignPhotoToken.mockReturnValue("token");

    const POST = await importHandler();
    const req = createRequest({ pin: "123456" });
    const res = await POST(req);
    const json = await res.json();

    expect(json.photos).toHaveLength(2);
    expect(json.photos.every((p: any) => ["photo1", "photo3"].includes(p.id))).toBe(true);
  });

  it("returns empty photos array when no private photos exist", async () => {
    mockPhotoProjects.length = 0;
    mockPhotoProjects.push({ id: "public", photos: [{ id: "p1", src: "/1.jpg", private: false }] });
    mockSignSessionToken.mockReturnValue("session");

    const POST = await importHandler();
    const req = createRequest({ pin: "123456" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.photos).toHaveLength(0);
  });

  it("handles missing projects gracefully", async () => {
    mockPhotoProjects.length = 0;
    mockSignSessionToken.mockReturnValue("session");

    const POST = await importHandler();
    const req = createRequest({ pin: "123456" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.photos).toHaveLength(0);
  });

  it("returns 501 when PIN is not configured", async () => {
    delete process.env.PRIVATE_PHOTO_PIN;
    vi.resetModules();
    const mod = await import("@/app/api/auth/photo-session/route");
    const POST = mod.POST;
    const req = createRequest({ pin: "123456" });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(501);
    expect(json.error).toBe("Private photos not configured");
  });
});
