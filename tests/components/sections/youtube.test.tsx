// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/config/youtube", () => ({
  youtubeVideos: [
    {
      id: "vid1", title: "Test Video", description: "A test video",
      url: "https://youtube.com/watch?v=test123", thumbnailUrl: "/thumb.jpg",
      date: "2025-01-15", views: "1500", duration: "10:30",
    },
    {
      id: "vid2", title: "Second Video", description: "Second test",
      url: "https://youtube.com/watch?v=test456", thumbnailUrl: "/thumb2.jpg",
      date: "2025-01-10", views: "500", duration: "5:00",
    },
    {
      id: "vid3", title: "Third Video", description: "Third test",
      url: "https://youtube.com/watch?v=test789", thumbnailUrl: "/thumb3.jpg",
      date: "2025-01-05", views: "200", duration: "3:00",
    },
  ]
}));
vi.mock("@/config/siteConfig", () => ({
  siteConfig: { name: "Test", socials: { youtube: "https://youtube.com/@test" } }
}));
vi.mock("lucide-react", () => ({
  Youtube: () => React.createElement("svg", { "data-testid": "youtube-icon" }),
  ExternalLink: () => React.createElement("svg", { "data-testid": "external-link-icon" }),
}));

describe("YouTubeSection", () => {
  it("renders without crashing", async () => {
    const mod = await import("@/components/sections/YouTube");
    const Component = mod["YouTubeSection"];
    if (typeof Component === "function") {
      const { container } = render(React.createElement(Component));
      expect(container).toBeTruthy();
    }
  });

  it("renders the section with correct id", async () => {
    const mod = await import("@/components/sections/YouTube");
    const Component = mod["YouTubeSection"];
    const { container } = render(React.createElement(Component));
    const section = container.querySelector("section#youtube");
    expect(section).toBeInTheDocument();
  });

  it("renders the channel name", async () => {
    const mod = await import("@/components/sections/YouTube");
    const Component = mod["YouTubeSection"];
    render(React.createElement(Component));
    expect(screen.getByText("KevinTrinhDev")).toBeInTheDocument();
  });

  it("renders the featured video section", async () => {
    const mod = await import("@/components/sections/YouTube");
    const Component = mod["YouTubeSection"];
    render(React.createElement(Component));
    expect(screen.getByText("Featured video")).toBeInTheDocument();
    expect(screen.getByText("Test Video")).toBeInTheDocument();
  });

  it("renders the view channel link", async () => {
    const mod = await import("@/components/sections/YouTube");
    const Component = mod["YouTubeSection"];
    render(React.createElement(Component));
    const link = screen.getByText("View channel");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://youtube.com/@test"
    );
  });

  it("renders most recent and most viewed cards", async () => {
    const mod = await import("@/components/sections/YouTube");
    const Component = mod["YouTubeSection"];
    render(React.createElement(Component));
    expect(screen.getByText("Most recent video")).toBeInTheDocument();
    expect(screen.getByText("Most viewed video")).toBeInTheDocument();
    expect(screen.getByText("Second Video")).toBeInTheDocument();
    expect(screen.getByText("Third Video")).toBeInTheDocument();
  });

  it("renders embed iframe for featured video", async () => {
    const mod = await import("@/components/sections/YouTube");
    const Component = mod["YouTubeSection"];
    const { container } = render(React.createElement(Component));
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/test123?rel=0&modestbranding=1"
    );
  });

  it("renders watch on YouTube link for featured video", async () => {
    const mod = await import("@/components/sections/YouTube");
    const Component = mod["YouTubeSection"];
    render(React.createElement(Component));
    const watchLink = screen.getByText("Watch on YouTube");
    expect(watchLink).toBeInTheDocument();
    expect(watchLink.closest("a")).toHaveAttribute(
      "href",
      "https://youtube.com/watch?v=test123"
    );
  });

  it("renders video stats for featured video", async () => {
    const mod = await import("@/components/sections/YouTube");
    const Component = mod["YouTubeSection"];
    render(React.createElement(Component));
    expect(screen.getByText("2025-01-15 · 1500 views")).toBeInTheDocument();
  });
});

/* ─── getYouTubeEmbedUrl unit tests ─── */
/* Covers lines 186-202 */
describe("getYouTubeEmbedUrl", () => {
  it("extracts id from youtu.be short URL", async () => {
    const mod = await import("@/components/sections/YouTube");
    const fn = (mod as any).getYouTubeEmbedUrl;
    const result = fn("https://youtu.be/abc123");
    expect(result).toBe(
      "https://www.youtube.com/embed/abc123?rel=0&modestbranding=1"
    );
  });

  it("extracts id from standard youtube.com URL", async () => {
    const mod = await import("@/components/sections/YouTube");
    const fn = (mod as any).getYouTubeEmbedUrl;
    const result = fn("https://www.youtube.com/watch?v=xyz789");
    expect(result).toBe(
      "https://www.youtube.com/embed/xyz789?rel=0&modestbranding=1"
    );
  });

  it("returns original URL when no video ID is found", async () => {
    const mod = await import("@/components/sections/YouTube");
    const fn = (mod as any).getYouTubeEmbedUrl;
    const result = fn("https://www.youtube.com/");
    expect(result).toBe("https://www.youtube.com/");
  });

  it("returns original URL on invalid URL (catch block)", async () => {
    const mod = await import("@/components/sections/YouTube");
    const fn = (mod as any).getYouTubeEmbedUrl;
    const result = fn("not-a-valid-url");
    expect(result).toBe("not-a-valid-url");
  });
});
