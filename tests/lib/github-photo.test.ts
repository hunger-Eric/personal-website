// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  vi.restoreAllMocks();
  process.env.GITHUB_TOKEN = "test-token";
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// getRepoFile
// ─────────────────────────────────────────────────────────────────────────────
describe("getRepoFile", () => {
  it("fetches and returns file content when API succeeds", async () => {
    const mockData = { sha: "abc123", content: "base64content", path: "config/test.json" };
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const { getRepoFile } = await import("@/lib/github-photo");
    const result = await getRepoFile("config/test.json");

    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/hunger-Eric/personal-website/contents/config/test.json",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });

  it("returns null on 404", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Not Found", { status: 404 })
    );

    const { getRepoFile } = await import("@/lib/github-photo");
    const result = await getRepoFile("config/nonexistent.json");
    expect(result).toBeNull();
  });

  it("throws on non-404 error status", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Rate limited", { status: 403 })
    );

    const { getRepoFile } = await import("@/lib/github-photo");
    await expect(getRepoFile("config/test.json")).rejects.toThrow(
      "GitHub API error (403): Rate limited"
    );
  });

  it("throws on server error (500)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Internal error", { status: 500 })
    );

    const { getRepoFile } = await import("@/lib/github-photo");
    await expect(getRepoFile("config/test.json")).rejects.toThrow(
      "GitHub API error (500): Internal error"
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// upsertRepoFile
// ─────────────────────────────────────────────────────────────────────────────
describe("upsertRepoFile", () => {
  it("creates a file with utf-8 encoding (default)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ content: {} }), { status: 201 })
    );

    const { upsertRepoFile } = await import("@/lib/github-photo");
    await upsertRepoFile("config/test.json", JSON.stringify({ key: "val" }), "feat: add test");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/hunger-Eric/personal-website/contents/config/test.json",
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining("branch"),
      })
    );

    // Verify the body content is base64-encoded
    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]!.body as string);
    expect(body.message).toBe("feat: add test");
    expect(body.branch).toBe("main");
    expect(body.content).toBe(Buffer.from(JSON.stringify({ key: "val" })).toString("base64"));
    expect(body.sha).toBeUndefined();
  });

  it("creates a file with base64 encoding", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ content: {} }), { status: 201 })
    );

    const { upsertRepoFile } = await import("@/lib/github-photo");
    await upsertRepoFile("images/photo.jpg", "aW1hZ2VkYXRh", "feat: add photo", "base64");

    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]!.body as string);
    expect(body.content).toBe("aW1hZ2VkYXRh");
  });

  it("updates a file with existing SHA", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ content: {} }), { status: 200 })
    );

    const { upsertRepoFile } = await import("@/lib/github-photo");
    await upsertRepoFile(
      "config/test.json",
      JSON.stringify({ key: "updated" }),
      "feat: update test",
      "utf-8",
      "existing-sha-123"
    );

    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]!.body as string);
    expect(body.sha).toBe("existing-sha-123");
  });

  it("throws on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Conflict", { status: 409 })
    );

    const { upsertRepoFile } = await import("@/lib/github-photo");
    await expect(
      upsertRepoFile("config/test.json", "data", "msg")
    ).rejects.toThrow("GitHub API error on PUT (409): Conflict");
  });

  it("handles Buffer content with base64 encoding (branch: encoding==='base64' && content is Buffer)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ content: {} }), { status: 201 })
    );

    const { upsertRepoFile } = await import("@/lib/github-photo");
    const buf = Buffer.from("raw-binary-data");
    await upsertRepoFile("images/binary.bin", buf, "feat: add binary", "base64");

    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]!.body as string);
    // With base64 encoding and Buffer content, it should call content.toString("base64")
    expect(body.content).toBe(buf.toString("base64"));
  });

  it("handles Buffer content with utf-8 encoding", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ content: {} }), { status: 201 })
    );

    const { upsertRepoFile } = await import("@/lib/github-photo");
    const buf = Buffer.from("hello");
    await upsertRepoFile("test.txt", buf, "msg", "utf-8");

    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]!.body as string);
    expect(body.content).toBe(buf.toString("base64"));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// deleteRepoFile
