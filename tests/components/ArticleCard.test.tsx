// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────
vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));
vi.mock("next/link", () => ({
  default: (p: any) => React.createElement("a", { href: p.href }, p.children),
}));

const mockSiteCopy = {
  articles: {
    emptyTitle: "test", emptyDescription: "test",
    categoryFallback: "未分类", articlesCountSuffix: "篇", readTimeSuffix: "分钟阅读",
  },
};

vi.mock("@/config/contentCopy", () => ({ getSiteCopy: () => mockSiteCopy }));
vi.mock("@/config/siteConfig", () => ({ siteConfig: { name: "Test Author" } }));

vi.mock("@/components/LocaleProvider", () => {
  const LocaleContext = React.createContext({ locale: "zh" as const, setLocale: vi.fn(), toggleLocale: vi.fn() });
  return {
    LocaleProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(LocaleContext.Provider, { value: { locale: "zh", setLocale: vi.fn(), toggleLocale: vi.fn() } }, children),
    useLocale: () => React.useContext(LocaleContext),
    LocaleScript: () => null,
  };
});
vi.mock("@/config/locale", () => ({ LOCALE_STORAGE_KEY: "shijie-intelligence-locale" }));

// ── Tests ──────────────────────────────────────────────────────────────────
describe("ArticleCard", () => {
  it("renders article info", async () => {
    const { ArticleCard } = await import("@/components/articles/ArticleCard");
    const article = { slug: "test-article", title: "Test Title", summary: "A summary", date: "2025-01-15", readingTime: 5, tags: ["js", "react"] };
    render(React.createElement(ArticleCard, { article }));
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("A summary")).toBeInTheDocument();
  });

  it("renders featured article with link", async () => {
    const { ArticleCard } = await import("@/components/articles/ArticleCard");
    const article = { slug: "featured", title: "Featured", summary: "Featured summary", date: "2025-01-15", readingTime: 3, featured: true, tags: [] };
    const { container } = render(React.createElement(ArticleCard, { article }));
    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link?.getAttribute("href")).toBe("/articles/featured");
  });

  it("shows author from siteConfig when not provided", async () => {
    const { ArticleCard } = await import("@/components/articles/ArticleCard");
    const article = { slug: "a1", title: "T", summary: "S", date: "2025-01-15", readingTime: 5, tags: [] };
    render(React.createElement(ArticleCard, { article }));
    expect(screen.getByText("Test Author")).toBeInTheDocument();
  });

  it("shows article author when provided", async () => {
    const { ArticleCard } = await import("@/components/articles/ArticleCard");
    const article = { slug: "a1", title: "T", summary: "S", date: "2025-01-15", readingTime: 5, author: "Custom Author", tags: [] };
    render(React.createElement(ArticleCard, { article }));
    expect(screen.getByText("Custom Author")).toBeInTheDocument();
  });

  it("shows category from article.category", async () => {
    const { ArticleCard } = await import("@/components/articles/ArticleCard");
    const article = { slug: "a1", title: "T", summary: "S", date: "2025-01-15", readingTime: 5, category: "DevOps", tags: ["React"] };
    render(React.createElement(ArticleCard, { article }));
    expect(screen.getByText("DevOps")).toBeInTheDocument();
  });

  it("falls back to first tag when no category", async () => {
    const { ArticleCard } = await import("@/components/articles/ArticleCard");
    const article = { slug: "a1", title: "T", summary: "S", date: "2025-01-15", readingTime: 5, tags: ["React"] };
    render(React.createElement(ArticleCard, { article }));
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("shows reading time", async () => {
    const { ArticleCard } = await import("@/components/articles/ArticleCard");
    const article = { slug: "a1", title: "T", summary: "S", date: "2025-01-15", readingTime: 8, tags: [] };
    render(React.createElement(ArticleCard, { article }));
    expect(screen.getByText("8 分钟阅读")).toBeInTheDocument();
  });
});
