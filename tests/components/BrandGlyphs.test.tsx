// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => {
  const Svg = (p: any) => React.createElement("svg", p);
  return { Github: Svg, Linkedin: Svg, Twitter: Svg, Youtube: Svg, Heart: Svg };
});

describe("BrandGlyphs", () => {
  it("GithubGlyph renders an SVG with correct viewBox and fill", async () => {
    const { GithubGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(GithubGlyph));
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("rect[fill='#181717']")).toBeInTheDocument();
  });

  it("GithubGlyph accepts className and applies it", async () => {
    const { GithubGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(GithubGlyph, { className: "w-5 h-5" }));
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("w-5 h-5");
  });

  it("LinkedInGlyph renders an SVG with correct fill", async () => {
    const { LinkedInGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(LinkedInGlyph));
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(container.querySelector("rect[fill='#0A66C2']")).toBeInTheDocument();
  });

  it("LinkedInGlyph accepts className", async () => {
    const { LinkedInGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(LinkedInGlyph, { className: "h-4 w-4" }));
    expect(container.querySelector("svg")).toHaveClass("h-4 w-4");
  });

  it("YoutubeGlyph renders an SVG with red fill", async () => {
    const { YoutubeGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(YoutubeGlyph));
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(container.querySelector("rect[fill='#FF0000']")).toBeInTheDocument();
    expect(container.querySelector("path[fill='#ffffff']")).toBeInTheDocument();
  });

  it("InstagramGlyph renders an SVG with gradient defs", async () => {
    const { InstagramGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(InstagramGlyph));
    expect(container.querySelector("linearGradient")).toBeInTheDocument();
    expect(container.querySelector("rect[fill='url(#ig-grad-shared)']")).toBeInTheDocument();
    expect(container.querySelector("circle")).toBeInTheDocument();
  });

  it("MediumGlyph renders an SVG with ellipses", async () => {
    const { MediumGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(MediumGlyph));
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("ellipse").length).toBe(3);
    expect(container.querySelector("rect[fill='#000000']")).toBeInTheDocument();
  });

  it("TikTokGlyph renders an SVG with multiple paths", async () => {
    const { TikTokGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(TikTokGlyph));
    expect(container.querySelector("svg")).toBeInTheDocument();
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThanOrEqual(3);
  });

  it("all glyph components render without error", async () => {
    const mod = await import("@/components/BrandGlyphs");
    for (const [name, Component] of Object.entries(mod)) {
      if (typeof Component === "function") {
        const { container } = render(React.createElement(Component));
        expect(container.querySelector("svg")).toBeInTheDocument();
      }
    }
  });
});
