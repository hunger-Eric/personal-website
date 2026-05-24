import { describe, it, expect } from "vitest";
import {
  FrontmatterSchema,
  calculateReadingTime,
  getArticles,
  getArticleBySlug,
  getArticleSlugs,
} from "@/lib/mdx/mdx";

describe("FrontmatterSchema", () => {
  it("accepts a valid article", () => {
    const r = FrontmatterSchema.safeParse({
      title: "Hello",
      slug: "hello-world",
      summary: "Hi",
      date: "2026-04-01",
      tags: ["a", "b"],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing title", () => {
    const r = FrontmatterSchema.safeParse({ date: "2026-04-01" });
    expect(r.success).toBe(false);
  });

  it("rejects an unparseable date", () => {
    const r = FrontmatterSchema.safeParse({
      title: "Hi",
      date: "yesterday",
    });
    expect(r.success).toBe(false);
  });

  it("rejects a slug with invalid characters", () => {
    const r = FrontmatterSchema.safeParse({
      title: "Hi",
      date: "2026-04-01",
      slug: "Has Spaces!",
    });
    expect(r.success).toBe(false);
  });

  it("defaults tags to empty array and draft to false", () => {
    const r = FrontmatterSchema.safeParse({
      title: "Hi",
      date: "2026-04-01",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tags).toEqual([]);
      expect(r.data.draft).toBe(false);
      expect(r.data.featured).toBe(false);
    }
  });
});

describe("calculateReadingTime", () => {
  it("rounds up to at least 1 minute", () => {
    expect(calculateReadingTime("hello world").time).toBe(1);
  });

  it("hits 1 minute at exactly 200 words", () => {
    const text = Array.from({ length: 200 }, () => "word").join(" ");
    expect(calculateReadingTime(text).time).toBe(1);
  });

  it("scales linearly past 200 words", () => {
    const text = Array.from({ length: 1500 }, () => "word").join(" ");
    expect(calculateReadingTime(text).time).toBe(8);
  });

  it("returns the word count", () => {
    expect(calculateReadingTime("a b c d e").words).toBe(5);
  });
});

describe("article loader (real content)", () => {
  it("returns a valid article list shape", async () => {
    const articles = await getArticles();
    expect(Array.isArray(articles)).toBe(true);
    for (const article of articles) {
      expect(typeof article.slug).toBe("string");
      expect(typeof article.title).toBe("string");
      expect(typeof article.date).toBe("string");
    }
  });

  it("handles article slug resolution gracefully", async () => {
    const article = await getArticleBySlug("non-existent-slug");
    expect(article).toBeNull();
  });

  it("getArticleSlugs() returns the same set as getArticles()", async () => {
    const [slugs, articles] = await Promise.all([
      getArticleSlugs(),
      getArticles(),
    ]);
    expect(new Set(slugs)).toEqual(new Set(articles.map((a) => a.slug)));
  });
});
