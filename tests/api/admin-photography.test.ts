// @vitest-environment node
import { describe, it, expect, vi, beforeAll } from "vitest";
import { NextRequest } from "next/server";

process.env.ENABLE_ADMIN = "true";

// Mock all github-photo functions
vi.mock("@/lib/github-photo", () => ({
  getRepoFile: vi.fn(),
  saveConfig: vi.fn(),
  uploadPhoto: vi.fn(),
  deleteRepoFile: vi.fn(),
  listRepoDir: vi.fn(),
}));

import {
  getRepoFile,
  saveConfig,
  uploadPhoto,
  deleteRepoFile,
  listRepoDir,
} from "@/lib/github-photo";

beforeEach(() => {
  // Reset mock implementations AND call history completely
  vi.mocked(listRepoDir).mockReset();
  vi.mocked(saveConfig).mockReset();
  vi.mocked(uploadPhoto).mockReset();
  vi.mocked(deleteRepoFile).mockReset();
  vi.mocked(getRepoFile).mockReset();
});

describe("GET /api/admin/photography", () => {
  it("returns config and file listings", async () => {
    vi.mocked(listRepoDir).mockResolvedValueOnce(["photo1.jpg", "photo2.jpg"]);
    vi.mocked(listRepoDir).mockResolvedValueOnce(["private1.jpg"]);

    const { GET } = await import("@/app/api/admin/photography/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("config");
    expect(body).toHaveProperty("files");
    expect(body.files.public).toEqual(["photo1.jpg", "photo2.jpg"]);
    expect(body.files.private).toEqual(["private1.jpg"]);
  });

  it("returns 500 when listRepoDir throws for public dir", async () => {
    vi.mocked(listRepoDir).mockRejectedValueOnce(new Error("Network error"));
    vi.mocked(listRepoDir).mockResolvedValueOnce([]);

    const { GET } = await import("@/app/api/admin/photography/route");
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Network error");
  });

  it("returns 500 when listRepoDir throws for private dir", async () => {
    vi.mocked(listRepoDir).mockResolvedValueOnce(["p1.jpg"]);
    vi.mocked(listRepoDir).mockRejectedValueOnce(new Error("Auth error"));

    const { GET } = await import("@/app/api/admin/photography/route");
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Auth error");
  });

  it("returns 500 with fallback message when err has no message", async () => {
    // Throws a non-Error (no .message property)
    vi.mocked(listRepoDir).mockImplementationOnce(() => Promise.reject({ code: 123 }));
    vi.mocked(listRepoDir).mockResolvedValueOnce([]);

    const { GET } = await import("@/app/api/admin/photography/route");
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to load config");
  });

  it("returns 500 when a string is thrown (non-Error)", async () => {
    vi.mocked(listRepoDir).mockImplementationOnce(() => Promise.reject("string error"));
    vi.mocked(listRepoDir).mockResolvedValueOnce([]);

    const { GET } = await import("@/app/api/admin/photography/route");
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to load config");
  });
});

describe("POST /api/admin/photography (multipart/form-data)", () => {
  beforeEach(() => {
    vi.mocked(uploadPhoto).mockReset();
    vi.mocked(saveConfig).mockReset();
  });

  it("uploads photos and saves config via multipart form data", async () => {
    vi.mocked(uploadPhoto).mockResolvedValueOnce({
      path: "public/images/photography/test.jpg",
      url: "/images/photography/test.jpg",
    });
    vi.mocked(uploadPhoto).mockResolvedValueOnce({
      path: "private-photos/private.jpg",
      url: "./private-photos/private.jpg",
    });
    vi.mocked(saveConfig).mockResolvedValueOnce(undefined);

    const { POST } = await import("@/app/api/admin/photography/route");

    const configStr = JSON.stringify({ projects: [] });
    const formData = new FormData();
    formData.append("config", configStr);

    const publicFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
    formData.append("photo", publicFile);
    formData.append("photo_meta", JSON.stringify({ id: "test-001", private: false }));

    const privateFile = new File(["private"], "private.jpg", { type: "image/jpeg" });
    formData.append("photo", privateFile);
    formData.append("photo_meta", JSON.stringify({ id: "priv-001", private: true }));

    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        body: formData,
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.uploaded).toHaveLength(2);
    expect(body.message).toContain("新增 2 张照片");
    expect(uploadPhoto).toHaveBeenCalledTimes(2);
    expect(saveConfig).toHaveBeenCalledTimes(1);
  });

  it("uploads photo with default id when meta.id is missing", async () => {
    vi.mocked(uploadPhoto).mockResolvedValueOnce({
      path: "public/images/photography/no-id.jpg",
      url: "/images/photography/no-id.jpg",
    });
    vi.mocked(saveConfig).mockResolvedValueOnce(undefined);

    const { POST } = await import("@/app/api/admin/photography/route");

    const configStr = JSON.stringify({ projects: [] });
    const formData = new FormData();
    formData.append("config", configStr);
    const file = new File(["data"], "no-id.jpg", { type: "image/jpeg" });
    formData.append("photo", file);
    // No photo_meta appended

    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        body: formData,
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.uploaded[0].id).toBe("no-id.jpg");
  });

  it("returns 400 when config is missing in multipart", async () => {
    const { POST } = await import("@/app/api/admin/photography/route");

    const formData = new FormData();
    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        body: formData,
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing config data");
  });

  it("returns 500 when uploadPhoto fails in multipart", async () => {
    vi.mocked(uploadPhoto).mockRejectedValueOnce(new Error("Upload failed"));

    const { POST } = await import("@/app/api/admin/photography/route");

    const configStr = JSON.stringify({ projects: [] });
    const formData = new FormData();
    formData.append("config", configStr);
    const file = new File(["data"], "fail.jpg", { type: "image/jpeg" });
    formData.append("photo", file);
    formData.append("photo_meta", JSON.stringify({ id: "fail" }));

    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        body: formData,
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Upload failed");
  });
});

