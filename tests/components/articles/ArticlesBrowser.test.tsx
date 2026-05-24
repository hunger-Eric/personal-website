// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("next/image", () => ({ default: (p) => React.createElement("img", p) }));
vi.mock("next/link", () => ({ default: (p) => React.createElement("a", { href: p.href, children: p.children }) }));
vi.mock("lucide-react", () => ({
  ChevronLeft: () => React.createElement("svg"),
  ChevronRight: () => React.createElement("svg"),
  FileText: () => React.createElement("svg"),
}));
vi.mock("@/config/siteConfig", () => ({
  siteConfig: { name: "Test Author" }
}));

describe("ArticlesBrowser", () => {
  it("renders with articles", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [
      { slug: "article-1", title: "Article 1", summary: "Summary 1", date: "2025-01-15", readingTime: 5, featured: true, imageSrc: "/img1.jpg" },
      { slug: "article-2", title: "Article 2", summary: "Summary 2", date: "2025-01-10", readingTime: 3, imageSrc: "/img2.jpg" },
    ];
    const { container } = render(React.createElement(ArticlesBrowser, { articles }));
    expect(container).toBeTruthy();
  });

  it("renders empty state", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const { container } = render(React.createElement(ArticlesBrowser, { articles: [] }));
    expect(container.querySelector("h2")).toBeTruthy();
  });
});
