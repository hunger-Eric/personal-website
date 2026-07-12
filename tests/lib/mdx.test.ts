// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import nodeFs, { type PathLike } from "node:fs";
import {
  calculateReadingTime,
  FrontmatterSchema,
  getArticles,
  getArticleBySlug,
  getArticleSlugs,
  getCategories,
  getTags,
  getRelatedArticles,
  getArticlesByCategory,
  getArticlesByTag,
} from "@/lib/mdx/mdx";

type MockableFs = {
  existsSync: typeof nodeFs.existsSync;
  readdirSync(path: PathLike): string[];
  readFileSync: typeof nodeFs.readFileSync;
};

const fs = nodeFs as MockableFs;

// ---------------------------------------------------------------------------
// Mock node:fs at top level – override per-test via vi.mocked()
// ---------------------------------------------------------------------------
vi.mock("node:fs", () => {
  const mocks = {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
  };
  return {
    ...mocks,
    default: mocks,
  };
});

// Helper: extract the filename from the full path used by fs mock
function fn(p: any): string {
  return String(p).split(/[/\\]/).pop() || "";
}

// Convenience: generate a valid MDX file from frontmatter overrides
// IMPORTANT: dates MUST be quoted in YAML so gray-matter returns a string,
// not a Date object (Zod schema expects string).
function mdx(fields: Record<string, unknown>): string {
  const fm: Record<string, unknown> = { title: "Default Title", date: "2025-06-01", ...fields };
  const yaml = Object.entries(fm)
    .map(([k, v]) => {
      if (k === "date" || k === "updated") return `${k}: "${String(v)}"`;  // force string in YAML
      if (Array.isArray(v)) return `${k}: [${v.map(String).join(", ")}]`;
      if (typeof v === "boolean") return `${k}: ${v}`;
      if (k === "category" || k === "title" || k === "summary" || k === "imageSrc" || k === "imageAlt" || k === "author") return `${k}: "${v}"`;
      return `${k}: ${v}`;
    })
    .join("\n");
  return `---\n${yaml}\n---\n\nArticle body content here.`;
}

beforeEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(process.env, "NODE_ENV");
});

// ---------------------------------------------------------------------------
// Pure function tests (existing)
// ---------------------------------------------------------------------------

describe("calculateReadingTime", () => {
  it("calculates reading time correctly", () => {
    const words = Array(400).fill("word").join(" ");
    const { time, words: count } = calculateReadingTime(words);
    expect(time).toBe(2);
    expect(count).toBe(400);
  });

  it("returns minimum 1 minute for short content", () => {
    const { time } = calculateReadingTime("short");
    expect(time).toBe(1);
  });

  it("handles empty string", () => {
    const { time, words } = calculateReadingTime("");
    expect(words).toBe(1);
    expect(time).toBe(1);
  });
});