// ─────────────────────────────────────────────────────────────────────────────
describe("deleteRepoFile", () => {
  it("deletes a file successfully", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 })
    );

    const { deleteRepoFile } = await import("@/lib/github-photo");
    await deleteRepoFile("images/old.jpg", "sha-abc", "feat: remove old.jpg");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/hunger-Eric/personal-website/contents/images/old.jpg",
      expect.objectContaining({ method: "DELETE" })
    );

    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]!.body as string);
    expect(body.message).toBe("feat: remove old.jpg");
    expect(body.branch).toBe("main");
    expect(body.sha).toBe("sha-abc");
  });

  it("throws on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Not Found", { status: 404 })
    );

    const { deleteRepoFile } = await import("@/lib/github-photo");
    await expect(
      deleteRepoFile("images/gone.jpg", "sha-xyz", "msg")
    ).rejects.toThrow("GitHub API error on DELETE (404): Not Found");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// uploadPhoto
// ─────────────────────────────────────────────────────────────────────────────
describe("uploadPhoto", () => {
  it("uploads a public photo and returns path + URL", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ content: {} }), { status: 201 })
    );

    const { uploadPhoto } = await import("@/lib/github-photo");
    const result = await uploadPhoto("summer.jpg", "base64data", false);

    expect(result.path).toBe("public/images/photography/summer.jpg");
    expect(result.url).toBe("/images/photography/summer.jpg");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("uploads a private photo and returns path + URL", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ content: {} }), { status: 201 })
    );

    const { uploadPhoto } = await import("@/lib/github-photo");
    const result = await uploadPhoto("private.jpg", "base64data", true);

    expect(result.path).toBe("private-photos/private.jpg");
    expect(result.url).toBe("./private-photos/private.jpg");
  });

  it("handles file names with directory prefixes", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ content: {} }), { status: 201 })
    );

    const { uploadPhoto } = await import("@/lib/github-photo");
    const result = await uploadPhoto("subdir/nested.jpg", "data", false);
    expect(result.path).toBe("public/images/photography/subdir/nested.jpg");
  });

  it("throws when upsertRepoFile fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Forbidden", { status: 403 })
    );

    const { uploadPhoto } = await import("@/lib/github-photo");
    await expect(uploadPhoto("fail.jpg", "data", false)).rejects.toThrow(
      "GitHub API error on PUT (403): Forbidden"
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// saveConfig
// ─────────────────────────────────────────────────────────────────────────────
describe("saveConfig", () => {
  it("saves config with existing SHA", async () => {
    vi.spyOn(global, "fetch")
      // First call: getRepoFile returns existing file
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ sha: "existing-sha", path: "config/photography.json" }), { status: 200 })
      )
      // Second call: upsertRepoFile succeeds
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ content: {} }), { status: 200 })
      );

    const { saveConfig } = await import("@/lib/github-photo");
    await saveConfig({ projects: [] });

    // Verify the PUT request includes the SHA
    const putCall = vi.mocked(fetch).mock.calls[1];
    const body = JSON.parse(putCall[1]!.body as string);
    expect(body.sha).toBe("existing-sha");
  });

  it("saves config without existing SHA (new file)", async () => {
    vi.spyOn(global, "fetch")
      // First call: getRepoFile returns null (404)
      .mockResolvedValueOnce(new Response("Not Found", { status: 404 }))
      // Second call: upsertRepoFile succeeds
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ content: {} }), { status: 201 })
      );

    const { saveConfig } = await import("@/lib/github-photo");
    await saveConfig({ projects: [] });

    const putCall = vi.mocked(fetch).mock.calls[1];
    const body = JSON.parse(putCall[1]!.body as string);
    expect(body.sha).toBeUndefined();
  });

  it("throws when upsertRepoFile fails", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ sha: "abc" }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response("Conflict", { status: 409 })
      );

    const { saveConfig } = await import("@/lib/github-photo");
    await expect(saveConfig({ projects: [] })).rejects.toThrow(
      "GitHub API error on PUT (409): Conflict"
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// listRepoDir
// ─────────────────────────────────────────────────────────────────────────────
describe("listRepoDir", () => {
  it("returns file names from a directory", async () => {
    const mockData = [
      { name: "photo1.jpg", type: "file" },
      { name: "photo2.png", type: "file" },
      { name: "subdir", type: "dir" },
    ];
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );

    const { listRepoDir } = await import("@/lib/github-photo");
    const result = await listRepoDir("public/images/photography");

    expect(result).toEqual(["photo1.jpg", "photo2.png", "subdir"]);
  });

  it("returns empty array on 404", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Not Found", { status: 404 })
    );

    const { listRepoDir } = await import("@/lib/github-photo");
    const result = await listRepoDir("nonexistent");
    expect(result).toEqual([]);
  });

  it("returns empty array on non-ok response that is not 404", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Forbidden", { status: 403 })
    );

    const { listRepoDir } = await import("@/lib/github-photo");
    const result = await listRepoDir("private-dir");
    expect(result).toEqual([]);
  });

  it("returns empty array when response is not an array", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ name: "single-file", type: "file" }), { status: 200 })
    );

    const { listRepoDir } = await import("@/lib/github-photo");
    const result = await listRepoDir("some/path");
    expect(result).toEqual([]);
  });

  it("returns empty array when data is a single file object (not a directory listing)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ name: "file.jpg", type: "file" }), { status: 200 })
    );

    const { listRepoDir } = await import("@/lib/github-photo");
    const result = await listRepoDir("some/path");
    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// rawUrl
