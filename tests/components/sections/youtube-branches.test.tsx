// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));
vi.mock("next/link", () => ({
  default: (p: any) => React.createElement("a", { href: p.href }, p.children),
}));

vi.mock("lucide-react", () => ({
  Youtube: () => React.createElement("svg", { "data-testid": "youtube-icon" }),
  ExternalLink: () => React.createElement("svg", { "data-testid": "external-link-icon" }),
}));

vi.mock("@/config/siteConfig", () => ({
  siteConfig: { name: "Test", socials: { youtube: "https://youtube.com/@test" } },
}));

// ── Tests ──────────────────────────────────────────────────────────────────

describe("YouTubeSection branch coverage", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns null when youtubeVideos is empty (line 7)", async () => {
    vi.doMock("@/config/youtube", () => ({ youtubeVideos: [] }));
    const { YouTubeSection } = await import("@/components/sections/YouTube");
    const { container } = render(React.createElement(YouTubeSection));
    expect(container.firstChild).toBeNull();
  });

  it("handles single video: mostRecent and mostViewed fallback to featured", async () => {
    vi.doMock("@/config/youtube", () => ({
      youtubeVideos: [
        {
          id: "vid1", title: "Only Video", description: "Only one",
          url: "https://youtube.com/watch?v=only1", thumbnailUrl: "/thumb.jpg",
          date: "2025-01-15", views: "100", duration: "10:00",
        },
      ],
    }));
    const { YouTubeSection } = await import("@/components/sections/YouTube");
    render(React.createElement(YouTubeSection));
    // Video appears in featured (h4), most recent (h5), and most viewed (h5)
    expect(screen.getAllByText("Only Video")).toHaveLength(3);
    expect(screen.getByText("Most recent video")).toBeInTheDocument();
    expect(screen.getByText("Most viewed video")).toBeInTheDocument();
  });

  it("handles two videos: mostViewed falls back to mostRecent", async () => {
    vi.doMock("@/config/youtube", () => ({
      youtubeVideos: [
        {
          id: "vid1", title: "Featured", description: "",
          url: "https://youtube.com/watch?v=f1", thumbnailUrl: "/t1.jpg",
          date: "2025-01-15", views: "100", duration: "10:00",
        },
        {
          id: "vid2", title: "Second", description: "",
          url: "https://youtube.com/watch?v=s2", thumbnailUrl: "/t2.jpg",
          date: "2025-01-10", views: "50", duration: "5:00",
        },
      ],
    }));
    const { YouTubeSection } = await import("@/components/sections/YouTube");
    render(React.createElement(YouTubeSection));
    expect(screen.getByText("Featured")).toBeInTheDocument();
    // "Second" appears in both mostRecent and mostViewed (same video)
    expect(screen.getAllByText("Second")).toHaveLength(2);
  });

  it("renders featured video with only date, no views", async () => {
    vi.doMock("@/config/youtube", () => ({
      youtubeVideos: [
        {
          id: "vid1", title: "Date Only", description: "",
          url: "https://youtube.com/watch?v=d1", thumbnailUrl: "/t1.jpg",
          date: "2025-01-15", duration: "10:00",
        },
      ],
    }));
    const { YouTubeSection } = await import("@/components/sections/YouTube");
    render(React.createElement(YouTubeSection));
    expect(screen.getAllByText("Date Only").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2025-01-15").length).toBeGreaterThanOrEqual(1);
  });

  it("renders featured video with only views, no date", async () => {
    vi.doMock("@/config/youtube", () => ({
      youtubeVideos: [
        {
          id: "vid1", title: "Views Only", description: "",
          url: "https://youtube.com/watch?v=v1", thumbnailUrl: "/t1.jpg",
          views: "500", duration: "10:00",
        },
      ],
    }));
    const { YouTubeSection } = await import("@/components/sections/YouTube");
    render(React.createElement(YouTubeSection));
    expect(screen.getAllByText("Views Only").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("500 views").length).toBeGreaterThanOrEqual(1);
  });

  it("renders VideoCard with only date, no views", async () => {
    vi.doMock("@/config/youtube", () => ({
      youtubeVideos: [
        {
          id: "vid1", title: "Featured", description: "",
          url: "https://youtube.com/watch?v=f1", thumbnailUrl: "/t1.jpg",
          date: "2025-01-15", duration: "10:00",
        },
        {
          id: "vid2", title: "Date Only Card", description: "",
          url: "https://youtube.com/watch?v=d2", thumbnailUrl: "/t2.jpg",
          date: "2025-01-10",
        },
      ],
    }));
    const { YouTubeSection } = await import("@/components/sections/YouTube");
    render(React.createElement(YouTubeSection));
    expect(screen.getAllByText("Date Only Card").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2025-01-10").length).toBeGreaterThanOrEqual(1);
  });

  it("renders VideoCard with only views, no date", async () => {
    vi.doMock("@/config/youtube", () => ({
      youtubeVideos: [
        {
          id: "vid1", title: "Featured", description: "",
          url: "https://youtube.com/watch?v=f1", thumbnailUrl: "/t1.jpg",
          date: "2025-01-15", duration: "10:00",
        },
        {
          id: "vid2", title: "Views Only Card", description: "",
          url: "https://youtube.com/watch?v=v2", thumbnailUrl: "/t2.jpg",
          views: "200",
        },
      ],
    }));
    const { YouTubeSection } = await import("@/components/sections/YouTube");
    render(React.createElement(YouTubeSection));
    // "Views Only Card" appears in both mostRecent and mostViewed (same video)
    expect(screen.getAllByText("Views Only Card")).toHaveLength(2);
    expect(screen.getAllByText("200 views")).toHaveLength(2);
  });
});