describe("FrontmatterSchema", () => {
  it("validates valid frontmatter", () => {
    const r = FrontmatterSchema.safeParse({ title: "My Post", date: "2025-01-01" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tags).toEqual([]);
      expect(r.data.draft).toBe(false);
    }
  });
  it("rejects missing title", () => {
    expect(FrontmatterSchema.safeParse({ date: "2025-01-01" }).success).toBe(false);
  });
  it("rejects invalid slug", () => {
    expect(FrontmatterSchema.safeParse({ title: "X", slug: "UPPERCASE!!!", date: "2025-01-01" }).success).toBe(false);
  });
  it("rejects invalid date", () => {
    expect(FrontmatterSchema.safeParse({ title: "X", date: "not-a-date" }).success).toBe(false);
  });
  it("accepts all optional fields", () => {
    expect(FrontmatterSchema.safeParse({
      title: "Full", slug: "full-post", summary: "Great", date: "2025-03-15",
      updated: "2025-04-01", category: "tech", tags: ["js"], featured: true,
      draft: true, imageSrc: "/img.jpg", imageAlt: "Alt", author: "John",
    }).success).toBe(true);
  });

  // Line 114: branch for i.path being empty (root-level validation error)
  // When the input is not an object, Zod issues a root-level error with empty path
  it("handles root-level validation error with empty path", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = FrontmatterSchema.safeParse("not-an-object");
    expect(r.success).toBe(false);
    // The error issue should have an empty path, triggering the "(root)" fallback
    if (!r.success) {
      const issues = r.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      expect(issues).toContain("(root)");
    }
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// getArticles
// ---------------------------------------------------------------------------

describe("getArticles", () => {
  it("returns article previews for valid MDX files", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["post-1.mdx", "post-2.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      const f = fn(p);
      if (f === "post-1.mdx") return mdx({ title: "Post One", slug: "post-1", date: "2025-06-01", category: "tech", tags: ["js", "react"] });
      return mdx({ title: "Post Two", slug: "post-2", date: "2025-05-01", category: "design", tags: ["css"] });
    });
    const articles = await getArticles();
    expect(articles).toHaveLength(2);
    expect(articles[0].title).toBe("Post One");   // newer date first
    expect(articles[1].title).toBe("Post Two");
  });

  it("sorts featured articles first", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx", "b.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "a.mdx") return mdx({ title: "Featured", slug: "featured", date: "2025-01-01", featured: true });
      return mdx({ title: "Normal", slug: "normal", date: "2025-06-01" });
    });
    const articles = await getArticles();
    expect(articles).toHaveLength(2);
    expect(articles[0].title).toBe("Featured");
    expect(articles[1].title).toBe("Normal");
  });

  it("filters drafts in production", async () => {
    Reflect.set(process.env, "NODE_ENV", "production");
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["pub.mdx", "draft.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "draft.mdx") return mdx({ title: "Draft", slug: "draft", date: "2025-06-01", draft: true });
      return mdx({ title: "Published", slug: "pub", date: "2025-06-01" });
    });
    const articles = await getArticles();
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe("Published");
  });

  it("returns empty array when content dir does not exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const articles = await getArticles();
    expect(articles).toEqual([]);
  });

  it("skips files with invalid frontmatter", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["good.mdx", "bad.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "bad.mdx") return "---\ntitle: Nope\n---\n\nNo date";
      return mdx({ title: "Good", slug: "good", date: "2025-06-01" });
    });
    const articles = await getArticles();
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe("Good");
  });

  it("skips files that fail to read", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["good.mdx", "broken.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "broken.mdx") throw new Error("Permission denied");
      return mdx({ title: "Good", slug: "good", date: "2025-06-01" });
    });
    const articles = await getArticles();
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe("Good");
  });

  it("includes readingTime in previews", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["post.mdx"]);
    vi.mocked(fs.readFileSync).mockReturnValue(mdx({ title: "Post", slug: "post", date: "2025-06-01" }));
    const articles = await getArticles();
    expect(articles).toHaveLength(1);
    expect(articles[0]).toHaveProperty("readingTime");
    expect(typeof articles[0].readingTime).toBe("number");
  });

  it("includes .md files as well as .mdx", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx", "b.md"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      const slug = fn(p) === "a.mdx" ? "a" : "b";
      return mdx({ title: "File", slug, date: "2025-06-01" });
    });
    const articles = await getArticles();
    expect(articles).toHaveLength(2);
  });

  it("uses filename as slug when slug is not in frontmatter", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["hello-world.mdx"]);
    vi.mocked(fs.readFileSync).mockReturnValue(mdx({ title: "Hello", date: "2025-06-01" }));
    const articles = await getArticles();
    expect(articles).toHaveLength(1);
    expect(articles[0].slug).toBe("hello-world");
  });

  it("returns empty array when fs.readdirSync throws (catch block)", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockImplementation(() => {
      throw new Error("ENOTDIR: not a directory");
    });
    const articles = await getArticles();
    expect(articles).toEqual([]);
  });

  it("sorts two featured articles by date (both featured)", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx", "b.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "a.mdx")
        return mdx({ title: "Older Featured", slug: "older", date: "2025-01-01", featured: true });
      return mdx({ title: "Newer Featured", slug: "newer", date: "2025-06-01", featured: true });
    });
    const articles = await getArticles();
    expect(articles).toHaveLength(2);
    expect(articles[0].title).toBe("Newer Featured");
    expect(articles[1].title).toBe("Older Featured");
  });

  it("sorts two non-featured articles by date (neither featured)", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx", "b.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "a.mdx")
        return mdx({ title: "Older", slug: "older", date: "2025-01-01" });
      return mdx({ title: "Newer", slug: "newer", date: "2025-06-01" });
    });
    const articles = await getArticles();
    expect(articles).toHaveLength(2);
    expect(articles[0].title).toBe("Newer");
    expect(articles[1].title).toBe("Older");
  });
});

// ---------------------------------------------------------------------------
// getArticleBySlug
// ---------------------------------------------------------------------------

