// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/config/theme", () => ({
  themeConfig: { allowToggle: true, respectSystemPreference: true, defaultMode: "dark" },
  ThemeMode: "light" || "dark" || "system",
  default: { allowToggle: true, respectSystemPreference: true, defaultMode: "dark" },
}));

describe("ThemeProvider", () => {
  it("renders children", async () => {
    const { ThemeProvider } = await import("@/components/ThemeProvider");
    render(
      React.createElement(ThemeProvider, null,
        React.createElement("div", { "data-testid": "child" }, "Hello")
      )
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
