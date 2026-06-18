// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("fuse.js", () => {
  const MockFuse = function() {
    this.search = function(q) {
      if (!q) return [];
      return [{ item: { id: "found", title: "Found Result", category: "page", href: "/found" } }];
    };
    return this;
  };
  return { default: MockFuse };
});

vi.mock("lucide-react", () => {
  const Icon = (props) => React.createElement("svg", { ...props, "data-testid": "lucide-icon" });
  return {
    Search: Icon, Home: Icon, User: Icon, Briefcase: Icon,
    FolderOpen: Icon, FileText: Icon, Mail: Icon,
    Moon: Icon, Sun: Icon, ExternalLink: Icon, ArrowRight: Icon, Command: Icon,
  };
});

const mockToggleTheme = vi.fn();
vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "dark",
    resolvedTheme: "dark",
    toggleTheme: mockToggleTheme,
    setTheme: vi.fn(),
  }),
}));

vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({
    locale: "en",
    t: {},
    setLocale: vi.fn(),
    toggleLocale: vi.fn(),
  }),
}));

describe("CommandPalette", () => {
  it("renders trigger button when closed", async () => {
    const { CommandPalette } = await import("@/components/CommandPalette");
    render(React.createElement(CommandPalette));
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Search...")).toBeInTheDocument();
  });

  it("opens palette when trigger button is clicked", async () => {
    const { CommandPalette } = await import("@/components/CommandPalette");
    render(React.createElement(CommandPalette));
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByPlaceholderText("Search pages, cases, articles...")).toBeInTheDocument();
  });

  it("renders with projects and articles", async () => {
    const { CommandPalette } = await import("@/components/CommandPalette");
    const projects = [{ id: "p1", name: "Test Project", summary: "A project" }];
    const articles = [{ slug: "a1", title: "Test Article", summary: "An article" }];
    render(React.createElement(CommandPalette, { projects, articles }));
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByPlaceholderText("Search pages, cases, articles...")).toBeInTheDocument();
  });
});