// ─────────────────────────────────────────────────────────────────────────────
describe("rawUrl", () => {
  it("returns the correct raw GitHub URL", async () => {
    const { rawUrl } = await import("@/lib/github-photo");
    const url = rawUrl("config/site.json");
    expect(url).toBe(
      "https://raw.githubusercontent.com/hunger-Eric/personal-website/main/config/site.json"
    );
  });

  it("handles paths with special characters", async () => {
    const { rawUrl } = await import("@/lib/github-photo");
    const url = rawUrl("images/photo with spaces.jpg");
    expect(url).toBe(
      "https://raw.githubusercontent.com/hunger-Eric/personal-website/main/images/photo with spaces.jpg"
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getToken (internal, tested via other functions' behavior)
// ─────────────────────────────────────────────────────────────────────────────
describe("getToken (via getRepoFile)", () => {
  it("uses GITHUB_TOKEN when set", async () => {
    process.env.GITHUB_TOKEN = "token-a";
    delete process.env.PHOTO_GITHUB_TOKEN;

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ path: "test" }), { status: 200 })
    );

    const { getRepoFile } = await import("@/lib/github-photo");
    await getRepoFile("test.json");

    const callHeaders = (vi.mocked(fetch).mock.calls[0][1] as any).headers;
    expect(callHeaders.Authorization).toBe("Bearer token-a");
  });

  it("falls back to PHOTO_GITHUB_TOKEN when GITHUB_TOKEN is not set", async () => {
    delete process.env.GITHUB_TOKEN;
    process.env.PHOTO_GITHUB_TOKEN = "fallback-token";

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ path: "test" }), { status: 200 })
    );

    const { getRepoFile } = await import("@/lib/github-photo");
    await getRepoFile("test.json");

    const callHeaders = (vi.mocked(fetch).mock.calls[0][1] as any).headers;
    expect(callHeaders.Authorization).toBe("Bearer fallback-token");
  });

  it("throws when no token is set", async () => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.PHOTO_GITHUB_TOKEN;

    const { getRepoFile } = await import("@/lib/github-photo");
    await expect(getRepoFile("test.json")).rejects.toThrow("GITHUB_TOKEN not set");
  });
});
