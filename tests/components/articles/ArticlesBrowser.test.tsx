// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { type AnchorHTMLAttributes, type ReactNode } from "react";

import { getSiteCopy } from "@/config/contentCopy";
import { ArticlesBrowser, type ArticleListItem } from "@/components/articles/ArticlesBrowser";

const navigationState = vi.hoisted(() => ({
  search: "",
  pathname: "/articles",
  push: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ alt = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement("img", { alt, ...props }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
  useRouter: () => ({ push: navigationState.push }),
  useSearchParams: () => new URLSearchParams(navigationState.search),
}));

vi.mock("lucide-react", () => ({
  BookOpen: () => React.createElement("svg", { "data-testid": "book-open" }),
  ChevronLeft: () => React.createElement("svg", { "data-testid": "chevron-left" }),
  FileText: () => React.createElement("svg", { "data-testid": "file-text" }),
}));

vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({ locale: "zh" }),
}));

vi.mock("@/config/siteConfig", () => ({
  siteConfig: { name: "Test Author" },
}));

vi.mock("@/components/articles/ArticleCard", () => ({
  ArticleCard: ({ article }: { article: ArticleListItem }) =>
    React.createElement("article", { "data-testid": "article-card" }, article.title),
}));

function makeArticle(
  slug: string,
  overrides: Partial<ArticleListItem> = {}
): ArticleListItem {
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
  beforeEach(() => {
    navigationState.search = "";
    navigationState.pathname = "/articles";
    navigationState.push.mockClear();
  });

  it("renders article categories as archive cards and keeps articles hidden until a category is selected", () => {
    render(
      React.createElement(ArticlesBrowser, {
        articles: [
          makeArticle("a1", { category: "Dev" }),
          makeArticle("a2", { category: "Dev" }),
          makeArticle("a3", { category: "Life" }),
        ],
      })
    );

    expect(screen.getByRole("button", { name: /Dev/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Life/ })).toBeInTheDocument();
    expect(screen.queryByTestId("article-card")).not.toBeInTheDocument();
    expect(screen.getByText(`2 ${getSiteCopy("zh").articles.articlesCountSuffix}`)).toBeInTheDocument();
  });

  it("pushes the selected category into the article archive URL", () => {
    render(
      React.createElement(ArticlesBrowser, {
        articles: [makeArticle("a1", { category: "Dev" })],
      })
    );

    fireEvent.click(screen.getByRole("button", { name: /Dev/ }));

    expect(navigationState.push).toHaveBeenCalledWith("/articles?category=Dev");
  });

  it("renders empty state copy when there are no articles", () => {
    render(React.createElement(ArticlesBrowser, { articles: [] }));

    const copy = getSiteCopy("zh").articles;
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.emptyDescription)).toBeInTheDocument();
    expect(screen.getByTestId("file-text")).toBeInTheDocument();
  });

  it("uses category fallback and first tag grouping before URL selection", () => {
    render(
      React.createElement(ArticlesBrowser, {
        articles: [
          makeArticle("no-category"),
          makeArticle("tagged", { tags: ["React", "Next.js"] }),
          makeArticle("both", { category: "TypeScript", tags: ["React"] }),
        ],
      })
    );

    const copy = getSiteCopy("zh").articles;
    expect(screen.getByRole("button", { name: new RegExp(copy.categoryFallback) })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /React/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /TypeScript/ })).toBeInTheDocument();
  });

  it("renders selected category details with chapter rows first and other article cards after", () => {
    navigationState.search = "category=Dev";

    render(
      React.createElement(ArticlesBrowser, {
        articles: [
          makeArticle("chapter-2", {
            category: "Dev",
            title: "Chapter 2",
            chapter: 2,
            author: "fengc",
          }),
          makeArticle("preface", {
            category: "Dev",
            title: "Preface",
            chapter: 0,
          }),
          makeArticle("loose", {
            category: "Dev",
            title: "Loose article",
          }),
        ],
      })
    );

    const copy = getSiteCopy("zh").articles;
    expect(screen.getByRole("button", { name: copy.allCategories })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dev" })).toBeInTheDocument();
    expect(screen.getByText(copy.preface)).toBeInTheDocument();
    expect(screen.getByText(`${copy.chapterPrefix} 2${copy.chapterSuffix}`)).toBeInTheDocument();
    expect(screen.getByText(copy.otherArticles)).toBeInTheDocument();
    expect(screen.getByTestId("article-card")).toHaveTextContent("Loose article");
  });

  it("clears selected category from the URL through the category detail back action", () => {
    navigationState.search = "category=Dev";

    render(
      React.createElement(ArticlesBrowser, {
        articles: [makeArticle("a1", { category: "Dev" })],
      })
    );

    fireEvent.click(screen.getByRole("button", { name: getSiteCopy("zh").articles.allCategories }));

    expect(navigationState.push).toHaveBeenCalledWith("/articles");
  });

  it("renders an actionable empty state when the URL category is unknown", () => {
    navigationState.search = "category=Missing";

    render(
      React.createElement(ArticlesBrowser, {
        articles: [makeArticle("a1", { category: "Dev" })],
      })
    );

    const copy = getSiteCopy("zh").articles;
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: copy.allCategories }));
    expect(navigationState.push).toHaveBeenCalledWith("/articles");
  });

  it("does not reintroduce old template residue in the category archive", () => {
    const { container } = render(
      React.createElement(ArticlesBrowser, {
        articles: [makeArticle("a1", { category: "Dev" })],
      })
    );

    expect(container.innerHTML).not.toContain(["bg", "card"].join("-"));
    expect(container.innerHTML).not.toContain(["rounded", "2xl"].join("-"));
    expect(container.innerHTML).not.toContain(["border", "white/10"].join("-"));
  });
});
