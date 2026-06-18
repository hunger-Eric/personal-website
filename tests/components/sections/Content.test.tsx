// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ContentSection } from "@/components/sections/Content";

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

vi.mock("lucide-react", () => ({
  ArrowRight: () => <svg data-testid="icon-arrow-right" />,
  ArrowUpRight: () => <svg data-testid="icon-arrow-up-right" />,
  Play: () => <svg data-testid="icon-play" />,
}));

vi.mock("@/components/BrandGlyphs", () => ({
  InstagramGlyph: () => <svg data-testid="icon-instagram" />,
  TikTokGlyph: () => <svg data-testid="icon-tiktok" />,
  YoutubeGlyph: () => <svg data-testid="icon-youtube" />,
}));

vi.mock("@/components/icons/XIcon", () => ({
  XIcon: () => <svg data-testid="icon-x" />,
}));

describe("ContentSection", () => {
  it("renders the content preview with centralized copy", () => {
    render(<ContentSection />);

    expect(screen.getByText("Content & Socials")).toBeInTheDocument();
    expect(screen.getByText("Where to follow me")).toBeInTheDocument();
    expect(screen.getByText("Recent on YouTube")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "/content"
    );
  });

  it("renders the featured YouTube card and platform links", () => {
    const { container } = render(<ContentSection />);

    const thumbnail = container.querySelector("img");
    expect(thumbnail).toHaveAttribute(
      "src",
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    );
    expect(
      container.querySelector('a[href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"]')
    ).toBeTruthy();
    expect(container.querySelector('a[href="https://tiktok.com/@test"]')).toBeTruthy();
    expect(container.querySelector('a[href="https://instagram.com/@test"]')).toBeTruthy();
    expect(container.querySelector('a[href="https://x.com/@test"]')).toBeTruthy();
  });

  it("uses fixed platform glyphs instead of dynamic lucide lookup", () => {
    render(<ContentSection />);

    expect(screen.getByTestId("icon-youtube")).toBeInTheDocument();
    expect(screen.getByTestId("icon-tiktok")).toBeInTheDocument();
    expect(screen.getByTestId("icon-instagram")).toBeInTheDocument();
    expect(screen.getByTestId("icon-x")).toBeInTheDocument();
  });

  it("uses system surface classes instead of old template residue", () => {
    const { container } = render(<ContentSection />);
    const html = container.innerHTML;
    const oldLargeRadius = ["rounded", "2xl"].join("-");
    const oldTileRadius = ["rounded", "xl"].join("-");
    const oldBg = ["bg", "white/5"].join("-");
    const oldBorder = ["border", "white/10"].join("-");

    expect(html).toContain("rounded-card");
    expect(html).toContain("bg-surface-paper-elevated");
    expect(html).not.toContain(oldLargeRadius);
    expect(html).not.toContain(oldTileRadius);
    expect(html).not.toContain(oldBg);
    expect(html).not.toContain(oldBorder);
  });
});
