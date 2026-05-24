// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

describe("XIcon", () => {
  it("renders an SVG with correct viewBox and aria-hidden", async () => {
    const { XIcon } = await import("@/components/icons/XIcon");
    const { container } = render(React.createElement(XIcon));
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("renders a path element", async () => {
    const { XIcon } = await import("@/components/icons/XIcon");
    const { container } = render(React.createElement(XIcon));
    expect(container.querySelector("path")).toBeInTheDocument();
  });

  it("accepts className and applies it", async () => {
    const { XIcon } = await import("@/components/icons/XIcon");
    const { container } = render(React.createElement(XIcon, { className: "w-5 h-5 text-white" }));
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("w-5 h-5 text-white");
  });

  it("renders with default className when none provided", async () => {
    const { XIcon } = await import("@/components/icons/XIcon");
    const { container } = render(React.createElement(XIcon));
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
