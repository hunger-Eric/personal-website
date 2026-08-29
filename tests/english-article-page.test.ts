import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/mdx/mdx", () => ({
  getArticleSlugs: vi.fn().mockImplementation(async (locale = "zh") =>
    locale === "en" ? ["ai-search-visibility-audit-geo"] : [],
  ),
  getArticleBySlug: vi.fn().mockResolvedValue({
    title: "Why AI Search Cannot See Your Website",
    slug: "ai-search-visibility-audit-geo",
    summary: "A practical English GEO visibility audit.",
    date: "2026-08-29",
    updated: "2026-08-29",
    category: "AI search visibility",
    tags: ["GEO", "AI search"],
    content: "## Direct answer\n\nEnglish body.",
    readingTime: 4,
    wordCount: 700,
    publicPath: "/en/articles/ai-search-visibility-audit-geo",
    author: "SolveReal Systems",
  }),
  getRelatedArticles: vi.fn().mockResolvedValue([]),
}));

function findBlogPosting(node: unknown): Record<string, unknown> | null {
  if (!node || typeof node !== "object") return null;
  const record = node as { props?: { data?: unknown; children?: unknown } };
  const data = record.props?.data;
  if (data && typeof data === "object" && (data as { "@type"?: unknown })["@type"] === "BlogPosting") {
    return data as Record<string, unknown>;
  }
  const children = record.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findBlogPosting(child);
    if (found) return found;
  }
  return null;
}

describe("reviewed English article detail", () => {
  it("renders the independent English article with localized metadata and schema", async () => {
    const route = await import("@/app/(site-en)/en/articles/[slug]/page");
    const params = Promise.resolve({ slug: "ai-search-visibility-audit-geo" });

    await expect(route.generateStaticParams()).resolves.toEqual([
      { slug: "ai-search-visibility-audit-geo" },
    ]);
    await expect(route.generateMetadata({ params })).resolves.toMatchObject({
      alternates: {
        canonical: "/en/articles/ai-search-visibility-audit-geo",
        languages: {
          "zh-CN": "/articles/ai-search-visibility-audit-geo",
          en: "/en/articles/ai-search-visibility-audit-geo",
          "x-default": "/articles/ai-search-visibility-audit-geo",
        },
      },
    });

    const page = await route.default({ params });
    expect(findBlogPosting(page)).toMatchObject({
      url: "https://me.itheheda.online/en/articles/ai-search-visibility-audit-geo",
      inLanguage: "en",
    });
  });
});
