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
vi.mock("lucide-react", () => ({
  FileText: () => React.createElement("svg", { "data-testid": "file-text" }),
}));

const mockSiteCopy = {
  hero: { line: "test", description: "test" },
  about: { heading: "test", socialsButton: "test", techIntro: "test", paragraphs: [], afterTechParagraph: "" },
  cases: { heading: "test", viewAll: "test", featuredBadge: "test", viewDetails: "test", emptyTitle: "test", emptyDescription: "test" },
  projects: { heading: "test", viewAll: "test", featuredBadge: "test", viewDetails: "test", emptyTitle: "test", emptyDescription: "test" },
  articles: {
    heading: "文章",
    description: "test",
    viewAll: "查看全部文章",
    emptyTitle: "还没有文章",
    emptyDescription: "发布后会显示在这里。",
    categoryFallback: "未分类",
    articlesCountSuffix: "篇",
    readTimeSuffix: "阅读",
  },
  photography: { heading: "test", description: "test", ongoing: "test", completed: "test", private: "test", photosSuffix: "test", emptyTitle: "test", emptyDescription: "test" },
};

vi.mock("@/config/contentCopy", () => ({
  getSiteCopy: () => mockSiteCopy,
}));

vi.mock("@/config/siteConfig", () => ({
  siteConfig: { name: "Test Author" },
}));

vi.mock("@/components/articles/ArticleCard", () => ({
  ArticleCard: ({ article }: any) =>
    React.createElement("div", { "data-testid": "article-card" }, article.title),
}));

// Mock LocaleProvider
vi.mock("@/components/LocaleProvider", () => {
  const LocaleContext = React.createContext({
    locale: "zh" as const,
    t: {},
    setLocale: vi.fn(),
    toggleLocale: vi.fn(),
  });
  return {
    LocaleProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(LocaleContext.Provider, {
        value: { locale: "zh", t: {}, setLocale: vi.fn(), toggleLocale: vi.fn() },
      }, children),
    useLocale: () => React.useContext(LocaleContext),
    LocaleScript: () => null,
  };
});

vi.mock("@/config/locale", () => ({
  LOCALE_STORAGE_KEY: "devfoliox-locale",
  getTranslations: () => ({}),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeArticle(slug: string, overrides: Record<string, any> = {}) {
  return {
    slug,
    title: `Article ${slug}`,
    summary: `Summary ${slug}`,
    date: "2025-01-15",
    readingTime: 5,
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ArticlesBrowser", () => {
  it("renders articles in category groups", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [
      makeArticle("a1", { category: "Dev" }),
      makeArticle("a2", { category: "Dev" }),
      makeArticle("a3", { category: "Life" }),
    ];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByText("Dev")).toBeInTheDocument();
    expect(screen.getByText("Life")).toBeInTheDocument();
    expect(screen.getAllByTestId("article-card")).toHaveLength(3);
  });

  it("renders empty state when no articles", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    render(React.createElement(ArticlesBrowser, { articles: [] }));
    expect(screen.getByText("还没有文章")).toBeInTheDocument();
    expect(screen.getByTestId("file-text")).toBeInTheDocument();
  });

  it("uses categoryFallback when article has no category or tags", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [makeArticle("no-cat")];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByText("未分类")).toBeInTheDocument();
  });

  it("falls back to first tag when no category", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [makeArticle("tagged", { tags: ["React", "Next.js"] })];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("prefers category over tags", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [makeArticle("both", { category: "TypeScript", tags: ["React"] })];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });

  it("shows article count suffix per category", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [
      makeArticle("a1", { category: "Dev" }),
      makeArticle("a2", { category: "Dev" }),
    ];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByText("2 篇")).toBeInTheDocument();
  });

  it("renders single article without pagination", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [makeArticle("solo")];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByText("Article solo")).toBeInTheDocument();
    expect(screen.queryByLabelText("下一页")).not.toBeInTheDocument();
  });

  it("renders featured article card alongside others", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [
      makeArticle("featured-1", { featured: true }),
      makeArticle("regular-1"),
    ];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getAllByTestId("article-card")).toHaveLength(2);
  });
});

describe("getCategory helper", () => {
  it("returns categoryFallback when no category or tags", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    // getCategory is internal; we test via rendering
    const articles = [makeArticle("no-cat-no-tag")];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByText("未分类")).toBeInTheDocument();
  });

  it("returns first tag when no category but has tags", async () => {
    const { ArticlesBrowser } = await import("@/components/articles/ArticlesBrowser");
    const articles = [makeArticle("tag-only", { tags: ["CSS"] })];
    render(React.createElement(ArticlesBrowser, { articles }));
    expect(screen.getByText("CSS")).toBeInTheDocument();
  });
});