describe("getArticleBySlug", () => {
  it("returns the full article for a matching slug", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["post-1.mdx", "post-2.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "post-1.mdx") return mdx({ title: "Post One", slug: "post-1", date: "2025-06-01", category: "tech" });
      return mdx({ title: "Post Two", slug: "post-2", date: "2025-05-01" });
    });
    const article = await getArticleBySlug("post-1");
    expect(article).not.toBeNull();
    expect(article!.title).toBe("Post One");
    expect(article!.slug).toBe("post-1");
    expect(article!.content).toContain("Article body content");
    expect(article!).toHaveProperty("readingTime");
    expect(article!).toHaveProperty("wordCount");
  });

  it("returns null when slug does not match", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["post.mdx"]);
    vi.mocked(fs.readFileSync).mockReturnValue(mdx({ title: "Post", slug: "post", date: "2025-06-01" }));
    const article = await getArticleBySlug("nonexistent");
    expect(article).toBeNull();
  });

  it("returns null for draft articles in production", async () => {
    Reflect.set(process.env, "NODE_ENV", "production");
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["draft.mdx"]);
    vi.mocked(fs.readFileSync).mockReturnValue(mdx({ title: "Draft", slug: "draft", date: "2025-06-01", draft: true }));
    const article = await getArticleBySlug("draft");
    expect(article).toBeNull();
  });

  it("skips invalid frontmatter files while searching", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["bad.mdx", "good.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "bad.mdx") return "---\ntitle: No date\n---\n\nNo date";
      return mdx({ title: "Good", slug: "good", date: "2025-06-01" });
    });
    const article = await getArticleBySlug("good");
    expect(article).not.toBeNull();
    expect(article!.title).toBe("Good");
  });

  it("returns null when content dir does not exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const article = await getArticleBySlug("anything");
    expect(article).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getArticleSlugs
// ---------------------------------------------------------------------------

describe("getArticleSlugs", () => {
  it("returns all slugs from articles", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx", "b.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "a.mdx") return mdx({ title: "A", slug: "slug-a", date: "2025-06-01" });
      return mdx({ title: "B", slug: "slug-b", date: "2025-05-01" });
    });
    const slugs = await getArticleSlugs();
    expect(slugs).toEqual(["slug-a", "slug-b"]);
  });

  it("returns empty array when no articles", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([]);
    const slugs = await getArticleSlugs();
    expect(slugs).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getArticlesByCategory
// ---------------------------------------------------------------------------

describe("getArticlesByCategory", () => {
  it("filters articles by category (case-insensitive)", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx", "b.mdx", "c.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      const f = fn(p);
      if (f === "a.mdx") return mdx({ title: "Tech A", slug: "a", date: "2025-06-01", category: "Tech" });
      if (f === "b.mdx") return mdx({ title: "Design B", slug: "b", date: "2025-05-01", category: "Design" });
      return mdx({ title: "Tech C", slug: "c", date: "2025-04-01", category: "tech" });
    });
    const articles = await getArticlesByCategory("tech");
    expect(articles).toHaveLength(2);
    // newest first: a (2025-06) then c (2025-04)
    expect(articles.map((a) => a.title)).toEqual(["Tech A", "Tech C"]);
  });

  it("returns empty array when no match", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx"]);
    vi.mocked(fs.readFileSync).mockReturnValue(mdx({ title: "A", slug: "a", date: "2025-06-01", category: "Tech" }));
    const articles = await getArticlesByCategory("Nonexistent");
    expect(articles).toEqual([]);
  });

  it("handles articles without category", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx", "b.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "a.mdx") return mdx({ title: "A", slug: "a", date: "2025-06-01", category: "Tech" });
      return mdx({ title: "B", slug: "b", date: "2025-05-01" }); // no category
    });
    const articles = await getArticlesByCategory("Tech");
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe("A");
  });
});

// ---------------------------------------------------------------------------
// getArticlesByTag
// ---------------------------------------------------------------------------

