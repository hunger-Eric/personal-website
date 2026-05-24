// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({ Calendar: () => <svg />, Clock: () => <svg />, ArrowRight: () => <svg /> }));
vi.mock("next/link", () => ({ default: (p: any) => React.createElement("a", { href: p.href, children: p.children }) }));

describe("ArticleCard", () => {
  it("renders article info", async () => {
    const { ArticleCard } = await import("@/components/articles/ArticleCard");
    const article = { slug: "test-article", title: "Test Title", summary: "A summary", date: "2025-01-15", readingTime: 5, tags: ["js", "react"] };
    render(React.createElement(ArticleCard, { article, index: 0 }));
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("A summary")).toBeInTheDocument();
  });

  it("renders featured article differently", async () => {
    const { ArticleCard } = await import("@/components/articles/ArticleCard");
    const article = { slug: "featured", title: "Featured", summary: "Featured summary", date: "2025-01-15", readingTime: 3, featured: true, tags: [] };
    const { container } = render(React.createElement(ArticleCard, { article, index: 0 }));
    expect(container.querySelector("a")).toBeInTheDocument();
  });
});
