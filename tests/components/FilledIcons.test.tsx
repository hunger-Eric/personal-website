// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

describe("FilledIcons", () => {
  it("FilledGithub renders an SVG with correct viewBox and aria-hidden", async () => {
    const { FilledGithub } = await import("@/components/FilledIcons");
    const { container } = render(React.createElement(FilledGithub));
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("FilledGithub accepts className", async () => {
    const { FilledGithub } = await import("@/components/FilledIcons");
    const { container } = render(React.createElement(FilledGithub, { className: "w-5 h-5" }));
    expect(container.querySelector("svg")).toHaveClass("w-5 h-5");
  });

  it("FilledGlobe renders an SVG with a path", async () => {
    const { FilledGlobe } = await import("@/components/FilledIcons");
    const { container } = render(React.createElement(FilledGlobe));
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(container.querySelector("path")).toBeInTheDocument();
  });

  it("FilledGlobe accepts className", async () => {
    const { FilledGlobe } = await import("@/components/FilledIcons");
    const { container } = render(React.createElement(FilledGlobe, { className: "h-4 w-4" }));
    expect(container.querySelector("svg")).toHaveClass("h-4 w-4");
  });

  it("FilledFileText renders an SVG with correct attributes", async () => {
    const { FilledFileText } = await import("@/components/FilledIcons");
    const { container } = render(React.createElement(FilledFileText));
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("FilledDownload renders an SVG with a path", async () => {
    const { FilledDownload } = await import("@/components/FilledIcons");
    const { container } = render(React.createElement(FilledDownload));
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("path")).toBeInTheDocument();
  });

  it("FilledPlay renders an SVG", async () => {
    const { FilledPlay } = await import("@/components/FilledIcons");
    const { container } = render(React.createElement(FilledPlay));
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("FilledMapPin renders an SVG", async () => {
    const { FilledMapPin } = await import("@/components/FilledIcons");
    const { container } = render(React.createElement(FilledMapPin));
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("FilledArrowUpRight renders an SVG", async () => {
    const { FilledArrowUpRight } = await import("@/components/FilledIcons");
    const { container } = render(React.createElement(FilledArrowUpRight));
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("all filled icon components render without error", async () => {
    const mod = await import("@/components/FilledIcons");
    for (const [name, Component] of Object.entries(mod)) {
      if (typeof Component === "function") {
        const { container } = render(React.createElement(Component));
        expect(container.querySelector("svg")).toBeInTheDocument();
      }
    }
  });
});
