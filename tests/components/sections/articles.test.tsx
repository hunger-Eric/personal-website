// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("@/config/articles", () => ({
  blogPosts: [
    { id: "1", slug: "test-article", title: "Test Article", summary: "A summary", date: "2025-01-15", featured: true, readTime: "5 min", category: "tech" },
    { id: "2", slug: "second-article", title: "Second Article", summary: "Another summary", date: "2025-01-10", readTime: "3 min", category: "guide" },
  ]
}));
vi.mock("lucide-react", () => ({
  SquareArrowOutUpRight: () => React.createElement("svg"),
  BookOpenText: () => React.createElement("svg"),
  PenLine: () => React.createElement("svg"),
  NotebookPen: () => React.createElement("svg"),
  FileText: () => React.createElement("svg"),
  CalendarDays: () => React.createElement("svg"),
  Clock3: () => React.createElement("svg"),
}));
vi.mock("next/image", () => ({ default: (p) => React.createElement("img", p) }));
vi.mock("next/link", () => ({ default: (p) => React.createElement("a", { href: p.href, children: p.children }) }));

describe("ArticlesSection", () => {
  it("renders without crashing", async () => {
    const mod = await import("@/components/sections/Articles");
    const Component = mod["ArticlesSection"];
    if (typeof Component === "function") {
      const { container } = render(React.createElement(Component));
      expect(container).toBeTruthy();
    }
  });
});
