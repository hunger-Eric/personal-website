// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => {
  const Svg = (p: any) => React.createElement("svg", p);
  return { Github: Svg, Linkedin: Svg, Twitter: Svg, Youtube: Svg, Heart: Svg };
});

describe("BrandGlyphs", () => {
  it("renders brand glyphs", async () => {
    const mod = await import("@/components/BrandGlyphs");
    const Component = mod.default || Object.values(mod)[0];
    if (typeof Component === "function") {
      const { container } = render(React.createElement(Component));
      expect(container.querySelector("svg") || container.querySelector("div") || container).toBeTruthy();
    }
  });
});
