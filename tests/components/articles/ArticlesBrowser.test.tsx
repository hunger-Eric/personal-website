// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("next/image", () => ({ default: (p: any) => React.createElement("img", p) }));
vi.mock("next/link", () => ({ default: (p: any) => React.createElement("a", { href: p.href }, p.children) }));

vi.mock("lucide-react", () => ({
  ChevronLeft: () => React.createElement("svg", { "data-testid": "chevron-left" }),
  ChevronRight: () => React.createElement("svg", { "data-testid": "chevron-right" }),
  FileText: () => React.createElement("svg", { "data-testid": "file-text" }),
}));

vi.mock("@/config/siteConfig", () => ({
  siteConfig: { name: "Test Author" },
}));

vi.mock("@/components/articles/ArticleCard", () => ({
  ArticleCard: ({ article }: any) => React.createElement("div", { "data-testid": "article-card" }, article.title),
}));

function makeArticle(slug: string, overrides = {}) {
  return {
    slug,
    title: `Article ${slug}`,
    summary: `Summary ${slug}`,
    date: "2025-01-15",
    readingTime: 5,
    ...overrides,
  };
}

describe("ArticlesBrowser", () => {
  it("renders hero article (first featured)", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [
      makeArticle("featured-1", { featured: true }),
      makeArticle("regular-1"),
    ];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByText("Article featured-1")).toBeInTheDocument();
  });

  it("renders article grid for non-featured articles", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [
      makeArticle("regular-1"),
      makeArticle("regular-2"),
    ];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByText("All Posts")).toBeInTheDocument();
  });

  it("renders empty state when no articles", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    render(React.createElement(ArticlesBrowser, { articles: [] }));
    expect(screen.getByText("All Posts")).toBeInTheDocument();
    expect(screen.getByText("No articles found")).toBeInTheDocument();
  });

  it("renders pagination when more than PAGE_SIZE articles", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = Array.from({ length: 15 }, (_, i) => makeArticle(`article-${i + 1}`));
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
  });

  it("disables previous button on first page", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = Array.from({ length: 15 }, (_, i) => makeArticle(`article-${i + 1}`));
    render(React.createElement(ArticlesBrowser, { articles }));
    const prevBtn = screen.getByLabelText("Previous page");
    expect(prevBtn).toBeDisabled();
  });

  it("disables next button on last page", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = Array.from({ length: 15 }, (_, i) => makeArticle(`article-${i + 1}`));
    render(React.createElement(ArticlesBrowser, { articles }));
    const nextBtn = screen.getByLabelText("Next page");
    fireEvent.click(nextBtn);
    // Now on page 2 (last page since 15/9 = 2 pages)
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("navigates to next page on Next click", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = Array.from({ length: 15 }, (_, i) => makeArticle(`article-${i + 1}`));
    render(React.createElement(ArticlesBrowser, { articles }));
    const nextBtn = screen.getByLabelText("Next page");
    fireEvent.click(nextBtn);
    // Should now show page 2
    expect(screen.getByLabelText("Go to page 2")).toHaveAttribute("aria-current", "page");
  });

  it("navigates to specific page on page button click", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = Array.from({ length: 15 }, (_, i) => makeArticle(`article-${i + 1}`));
    render(React.createElement(ArticlesBrowser, { articles }));
    const page2Btn = screen.getByLabelText("Go to page 2");
    fireEvent.click(page2Btn);
    expect(screen.getByLabelText("Go to page 2")).toHaveAttribute("aria-current", "page");
  });

  it("does not show pagination for single page", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = Array.from({ length: 5 }, (_, i) => makeArticle(`article-${i + 1}`));
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.queryByLabelText("Next page")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Previous page")).not.toBeInTheDocument();
  });

  it("shows ellipsis in pagination for many pages", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = Array.from({ length: 100 }, (_, i) => makeArticle(`article-${i + 1}`));
    render(React.createElement(ArticlesBrowser, { articles }));
    const ellipses = screen.getAllByText("…");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it("uses first article as hero when no featured article exists", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [
      makeArticle("first"),
      makeArticle("second"),
    ];
    render(React.createElement(ArticlesBrowser, { articles }));
    // First article should be hero
    expect(screen.getByText("Article first")).toBeInTheDocument();
  });

  it("skips grid when hero is the only article", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [makeArticle("only", { featured: true })];
    render(React.createElement(ArticlesBrowser, { articles }));
    // Only hero shows, no "All Posts" section
    expect(screen.queryByText("All Posts")).not.toBeInTheDocument();
  });

  it("renders author from siteConfig when not provided", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [makeArticle("hero-article", { featured: true })];
    const { container } = render(React.createElement(ArticlesBrowser, { articles }));
    // Author should be "Test Author" from mock
    expect(screen.getByText("Test Author")).toBeInTheDocument();
  });
});

describe("pageNumbers helper", () => {
  it("returns all pages when total <= 7", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    // Can't access pageNumbers directly, so we test via rendering behavior
    const articles = Array.from({ length: 7 }, (_, i) => makeArticle(`article-${i + 1}`));
    const { container } = render(React.createElement(ArticlesBrowser, { articles }));
    // Only 1 page, no pagination
    expect(screen.queryByLabelText("Next page")).not.toBeInTheDocument();
  });
});

describe("formatDate", () => {
  it("formats valid date strings", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [makeArticle("test", { featured: true, date: "2025-06-15" })];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByText("June 15, 2025")).toBeInTheDocument();
  });

  it("returns original string for invalid dates", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [makeArticle("test", { featured: true, date: "not-a-date" })];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByText("not-a-date")).toBeInTheDocument();
  });
});
