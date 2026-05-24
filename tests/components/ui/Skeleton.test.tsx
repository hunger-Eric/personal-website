// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

describe("Skeleton", () => {
  it("renders skeleton element", async () => {
    const { Skeleton } = await import("@/components/ui/Skeleton");
    const { container } = render(React.createElement(Skeleton));
    const div = container.querySelector("div");
    expect(div).toBeInTheDocument();
    expect(div.className).toContain("skeleton");
  });

  it("applies custom className", async () => {
    const { Skeleton } = await import("@/components/ui/Skeleton");
    const { container } = render(React.createElement(Skeleton, { className: "custom-class" }));
    const div = container.querySelector("div");
    expect(div.className).toContain("skeleton");
    expect(div.className).toContain("custom-class");
  });
});
