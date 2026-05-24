// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRepoFile, upsertRepoFile, deleteRepoFile, uploadPhoto } from "@/lib/github-photo";

beforeEach(() => { vi.restoreAllMocks(); process.env.GITHUB_TOKEN = "test-token"; });

describe("getRepoFile", () => {
  it("returns file content on success", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ path: "photos/1.jpg", content: "base64" }), { status: 200 })
    );
    const r = await getRepoFile("photos/1.jpg");
    expect(r.path).toBe("photos/1.jpg");
  });
  it("returns null on 404", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("", { status: 404 }));
    expect(await getRepoFile("x")).toBeNull();
  });
  it("throws on error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("", { status: 401 }));
    await expect(getRepoFile("x")).rejects.toThrow("GitHub API error");
  });
  it("throws when no token", async () => {
    delete process.env.GITHUB_TOKEN;
    await expect(getRepoFile("x")).rejects.toThrow("GITHUB_TOKEN");
  });
});

describe("upsertRepoFile", () => {
  it("succeeds without throwing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("ok", { status: 200 }));
    await expect(upsertRepoFile("test.md", "hello", "msg")).resolves.toBeUndefined();
  });
  it("throws on error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("", { status: 422 }));
    await expect(upsertRepoFile("test.md", "data", "msg")).rejects.toThrow();
  });
});

describe("deleteRepoFile", () => {
  it("succeeds without throwing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("", { status: 200 }));
    await expect(deleteRepoFile("test.md", "sha123", "msg")).resolves.toBeUndefined();
  });
  it("throws on error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("", { status: 404 }));
    await expect(deleteRepoFile("test.md", "sha", "msg")).rejects.toThrow();
  });
});
