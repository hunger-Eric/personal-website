// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("ConditionalChrome", () => {
  it("renders children on non-bare routes", async () => {
    mockUsePathname.mockReturnValue("/");
    const { ConditionalChrome } = await import("@/components/ConditionalChrome");
    render(
      React.createElement(ConditionalChrome, null,
        React.createElement("div", { "data-testid": "chrome" }, "Chrome content")
      )
    );
    expect(screen.getByTestId("chrome")).toBeInTheDocument();
    expect(screen.getByText("Chrome content")).toBeInTheDocument();
  });

  it("returns null on /links route", async () => {
    mockUsePathname.mockReturnValue("/links");
    const { ConditionalChrome } = await import("@/components/ConditionalChrome");
    const { container } = render(
      React.createElement(ConditionalChrome, null,
        React.createElement("div", { "data-testid": "chrome" }, "Chrome content")
      )
    );
    expect(container.innerHTML).toBe("");
  });

  it("returns null on /admin route", async () => {
    mockUsePathname.mockReturnValue("/admin");
    const { ConditionalChrome } = await import("@/components/ConditionalChrome");
    const { container } = render(
      React.createElement(ConditionalChrome, null,
        React.createElement("span", null, "hidden")
      )
    );
    expect(container.innerHTML).toBe("");
  });
});
