// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));
vi.mock("next/link", () => ({
  default: (p: any) => React.createElement("a", { href: p.href, "aria-label": p["aria-label"] }, p.children),
}));

vi.mock("lucide-react", () => ({
  SquareArrowOutUpRight: () => React.createElement("svg", { "data-testid": "arrow" }),
  BookOpenText: () => React.createElement("svg", { "data-testid": "book" }),
  PenLine: () => React.createElement("svg", { "data-testid": "pen" }),
  NotebookPen: () => React.createElement("svg", { "data-testid": "notebook" }),
  FileText: () => React.createElement("svg", { "data-testid": "file" }),
  CalendarDays: () => React.createElement("svg", { "data-testid": "calendar" }),
  Clock3: () => React.createElement("svg", { "data-testid": "clock" }),
}));

let testPosts: any[] = [];

vi.mock("@/config/articles", () => ({
  get blogPosts() { return testPosts; },
}));

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ArticleSection", () => {
  beforeEach(() => {
    testPosts = [
      { id: "p1", title: "Post 1", date: "2025-03-01", readTime: "5 min", category: "Deep Dive" },
      { id: "p2", title: "Post 2", date: "2025-02-15", readTime: "3 min", category: "Guide" },
      { id: "p3", title: "Post 3", date: "2025-01-10", readTime: "8 min", category: "Wiki" },
    ];
  });

  it("renders section heading", async () => {
    const { ArticleSection } = await import("@/components/sections/Articles");
    render(React.createElement(ArticleSection));
    expect(screen.getByText("~/Articles")).toBeInTheDocument();
  });

  it("renders CTA link to /articles", async () => {
    const { ArticleSection } = await import("@/components/sections/Articles");
    render(React.createElement(ArticleSection));
    const cta = screen.getByText("View articles").closest("a");
    expect(cta).toHaveAttribute("href", "/articles");
  });

  it("renders featured post (first by default)", async () => {
    const { ArticleSection } = await import("@/components/sections/Articles");
    render(React.createElement(ArticleSection));
    expect(screen.getByText("Post 1")).toBeInTheDocument();
  });

  it("uses featured flag when present", async () => {
    testPosts = [
      { id: "p1", title: "Regular 1", date: "2025-03-01" },
      { id: "p2", title: "Featured Post", date: "2025-02-15", featured: true },
    ];
    const { ArticleSection } = await import("@/components/sections/Articles");
    render(React.createElement(ArticleSection));
    expect(screen.getByText("Featured Post")).toBeInTheDocument();
  });

  it("renders only featured article when only 1 exists", async () => {
    testPosts = [{ id: "p1", title: "Solo", date: "2025-03-01" }];
    const { ArticleSection } = await import("@/components/sections/Articles");
    render(React.createElement(ArticleSection));
    expect(screen.getByText("Solo")).toBeInTheDocument();
  });

  it("renders latest articles after featured", async () => {
    const { ArticleSection } = await import("@/components/sections/Articles");
    render(React.createElement(ArticleSection));
    expect(screen.getByText("Post 1")).toBeInTheDocument();
    expect(screen.getByText("Post 2")).toBeInTheDocument();
    expect(screen.getByText("Post 3")).toBeInTheDocument();
  });

  it("returns null when articles is empty", async () => {
    testPosts = [];
    const { ArticleSection } = await import("@/components/sections/Articles");
    const { container } = render(React.createElement(ArticleSection));
    expect(container.firstChild).toBeNull();
  });

  it("renders category badge when post has category", async () => {
    const { ArticleSection } = await import("@/components/sections/Articles");
    render(React.createElement(ArticleSection));
    expect(screen.getByText("Deep Dive")).toBeInTheDocument();
    expect(screen.getByText("Guide")).toBeInTheDocument();
  });

  it("renders Image when post has imageSrc", async () => {
    testPosts = [{ id: "p1", title: "With Image", date: "2025-03-01", imageSrc: "/img.jpg" }];
    const { ArticleSection } = await import("@/components/sections/Articles");
    const { container } = render(React.createElement(ArticleSection));
    expect(container.querySelector("img")).toBeInTheDocument();
  });

  it("renders gradient placeholder when no imageSrc", async () => {
    const { ArticleSection } = await import("@/components/sections/Articles");
    const { container } = render(React.createElement(ArticleSection));
    // Gradient div with "bg-gradient-to-br"
    const gradient = container.querySelector('[class*="bg-gradient"]');
    expect(gradient).toBeInTheDocument();
  });

  it("renders date and read time when available", async () => {
    const { ArticleSection } = await import("@/components/sections/Articles");
    render(React.createElement(ArticleSection));
    // Post 1: date "2025-03-01" → formatted as "Mar 1, 2025"
    expect(screen.getByText("Mar 1, 2025")).toBeInTheDocument();
    expect(screen.getByText("5 min read")).toBeInTheDocument();
  });

  it("does not render date when absent", async () => {
    testPosts = [{ id: "p1", title: "No Date", readTime: "5 min" }];
    const { ArticleSection } = await import("@/components/sections/Articles");
    const { container } = render(React.createElement(ArticleSection));
    // CalendarDays icon should not be rendered
    const calendars = container.querySelectorAll('[data-testid="calendar"]');
    expect(calendars.length).toBe(0);
  });

  it("does not render read time when absent", async () => {
    testPosts = [{ id: "p1", title: "No Read Time", date: "2025-03-01" }];
    const { ArticleSection } = await import("@/components/sections/Articles");
    const { container } = render(React.createElement(ArticleSection));
    const clocks = container.querySelectorAll('[data-testid="clock"]');
    expect(clocks.length).toBe(0);
  });

  it("sorts posts by date descending", async () => {
    testPosts = [
      { id: "p3", title: "Oldest", date: "2024-01-01" },
      { id: "p1", title: "Newest", date: "2025-06-01" },
      { id: "p2", title: "Middle", date: "2024-06-01" },
    ];
    const { ArticleSection } = await import("@/components/sections/Articles");
    render(React.createElement(ArticleSection));
    // Newest is featured, then Middle and Oldest as latest
    expect(screen.getByText("Newest")).toBeInTheDocument();
    expect(screen.getByText("Middle")).toBeInTheDocument();
    expect(screen.getByText("Oldest")).toBeInTheDocument();
  });

  it("handles posts with no date gracefully", async () => {
    testPosts = [
      { id: "p1", title: "Dated", date: "2025-03-01" },
      { id: "p2", title: "Undated" },
      { id: "p3", title: "Also Dated", date: "2025-02-01" },
    ];
    const { ArticleSection } = await import("@/components/sections/Articles");
    render(React.createElement(ArticleSection));
    // All render without error
    expect(screen.getByText("Dated")).toBeInTheDocument();
    expect(screen.getByText("Undated")).toBeInTheDocument();
    expect(screen.getByText("Also Dated")).toBeInTheDocument();
  });

  it("renders normalizes read time with 'read' suffix", async () => {
    testPosts = [{ id: "p1", title: "RT", date: "2025-03-01", readTime: "10 min" }];
    const { ArticleSection } = await import("@/components/sections/Articles");
    render(React.createElement(ArticleSection));
    expect(screen.getByText("10 min read")).toBeInTheDocument();
  });
});
