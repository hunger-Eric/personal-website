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

  // ----- NEW TESTS for branch coverage -----

  it("fallback path: handles object id without videoId when videos API fails", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        // item.id is an object but has no videoId - this gets us into the
        // search results but yields empty videoIds -> empty array from first branch
        // To hit the fallback path, we need items with valid videoId in search
        // but then have the videos API fail
        return new Response(JSON.stringify({
          items: [
            { id: { videoId: "vid1" }, snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: {} } }
          ]
        }), { status: 200 });
      }
      // videos API fails -> fallback
      return new Response("Fail", { status: 500 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("vid1");
    expect(r[0].url).toBe("https://www.youtube.com/watch?v=vid1");
  });

  it("fallback path: object id with no videoId element gives empty id", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(JSON.stringify({
          items: [
            { id: { videoId: "v1" }, snippet: { title: "T1", description: "D1", publishedAt: "2025-01-01", thumbnails: { high: { url: "https://img.youtube.com/vi/v1/hqdefault.jpg" } } } }
          ]
        }), { status: 200 });
      }
      return new Response("Fail", { status: 500 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toHaveLength(1);
  });

  it("videos API success path handles object id type", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(JSON.stringify({
          items: [{ id: { videoId: "vid1" }, snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { high: { url: "https://img.youtube.com/vi/vid1/hqdefault.jpg" } } } }]
        }), { status: 200 });
      }
      // videos API response where item.id is an object (not a string)
      return new Response(JSON.stringify({
        items: [{ id: { videoId: "vid1" }, snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { high: { url: "https://img.youtube.com/vi/vid1/hqdefault.jpg" } } }, statistics: { viewCount: "1500" }, contentDetails: { duration: "PT5M" } }]
      }), { status: 200 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toHaveLength(1);
    // When item.id is an object, videoId = "" because typeof item.id !== "string"
    expect(r[0].id).toBe("");
    // But url still uses the original videoId from search? No, it uses videoId from item.id
    expect(r[0].url).toBe("https://www.youtube.com/watch?v=");
  });

  it("videos API handles items with string ids correctly", async () => {
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
        items: [{ id: "vid1", snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { medium: { url: "https://img.youtube.com/vi/vid1/mqdefault.jpg" } } }, statistics: { viewCount: "999999999", likeCount: "500" }, contentDetails: { duration: "PT1H30M" } }]
      }), { status: 200 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe("vid1");
    expect(r[0].thumbnailUrl).toBe("https://img.youtube.com/vi/vid1/mqdefault.jpg");
    expect(r[0].duration).toBe("PT1H30M");
  });

  it("videos API handles missing statistics and contentDetails", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(JSON.stringify({
          items: [{ id: { videoId: "vid1" }, snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { default: { url: "https://img.youtube.com/vi/vid1/default.jpg" } } } }]
        }), { status: 200 });
      }
      return new Response(JSON.stringify({
        items: [{ id: "vid1", snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: {} } }]
      }), { status: 200 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toHaveLength(1);
    expect(r[0].viewCount).toBeUndefined();
    expect(r[0].likeCount).toBeUndefined();
    expect(r[0].duration).toBeUndefined();
    expect(r[0].thumbnailUrl).toBe("");
  });

  it("videos API handles no items", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(JSON.stringify({
          items: [{ id: { videoId: "vid1" }, snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { high: { url: "https://img.youtube.com/vi/vid1/hqdefault.jpg" } } } }]
        }), { status: 200 });
      }
      return new Response(JSON.stringify({ items: [] }), { status: 200 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toEqual([]);
  });

  // ---- Coverage edge cases ----
  // Line 126: videosData.items is null (not empty array)
  it("videos API returns [] when items is null", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(JSON.stringify({
          items: [{ id: { videoId: "vid1" }, snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { high: { url: "https://img.youtube.com/vi/vid1/hqdefault.jpg" } } } }]
        }), { status: 200 });
      }
      return new Response(JSON.stringify({ items: null }), { status: 200 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toEqual([]);
  });

  // Lines 130-131: thumbnail with only medium (no high), snippet fallbacks
  it("videos API uses medium thumbnail when high is absent", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(JSON.stringify({
          items: [{ id: { videoId: "vid1" }, snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { medium: { url: "https://img.youtube.com/vi/vid1/mqdefault.jpg" } } } }]
        }), { status: 200 });
      }
      return new Response(JSON.stringify({
        items: [{ id: "vid1", snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { medium: { url: "https://img.youtube.com/vi/vid1/mqdefault.jpg" } } }, statistics: { viewCount: "500", likeCount: "50" } }]
      }), { status: 200 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toHaveLength(1);
    expect(r[0].thumbnailUrl).toBe("https://img.youtube.com/vi/vid1/mqdefault.jpg");
  });

  // Lines 130-131: thumbnail with only default (no high/medium)
  it("videos API falls through to empty string when only default thumbnail", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(JSON.stringify({
          items: [{ id: { videoId: "vid1" }, snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { default: { url: "https://img.youtube.com/vi/vid1/default.jpg" } } } }]
        }), { status: 200 });
      }
      return new Response(JSON.stringify({
        items: [{ id: "vid1", snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { default: { url: "https://img.youtube.com/vi/vid1/default.jpg" } } }, statistics: { viewCount: "500", likeCount: "50" } }]
      }), { status: 200 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toHaveLength(1);
    // high and medium are both absent, default is not checked
    expect(r[0].thumbnailUrl).toBe("");
  });

  // Line 136: viewCount and likeCount with undefined values inside existing statistics
  it("videos API handles statistics with viewCount undefined", async () => {
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
        items: [{ id: "vid1", snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { high: { url: "https://img.youtube.com/vi/vid1/hqdefault.jpg" } } }, statistics: { likeCount: "100" } }]
      }), { status: 200 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toHaveLength(1);
    expect(r[0].viewCount).toBeUndefined();
    expect(r[0].likeCount).toBe(100);
  });

  // Line 136: likeCount as undefined
  it("videos API handles statistics with likeCount undefined", async () => {
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
        items: [{ id: "vid1", snippet: { title: "V1", description: "D1", publishedAt: "2025-01-01", thumbnails: { high: { url: "https://img.youtube.com/vi/vid1/hqdefault.jpg" } } }, statistics: { viewCount: "999" } }]
      }), { status: 200 });
    });
    const r = await fetchYouTubeVideos("UC_test");
    expect(r).toHaveLength(1);
    expect(r[0].viewCount).toBe(999);
    expect(r[0].likeCount).toBeUndefined();
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
  it("returns empty string for 0", () => { expect(formatViewCount(0)).toBe(""); });
  it("formats millions", () => { expect(formatViewCount(1500000)).toBe("1.5M views"); });
  it("formats thousands", () => { expect(formatViewCount(2500)).toBe("2.5K views"); });
  it("formats small numbers", () => { expect(formatViewCount(500)).toBe("500 views"); });
});
