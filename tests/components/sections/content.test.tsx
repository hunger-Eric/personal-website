// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

// Mock siteConfig with socialsList entries for all SMALL_TILES keys plus youtube
vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    featuredContent: { youtubeVideoId: "dQw4w9WgXcQ" },
    socialsList: [
      { key: "tiktok", href: "https://tiktok.com/@test" },
      { key: "instagram", href: "https://instagram.com/@test" },
      { key: "x", href: "https://x.com/@test" },
      { key: "youtube", href: "https://youtube.com/@test" },
    ],
  },
}));

// Mock lucide-react to export "Instagram" as undefined — so the instagram
// tile's resolveIcon call hits the property access (returns undefined, falsy)
// and falls through to the ArrowUpRight fallback at line 50 in Content.tsx.
vi.mock("lucide-react", () => {
  const Music2 = (p: { className?: string }) =>
    React.createElement("svg", { ...p, "data-testid": "icon-music2" });
  const Play = (p: { className?: string }) =>
    React.createElement("svg", { ...p, "data-testid": "icon-play" });
  const ArrowUpRight = (p: { className?: string }) =>
    React.createElement("svg", { ...p, "data-testid": "icon-arrow-up-right" });
  // Must explicitly list Instagram as undefined — vitest validates mock
  // exports and throws on unknown property access otherwise.
  return { Music2, Play, ArrowUpRight, Instagram: undefined };
});

vi.mock("@/components/icons/XIcon", () => ({
  XIcon: (p: { className?: string }) =>
    React.createElement("svg", { ...p, "data-testid": "icon-x" }),
}));

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ContentSection", () => {
  it("renders without crashing", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    const { container } = render(React.createElement(ContentSection));
    expect(container).toBeTruthy();
  });

  it("renders section heading", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    render(React.createElement(ContentSection));
    expect(screen.getByText("~/Content")).toBeTruthy();
    expect(screen.getByText("Where I post stuff.")).toBeTruthy();
  });

  it("renders featured video card with thumbnail", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    const { container } = render(React.createElement(ContentSection));
    // Video thumbnail should be present
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    );
    // Featured card link should wrap the YouTube link
    const videoLink = container.querySelector('a[href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"]');
    expect(videoLink).toBeTruthy();
  });

  it("renders all three small tiles", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    render(React.createElement(ContentSection));
    expect(screen.getByText("TikTok")).toBeTruthy();
    expect(screen.getByText("Instagram")).toBeTruthy();
    expect(screen.getByText("X / Twitter")).toBeTruthy();
  });

  it("renders TikTok tile with Music2 icon (known lucide key)", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    const { container } = render(React.createElement(ContentSection));
    const tiktokLinks = container.querySelectorAll('a[href="https://tiktok.com/@test"]');
    expect(tiktokLinks.length).toBe(1);
    // Music2 icon should be rendered inside the tiktok tile
    const musicIcon = container.querySelector('[data-testid="icon-music2"]');
    expect(musicIcon).toBeTruthy();
  });

  it("renders X/Twitter tile with XIcon (special-case iconKey='x')", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    const { container } = render(React.createElement(ContentSection));
    const xIcon = container.querySelector('[data-testid="icon-x"]');
    expect(xIcon).toBeTruthy();
  });

  it("renders Instagram tile with ArrowUpRight fallback (line 50 — unknown iconKey)", async () => {
    // "Instagram" is NOT exported in the lucide-react mock, so resolveIcon
    // falls through to the ArrowUpRight return at line 50.
    const { ContentSection } = await import("@/components/sections/Content");
    const { container } = render(React.createElement(ContentSection));
    const fallbackIcons = container.querySelectorAll('[data-testid="icon-arrow-up-right"]');
    // ArrowUpRight is used both as the featured card indicator AND as the
    // fallback for the Instagram tile. Expect at least 2.
    expect(fallbackIcons.length).toBeGreaterThanOrEqual(2);
  });

  it("renders featured video card with Play overlay icon and YouTube badge", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    const { container } = render(React.createElement(ContentSection));
    const playIcons = container.querySelectorAll('[data-testid="icon-play"]');
    expect(playIcons.length).toBeGreaterThanOrEqual(1);
    expect(container.textContent).toContain("YouTube");
    expect(container.textContent).toContain("Watch my latest video");
  });

  it("opens external links with noreferrer noopener", async () => {
    const { ContentSection } = await import("@/components/sections/Content");
    const { container } = render(React.createElement(ContentSection));
    const links = container.querySelectorAll('a[target="_blank"]');
    links.forEach((link) => {
      expect(link.getAttribute("rel")).toContain("noreferrer");
      expect(link.getAttribute("rel")).toContain("noopener");
    });
  });
});