describe("POST /api/admin/photography (JSON body)", () => {
  beforeEach(() => {
    vi.mocked(saveConfig).mockReset();
    vi.mocked(getRepoFile).mockReset();
    vi.mocked(deleteRepoFile).mockReset();
  });

  it("updates config via JSON body with no photos", async () => {
    vi.mocked(saveConfig).mockResolvedValueOnce(undefined);

    const { POST } = await import("@/app/api/admin/photography/route");

    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: { projects: [] } }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("配置已保存");
    expect(saveConfig).toHaveBeenCalledWith({ projects: [] });
  });

  it("updates config and deletes photos via JSON body", async () => {
    vi.mocked(saveConfig).mockResolvedValueOnce(undefined);
    vi.mocked(getRepoFile).mockResolvedValueOnce({ sha: "abc123", path: "images/old.jpg" });
    vi.mocked(deleteRepoFile).mockResolvedValueOnce(undefined);

    const { POST } = await import("@/app/api/admin/photography/route");

    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: { projects: [] },
          deletedPhotos: [{ path: "images/old.jpg" }],
        }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(deleteRepoFile).toHaveBeenCalledWith(
      "images/old.jpg",
      "abc123",
      expect.stringContaining("remove images/old.jpg")
    );
  });

  it("skips deletion when repo file has no sha", async () => {
    vi.mocked(saveConfig).mockResolvedValueOnce(undefined);
    vi.mocked(getRepoFile).mockResolvedValueOnce(null);

    const { POST } = await import("@/app/api/admin/photography/route");

    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: { projects: [] },
          deletedPhotos: [{ path: "images/gone.jpg" }],
        }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(deleteRepoFile).not.toHaveBeenCalled();
  });

  it("handles deletion error gracefully (console.warn)", async () => {
    vi.mocked(saveConfig).mockResolvedValueOnce(undefined);
    vi.mocked(getRepoFile).mockRejectedValueOnce(new Error("GitHub error"));

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { POST } = await import("@/app/api/admin/photography/route");

    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: { projects: [] },
          deletedPhotos: [{ path: "images/fail.jpg" }],
        }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to delete images/fail.jpg"),
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
  });

  it("returns 400 when config payload is missing from JSON body", async () => {
    const { POST } = await import("@/app/api/admin/photography/route");

    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing config payload");
  });

  it("returns 500 when saveConfig fails in JSON path", async () => {
    vi.mocked(saveConfig).mockRejectedValueOnce(new Error("GitHub push failed"));

    const { POST } = await import("@/app/api/admin/photography/route");

    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: { projects: [] } }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("GitHub push failed");
  });

  it("returns 500 with fallback error message when err has no message", async () => {
    vi.mocked(saveConfig).mockRejectedValueOnce({});

    const { POST } = await import("@/app/api/admin/photography/route");

    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: { projects: [] } }),
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("保存失败");
  });

  it("handles JSON parse error in multipart path (invalid config JSON)", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { POST } = await import("@/app/api/admin/photography/route");

    const formData = new FormData();
    formData.append("config", "{invalid json}");

    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        body: formData,
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("JSON");

    consoleErrorSpy.mockRestore();
  });

  it("handles request without content-type header (|| '' fallback)", async () => {
    // The contentType variable uses `|| ""` fallback. This test verifies
    // that when content-type is missing, the code handles it gracefully.
    const { POST } = await import("@/app/api/admin/photography/route");

    // Send JSON with no Content-Type header to exercise the fallback
    vi.mocked(saveConfig).mockRejectedValueOnce(new Error("No content-type"));

    const req = new NextRequest(
      new Request("http://localhost/api/admin/photography", {
        method: "POST",
        // No Content-Type header set
        body: JSON.stringify({ config: { projects: [] } }),
      })
    );
    // Explicitly delete the content-type header
    Object.defineProperty(req, 'headers', {
      value: new Headers(),
      writable: false,
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