describe("getArticlesByTag", () => {
  it("filters articles by tag (case-insensitive)", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx", "b.mdx", "c.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      const f = fn(p);
      if (f === "a.mdx") return mdx({ title: "A", slug: "a", date: "2025-06-01", tags: ["JavaScript", "React"] });
      if (f === "b.mdx") return mdx({ title: "B", slug: "b", date: "2025-05-01", tags: ["CSS"] });
      return mdx({ title: "C", slug: "c", date: "2025-04-01", tags: ["javascript"] });
    });
    const articles = await getArticlesByTag("javascript");
    expect(articles).toHaveLength(2);
    expect(articles.map((a) => a.title)).toEqual(["A", "C"]); // newest first
  });

  it("returns empty array when tag does not match", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx"]);
    vi.mocked(fs.readFileSync).mockReturnValue(mdx({ title: "A", slug: "a", date: "2025-06-01", tags: ["js"] }));
    const articles = await getArticlesByTag("python");
    expect(articles).toEqual([]);
  });

  it("handles articles without tags", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx"]);
    vi.mocked(fs.readFileSync).mockReturnValue(mdx({ title: "A", slug: "a", date: "2025-06-01" }));
    const articles = await getArticlesByTag("anything");
    expect(articles).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getCategories
// ---------------------------------------------------------------------------

describe("getCategories", () => {
  it("returns sorted unique categories", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx", "b.mdx", "c.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      const f = fn(p);
      if (f === "a.mdx") return mdx({ title: "A", slug: "a", date: "2025-06-01", category: "Zeta" });
      if (f === "b.mdx") return mdx({ title: "B", slug: "b", date: "2025-05-01", category: "Alpha" });
      return mdx({ title: "C", slug: "c", date: "2025-04-01", category: "Zeta" });
    });
    const categories = await getCategories();
    expect(categories).toEqual(["Alpha", "Zeta"]);
  });

  it("returns empty array when no categories exist", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx"]);
    vi.mocked(fs.readFileSync).mockReturnValue(mdx({ title: "A", slug: "a", date: "2025-06-01" }));
    const categories = await getCategories();
    expect(categories).toEqual([]);
  });

  it("returns empty array when no articles", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([]);
    const categories = await getCategories();
    expect(categories).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getTags
// ---------------------------------------------------------------------------

describe("getTags", () => {
  it("returns sorted unique tags", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx", "b.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "a.mdx") return mdx({ title: "A", slug: "a", date: "2025-06-01", tags: ["react", "js"] });
      return mdx({ title: "B", slug: "b", date: "2025-05-01", tags: ["css", "js"] });
    });
    const tags = await getTags();
    expect(tags).toEqual(["css", "js", "react"]);
  });

  it("returns empty array when no tags", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["a.mdx"]);
    vi.mocked(fs.readFileSync).mockReturnValue(mdx({ title: "A", slug: "a", date: "2025-06-01" }));
    const tags = await getTags();
    expect(tags).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getRelatedArticles
// ---------------------------------------------------------------------------

describe("getRelatedArticles", () => {
  it("returns articles sharing tags, scored by match count, respecting limit", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["current.mdx", "related1.mdx", "related2.mdx", "unrelated.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      const f = fn(p);
      if (f === "current.mdx") return mdx({ title: "Current", slug: "current", date: "2025-06-01", tags: ["js", "react"] });
      if (f === "related1.mdx") return mdx({ title: "Related1", slug: "related1", date: "2025-05-01", tags: ["js"] });
      if (f === "related2.mdx") return mdx({ title: "Related2", slug: "related2", date: "2025-04-01", tags: ["react", "js"] });
      return mdx({ title: "Unrelated", slug: "unrelated", date: "2025-03-01", tags: ["python"] });
    });
    const articles = await getRelatedArticles("current", 1);
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe("Related2"); // scores 2 vs 1
  });

  it("returns empty when current article has no tags", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["current.mdx", "other.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "current.mdx") return mdx({ title: "Current", slug: "current", date: "2025-06-01" });
      return mdx({ title: "Other", slug: "other", date: "2025-05-01", tags: ["js"] });
    });
    const articles = await getRelatedArticles("current");
    expect(articles).toEqual([]);
  });

  it("returns empty when current article not found", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["other.mdx"]);
    vi.mocked(fs.readFileSync).mockReturnValue(mdx({ title: "Other", slug: "other", date: "2025-06-01", tags: ["js"] }));
    const articles = await getRelatedArticles("nonexistent");
    expect(articles).toEqual([]);
  });

  it("returns empty when no articles share tags", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["current.mdx", "other.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      if (fn(p) === "current.mdx") return mdx({ title: "Cur", slug: "current", date: "2025-06-01", tags: ["js"] });
      return mdx({ title: "Other", slug: "other", date: "2025-05-01", tags: ["python"] });
    });
    const articles = await getRelatedArticles("current");
    expect(articles).toEqual([]);
  });

  it("uses default limit of 3", async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue(["current.mdx", "a.mdx", "b.mdx", "c.mdx", "d.mdx"]);
    vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
      const f = fn(p);
      if (f === "current.mdx") return mdx({ title: "Cur", slug: "current", date: "2025-06-01", tags: ["js"] });
      const name = f === "a.mdx" ? "A" : f === "b.mdx" ? "B" : f === "c.mdx" ? "C" : "D";
      return mdx({ title: name, slug: name.toLowerCase(), date: "2025-05-01", tags: ["js"] });
    });
    const articles = await getRelatedArticles("current");
    expect(articles).toHaveLength(3);
  });
});
