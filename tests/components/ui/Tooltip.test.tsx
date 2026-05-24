// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

describe("Tooltip", () => {
  it("renders children", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    render(
      React.createElement(Tooltip, { content: "Tooltip content" },
        React.createElement("button", null, "Hover me")
      )
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("does not show tooltip content initially", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    render(
      React.createElement(Tooltip, { content: "Tooltip content" },
        React.createElement("button", null, "Hover me")
      )
    );
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
  });

  it("shows tooltip on hover", async () => {
    const { Tooltip } = await import("@/components/ui/Tooltip");
    const { container } = render(
      React.createElement(Tooltip, { content: "Tooltip content" },
        React.createElement("button", null, "Hover me")
      )
    );
    const trigger = container.querySelector("div");
    expect(trigger).toBeInTheDocument();
    fireEvent.mouseEnter(trigger);
    await vi.waitFor(() => {
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
