// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));
vi.mock("next/link", () => ({
  default: (p: any) => React.createElement("a", { href: p.href }, p.children),
}));

vi.mock("lucide-react", () => {
  const Lucide: Record<string, any> = {
    Play: () => React.createElement("svg", { "data-testid": "play-icon" }),
    ArrowUpRight: () => React.createElement("svg", { "data-testid": "arrow-up-right-icon" }),
    Music2: () => React.createElement("svg", { "data-testid": "music-icon" }),
    Instagram: () => React.createElement("svg", { "data-testid": "instagram-icon" }),
  };
  return Lucide;
});

vi.mock("@/components/icons/XIcon", () => ({
  XIcon: () => React.createElement("svg", { "data-testid": "x-icon" }),
}));

const mockFeaturedContent = { youtubeVideoId: "dQw4w9WgXcQ" };
let mockSocialsList: any[] = [];

vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    name: "Test Author",
    get socialsList() { return mockSocialsList; },
    get featuredContent() { return mockFeaturedContent; },
  },
}));

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ContentSection", () => {
  beforeEach(() => {
    mockFeaturedContent.youtubeVideoId = "dQw4w9WgXcQ";
    mockSocialsList = [
      { key: "youtube", href: "https://youtube.com/@test" },
      { key: "tiktok", href: "https://tiktok.com/@test" },
      { key: "instagram", href: "https://instagram.com/test" },
      { key: "x", href: "https://x.com/test" },
    ];
  });

  it("renders section heading", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    render(React.createElement(ContentSection));
    expect(screen.getByText("~/Content")).toBeInTheDocument();
  });

  it("renders video card with thumbnail when youtubeVideoId is set", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    render(React.createElement(ContentSection));
    const img = document.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("src")).toContain("img.youtube.com");
  });

  it("renders play overlay without thumbnail when no videoId", async () => {
    mockFeaturedContent.youtubeVideoId = "";
    const { ContentSection } = await import("@/components/sections/Content");
    render(React.createElement(ContentSection));
    expect(document.querySelector("img")).not.toBeInTheDocument();
  });

  it("renders YouTube badge", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    render(React.createElement(ContentSection));
    expect(screen.getByText("YouTube")).toBeInTheDocument();
  });

  it("renders all 3 small tiles when all URLs are valid", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    render(React.createElement(ContentSection));
    expect(screen.getByText("TikTok")).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.getByText("X / Twitter")).toBeInTheDocument();
  });

  it("skips tile when urlForKey returns null (no matching social)", async () => {
    mockSocialsList = [{ key: "youtube", href: "https://youtube.com/@test" }];
    const { ContentSection } = await import("@/components/sections/Content");
    render(React.createElement(ContentSection));
    expect(screen.queryByText("TikTok")).not.toBeInTheDocument();
  });

  it("skips tile when href is 'null' string", async () => {
    mockSocialsList = [
      { key: "youtube", href: "https://youtube.com/@test" },
      { key: "tiktok", href: "null" },
    ];
    const { ContentSection } = await import("@/components/sections/Content");
    render(React.createElement(ContentSection));
    expect(screen.queryByText("TikTok")).not.toBeInTheDocument();
  });

  it("handles copy: prefix href as invalid (returns null)", async () => {
    mockSocialsList = [
      { key: "youtube", href: "https://youtube.com/@test" },
      { key: "tiktok", href: "copy:some-path" },
    ];
    const { ContentSection } = await import("@/components/sections/Content");
    render(React.createElement(ContentSection));
    expect(screen.queryByText("TikTok")).not.toBeInTheDocument();
  });

  it("renders XIcon for 'x' key", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    const { container } = render(React.createElement(ContentSection));
    expect(container.querySelector('[data-testid="x-icon"]')).toBeInTheDocument();
  });

  it("renders correct icons for tiles", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    const { container } = render(React.createElement(ContentSection));
    expect(container.querySelector('[data-testid="music-icon"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="instagram-icon"]')).toBeInTheDocument();
  });

  it("renders 'Watch my latest video' text", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    render(React.createElement(ContentSection));
    expect(screen.getByText("Watch my latest video")).toBeInTheDocument();
  });

  it("renders play icon on video overlay", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    const { container } = render(React.createElement(ContentSection));
    expect(container.querySelector('[data-testid="play-icon"]')).toBeInTheDocument();
  });

  it("renders tile blurbs", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    render(React.createElement(ContentSection));
    expect(screen.getByText("Short clips on coding + college life.")).toBeInTheDocument();
    expect(screen.getByText("Photos & stories from projects.")).toBeInTheDocument();
    expect(screen.getByText("Build logs, hot takes, threads.")).toBeInTheDocument();
  });
});
