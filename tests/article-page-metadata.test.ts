import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/mdx/mdx", () => ({
  getArticles: vi.fn().mockImplementation(async (locale = "zh") =>
    locale === "en"
      ? [{
          title: "English GEO audit",
          slug: "ai-search-visibility-audit-geo",
          summary: "English summary",
          date: "2026-08-29",
          tags: ["GEO"],
          readingTime: 4,
          publicPath: "/en/articles/ai-search-visibility-audit-geo",
        }]
      : [],
  ),
  getArticleBySlug: vi.fn().mockImplementation(async (slug: string, locale = "zh") => {
    if (locale === "en" && slug !== "ai-search-visibility-audit-geo") return null;
    return {
      title: locale === "en" ? "English GEO audit" : "Evidence-led article",
      slug,
      summary: "Summary",
      date: "2026-08-09",
      tags: [],
      content: "Body",
      readingTime: 1,
      wordCount: 1,
      publicPath: `${locale === "en" ? "/en" : ""}/articles/${slug}`,
      contentHash: "sha256:expected",
    };
  }),
  getArticleSlugs: vi.fn().mockResolvedValue([]),
  getRelatedArticles: vi.fn().mockResolvedValue([]),
}));

import { generateMetadata } from "@/app/(site-zh)/articles/[slug]/page";
import EnglishArticlesPage from "@/app/(site-en)/en/articles/page";

describe("article metadata", () => {
  it("emits the workbench content hash only when the article has one", async () => {
    await expect(generateMetadata({ params: Promise.resolve({ slug: "evidence-led-article" }) })).resolves.toMatchObject({
      other: { "article-content-hash": "sha256:expected" },
    });
  });
});

describe("English article index", () => {
  it("renders reviewed English articles from the English loader", async () => {
    const page = await EnglishArticlesPage();

    expect(page.props.articles).toEqual([
      expect.objectContaining({
        slug: "ai-search-visibility-audit-geo",
        publicPath: "/en/articles/ai-search-visibility-audit-geo",
      }),
    ]);
  });

  it("adds language alternates only when a reviewed English counterpart exists", async () => {
    await expect(generateMetadata({
      params: Promise.resolve({ slug: "ai-search-visibility-audit-geo" }),
    })).resolves.toMatchObject({
      alternates: {
        canonical: "/articles/ai-search-visibility-audit-geo",
        languages: {
          "zh-CN": "/articles/ai-search-visibility-audit-geo",
          en: "/en/articles/ai-search-visibility-audit-geo",
          "x-default": "/articles/ai-search-visibility-audit-geo",
        },
      },
    });

    await expect(generateMetadata({
      params: Promise.resolve({ slug: "chinese-only" }),
    })).resolves.toMatchObject({
      alternates: { canonical: "/articles/chinese-only" },
    });
    const untranslated = await generateMetadata({
      params: Promise.resolve({ slug: "chinese-only" }),
    });
    expect(untranslated.alternates?.languages).toBeUndefined();
  });
});
