// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

describe("BrandGlyphs", () => {
  it("GithubGlyph renders an SVG with the shared token-driven shell", async () => {
    const { GithubGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(GithubGlyph));
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("rect[fill='currentColor']")).toBeInTheDocument();
    expect(container.querySelector("path[fill='currentColor']")).toBeInTheDocument();
  });

  it("GithubGlyph accepts className and applies it", async () => {
    const { GithubGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(GithubGlyph, { className: "w-5 h-5" }));
    expect(container.querySelector("svg")).toHaveClass("w-5 h-5");
  });

  it("LinkedInGlyph renders platform geometry without owning color", async () => {
    const { LinkedInGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(LinkedInGlyph));
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("rect[rx='3']")).toBeInTheDocument();
    expect(container.querySelector("path[fill='currentColor']")).toBeInTheDocument();
  });

  it("YoutubeGlyph renders the play geometry", async () => {
    const { YoutubeGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(YoutubeGlyph));
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("path[fill='currentColor']")).toBeInTheDocument();
  });

  it("InstagramGlyph renders camera geometry", async () => {
    const { InstagramGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(InstagramGlyph));
    expect(container.querySelector("rect[rx='6']")).toBeInTheDocument();
    expect(container.querySelector("circle[stroke='currentColor']")).toBeInTheDocument();
    expect(container.querySelectorAll("circle").length).toBe(2);
  });

  it("MediumGlyph renders the three ellipse mark", async () => {
    const { MediumGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(MediumGlyph));
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("ellipse").length).toBe(3);
  });

  it("TikTokGlyph keeps layered paths for the mark", async () => {
    const { TikTokGlyph } = await import("@/components/BrandGlyphs");
    const { container } = render(React.createElement(TikTokGlyph));
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("path").length).toBe(3);
  });

  it("all glyph components render without error", async () => {
    const mod = await import("@/components/BrandGlyphs");
    for (const [name, Component] of Object.entries(mod)) {
      if (typeof Component === "function" && name !== "default") {
        const { container } = render(React.createElement(Component));
        expect(container.querySelector("svg")).toBeInTheDocument();
      }
    }
  });
});
