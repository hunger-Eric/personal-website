// @vitest-environment node
// Tests for lib/youtube.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchYouTubeVideos, formatDuration, formatViewCount } from "@/lib/youtube";

beforeEach(() => {
  vi.restoreAllMocks();
  delete process.env.YOUTUBE_API_KEY;
});

describe("fetchYouTubeVideos", () => {
  it("returns [] when YOUTUBE_API_KEY is not set", async () => {
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toEqual([]);
  });

  it("returns [] when search API returns no items", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), { status: 200 })
    );
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toEqual([]);
  });

  it("returns [] when search API returns items with no valid videoIds", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [{ id: {} }] }), { status: 200 })
    );
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toEqual([]);
  });

  it("returns full video data from videos API", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(JSON.stringify({
          items: [{ id: { videoId: "vid1" }, snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { high: { url: "https://img.youtube.com/vi/vid1/hqdefault.jpg" } } } }]
        }), { status: 200 });
      }
      return new Response(JSON.stringify({
        items: [{ id: "vid1", snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { high: { url: "https://img.youtube.com/vi/vid1/hqdefault.jpg" } } }, statistics: { viewCount: "1500", likeCount: "100" }, contentDetails: { duration: "PT5M30S" } }]
      }), { status: 200 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("vid1");
    expect(r[0].title).toBe("V1");
    expect(r[0].viewCount).toBe(1500);
    expect(r[0].likeCount).toBe(100);
    expect(r[0].duration).toBe("PT5M30S");
  });

  it("falls back to search data when videos API fails", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(JSON.stringify({
          items: [{ id: { videoId: "vid1" }, snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { high: { url: "https://img.youtube.com/vi/vid1/hqdefault.jpg" } } } }]
        }), { status: 200 });
      }
      return new Response("Server Error", { status: 500 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("vid1");
  });

  it("handles network error and returns []", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toEqual([]);
  });

  it("handles search API error", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("Error", { status: 403 }));
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toEqual([]);
  });
});

describe("formatDuration", () => {
  it("returns empty string for undefined", () => { expect(formatDuration()).toBe(""); });
  it("returns empty string for invalid format", () => { expect(formatDuration("invalid")).toBe(""); });
  it("formats minutes and seconds", () => { expect(formatDuration("PT5M30S")).toBe("5:30"); });
  it("formats hours, minutes, seconds", () => { expect(formatDuration("PT1H2M3S")).toBe("1:02:03"); });
  it("formats only seconds", () => { expect(formatDuration("PT45S")).toBe("0:45"); });
  it("formats only hours", () => { expect(formatDuration("PT2H")).toBe("2:00:00"); });
});

describe("formatViewCount", () => {
  it("returns empty string for undefined", () => { expect(formatViewCount()).toBe(""); });
  it("formats millions", () => { expect(formatViewCount(1500000)).toBe("1.5M views"); });
  it("formats thousands", () => { expect(formatViewCount(2500)).toBe("2.5K views"); });
  it("formats small numbers", () => { expect(formatViewCount(500)).toBe("500 views"); });
});
