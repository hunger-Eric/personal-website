// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => {
  const Icon = (props) => React.createElement("svg", { ...props, "data-testid": "lucide-icon" });
  return { Sun: Icon, Moon: Icon, Monitor: Icon };
});

vi.mock("@/config/theme", () => ({
  themeConfig: { allowToggle: true, respectSystemPreference: true, defaultMode: "dark" },
  default: { allowToggle: true, respectSystemPreference: true, defaultMode: "dark" },
}));

const mockToggleTheme = vi.fn();
const mockSetTheme = vi.fn();

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "dark",
    resolvedTheme: "dark",
    toggleTheme: mockToggleTheme,
    setTheme: mockSetTheme,
  }),
}));

describe("ThemeToggle", () => {
  it("renders toggle button", async () => {
    const { ThemeToggle } = await import("@/components/ThemeToggle");
    const { container } = render(React.createElement(ThemeToggle));
    const btn = container.querySelector("button");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-label");
  });

  it("calls toggleTheme on click", async () => {
    const { ThemeToggle } = await import("@/components/ThemeToggle");
    render(React.createElement(ThemeToggle));
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(mockToggleTheme).toHaveBeenCalledOnce();
  });
});
