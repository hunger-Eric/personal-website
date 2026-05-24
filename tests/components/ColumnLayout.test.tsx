// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

describe("ColumnLayout", () => {
  it("renders children", async () => {
    const { ColumnLayout } = await import("@/components/ColumnLayout");
    render(
      React.createElement(ColumnLayout, null,
        React.createElement("div", { "data-testid": "content" }, "Main content")
      )
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByText("Main content")).toBeInTheDocument();
  });

  it("renders grid structure", async () => {
    const { ColumnLayout } = await import("@/components/ColumnLayout");
    const { container } = render(
      React.createElement(ColumnLayout, null,
        React.createElement("span", null, "content")
      )
    );
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid.className).toContain("grid-cols-1");
  });
});
