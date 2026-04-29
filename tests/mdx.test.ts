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
  it("loads at least one article", async () => {
    const articles = await getArticles();
    expect(articles.length).toBeGreaterThan(0);
  });

  it("sorts featured articles before non-featured", async () => {
    const articles = await getArticles();
    let sawNonFeatured = false;
    for (const a of articles) {
      if (a.featured && sawNonFeatured) {
        throw new Error(
          `Featured article "${a.slug}" appeared after a non-featured one`
        );
      }
      if (!a.featured) sawNonFeatured = true;
    }
  });

  it("every article has a non-empty slug, title, and parseable date", async () => {
    const articles = await getArticles();
    for (const a of articles) {
      expect(a.slug.length).toBeGreaterThan(0);
      expect(a.title.length).toBeGreaterThan(0);
      expect(Number.isNaN(new Date(a.date).getTime())).toBe(false);
    }
  });

  it("getArticleSlugs() returns the same set as getArticles()", async () => {
    const [slugs, articles] = await Promise.all([
      getArticleSlugs(),
      getArticles(),
    ]);
    expect(new Set(slugs)).toEqual(new Set(articles.map((a) => a.slug)));
  });

  it("getArticleBySlug() round-trips a known slug", async () => {
    const articles = await getArticles();
    if (articles.length === 0) return;
    const target = articles[0];
    const fetched = await getArticleBySlug(target.slug);
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe(target.title);
    expect(fetched?.content.length).toBeGreaterThan(0);
  });

  it("getArticleBySlug() returns null for an unknown slug", async () => {
    const fetched = await getArticleBySlug("definitely-not-a-real-slug-xyz");
    expect(fetched).toBeNull();
  });
});
