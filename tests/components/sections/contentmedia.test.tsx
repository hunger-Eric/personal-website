// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));

vi.mock("lucide-react", () => ({
  Play: () => React.createElement("svg", { "data-testid": "icon-play" }),
}));

vi.mock("@/components/BrandGlyphs", () => ({
  YoutubeGlyph: (p: any) =>
    React.createElement("svg", { "data-testid": "icon-youtube-glyph", className: p.className }),
}));

// Use vi.hoisted to create mutable state containers before vi.mock factories run
const mockState = vi.hoisted(() => ({
  channelId: "",
  videos: [] as any[],
  loadLatestYouTubeVideos: vi.fn(() => Promise.resolve([] as any[])),
  featuredContent: {} as { youtubeChannelId: string },
}));

vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    get featuredContent() { return mockState.featuredContent; },
  },
}));

vi.mock("@/config/youtubeFeed", () => ({
  get loadLatestYouTubeVideos() { return mockState.loadLatestYouTubeVideos; },
}));

// ── Test Data ──────────────────────────────────────────────────────────────

const vid1 = {
  id: "vid1",
  title: "My First YouTube Video",
  url: "https://youtube.com/watch?v=abc123",
  thumbnailUrl: "https://i.ytimg.com/vi/abc123/mqdefault.jpg",
  publishedAt: "2024-01-15T00:00:00Z",
};

const vid2 = {
  id: "vid2",
  title: "Second Video Title",
  url: "https://youtube.com/watch?v=def456",
  thumbnailUrl: "https://i.ytimg.com/vi/def456/mqdefault.jpg",
  publishedAt: "2024-02-20T00:00:00Z",
};

const vid3 = {
  id: "vid3",
  title: "Third Video About Code",
  url: "https://youtube.com/watch?v=ghi789",
  thumbnailUrl: "https://i.ytimg.com/vi/ghi789/mqdefault.jpg",
  publishedAt: "2024-03-10T00:00:00Z",
};

// Helper to setup state for each test
function setupContentMedia(channelId: string, videos: any[]) {
  mockState.featuredContent = { youtubeChannelId: channelId };
  mockState.loadLatestYouTubeVideos = vi.fn(() => Promise.resolve(videos));
}

// Helper to render the async ContentMediaSection wrapped in Suspense with act
async function renderContentMedia() {
  const mod = await import("@/components/sections/ContentMedia");
  const { ContentMediaSection } = mod;
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      React.createElement(
        React.Suspense,
        { fallback: React.createElement("div", null, "loading") },
        React.createElement(ContentMediaSection)
      )
    );
  });
  return result!;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ContentMediaSection", () => {
  it("renders nothing when channelId is empty", async () => {
    setupContentMedia("", []);
    const { container } = await renderContentMedia();
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when loadLatestYouTubeVideos returns empty", async () => {
    setupContentMedia("UC_test", []);
    const { container } = await renderContentMedia();
    expect(container.innerHTML).toBe("");
  });

  it("renders section heading", async () => {
    setupContentMedia("UC_test", [vid1]);
    await renderContentMedia();
    expect(screen.getByText("~/Content")).toBeTruthy();
  });

  it("renders video cards with titles", async () => {
    setupContentMedia("UC_test", [vid1, vid2]);
    await renderContentMedia();
    expect(screen.getByText("My First YouTube Video")).toBeTruthy();
    expect(screen.getByText("Second Video Title")).toBeTruthy();
  });

  it("renders thumbnails for each video", async () => {
    setupContentMedia("UC_test", [vid1, vid2]);
    const { container } = await renderContentMedia();
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(2);
    expect(imgs[0].getAttribute("src")).toBe(
      "https://i.ytimg.com/vi/abc123/mqdefault.jpg"
    );
  });

  it("renders video links pointing to YouTube", async () => {
    setupContentMedia("UC_test", [vid1]);
    const { container } = await renderContentMedia();
    const links = container.querySelectorAll("a");
    const vidLink = Array.from(links).find(
      (a) => a.getAttribute("href") === "https://youtube.com/watch?v=abc123"
    );
    expect(vidLink).toBeTruthy();
    expect(vidLink?.getAttribute("aria-label")).toContain(
      "My First YouTube Video"
    );
  });

  it("renders Play icon overlay on each video", async () => {
    setupContentMedia("UC_test", [vid1]);
    const { container } = await renderContentMedia();
    expect(container.querySelector('[data-testid="icon-play"]')).toBeTruthy();
  });

  it("renders YouTube chip badge", async () => {
    setupContentMedia("UC_test", [vid1]);
    await renderContentMedia();
    expect(screen.getByText("YouTube")).toBeTruthy();
  });

  it("renders up to 3 videos in a grid", async () => {
    setupContentMedia("UC_test", [vid1, vid2, vid3]);
    const { container } = await renderContentMedia();
    expect(screen.getByText("Third Video About Code")).toBeTruthy();
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(3);
  });

  it("calls loadLatestYouTubeVideos with correct channelId and limit", async () => {
    setupContentMedia("UC_test123", [vid1]);
    await renderContentMedia();
    expect(mockState.loadLatestYouTubeVideos).toHaveBeenCalledWith(
      "UC_test123",
      3
    );
  });
});
