// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

describe("Callout", () => {
  it("renders callout with type", async () => {
    const { Callout } = await import("@/components/mdx/Callout");
    render(React.createElement(Callout, { type: "info", children: "Note content" }));
    expect(screen.getByText("Note content")).toBeInTheDocument();
  });

  it("renders callout with title", async () => {
    const { Callout } = await import("@/components/mdx/Callout");
    render(React.createElement(Callout, { type: "warning", title: "Warning Title", children: "Be careful" }));
    expect(screen.getByText("Warning Title")).toBeInTheDocument();
    expect(screen.getByText("Be careful")).toBeInTheDocument();
  });
});
