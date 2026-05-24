// @vitest-environment jsdom
// Edge-case tests for ThemeToggle: allowToggle=false paths
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => {
  const Icon = (props: any) => React.createElement("svg", { ...props, "data-testid": "lucide-icon" });
  return { Sun: Icon, Moon: Icon, Monitor: Icon };
});

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "dark",
    resolvedTheme: "dark",
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
  }),
}));

describe("ThemeToggle with allowToggle disabled", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns null when allowToggle is false", async () => {
    vi.doMock("@/config/theme", () => ({
      themeConfig: { allowToggle: false, respectSystemPreference: true, defaultMode: "dark" },
    }));
    const { ThemeToggle } = await import("@/components/ThemeToggle");
    const { container } = render(React.createElement(ThemeToggle));
    expect(container.querySelector("button")).not.toBeInTheDocument();
  });
});

describe("ThemeDropdown with allowToggle disabled", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns null when allowToggle is false", async () => {
    vi.doMock("@/config/theme", () => ({
      themeConfig: { allowToggle: false, respectSystemPreference: true, defaultMode: "dark" },
    }));
    const { ThemeDropdown } = await import("@/components/ThemeToggle");
    const { container } = render(React.createElement(ThemeDropdown));
    expect(container.querySelector("select")).not.toBeInTheDocument();
  });
});
