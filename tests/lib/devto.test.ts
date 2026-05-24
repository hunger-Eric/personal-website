// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchDevToArticles } from "@/lib/devto";

beforeEach(() => { vi.restoreAllMocks(); });

describe("fetchDevToArticles", () => {
  it("returns mapped articles on success", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify([
        { id: 1, title: "A1", description: "D1", url: "https://dev.to/a1",
          published_at: "2025-01-01", reading_time_minutes: 5,
          tag_list: ["js"], cover_image: "https://img.png",
          public_reactions_count: 10, comments_count: 2 }
      ]), { status: 200 })
    );
    const r = await fetchDevToArticles("user");
    expect(r).toHaveLength(1);
    expect(r[0].title).toBe("A1");
    expect(r[0].source).toBe("devto");
    expect(r[0].reactionsCount).toBe(10);
  });

  it("returns [] on API error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("Error", { status: 500 }));
    const r = await fetchDevToArticles("user");
    expect(r).toEqual([]);
  });

  it("returns [] on network error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network"));
    const r = await fetchDevToArticles("user");
    expect(r).toEqual([]);
  });

  it("handles missing optional fields", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify([
        { id: 1, title: "A1", description: "", url: "", published_at: "",
          reading_time_minutes: 0, tag_list: [], public_reactions_count: 0, comments_count: 0 }
      ]), { status: 200 })
    );
    const r = await fetchDevToArticles("user");
    expect(r).toHaveLength(1);
    expect(r[0].description).toBe("");
    expect(r[0].tags).toEqual([]);
  });
});
