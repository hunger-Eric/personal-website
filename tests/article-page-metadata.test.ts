import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/mdx/mdx", () => ({
  getArticleBySlug: vi.fn().mockResolvedValue({
    title: "Evidence-led article", slug: "evidence-led-article", summary: "Summary", date: "2026-08-09",
    tags: [], content: "Body", readingTime: 1, wordCount: 1, publicPath: "/articles/evidence-led-article",
    contentHash: "sha256:expected",
  }),
  getArticleSlugs: vi.fn().mockResolvedValue([]),
  getRelatedArticles: vi.fn().mockResolvedValue([]),
}));

import { generateMetadata } from "@/app/articles/[slug]/page";

describe("article metadata", () => {
  it("emits the workbench content hash only when the article has one", async () => {
    await expect(generateMetadata({ params: Promise.resolve({ slug: "evidence-led-article" }) })).resolves.toMatchObject({
      other: { "article-content-hash": "sha256:expected" },
    });
  });
});
