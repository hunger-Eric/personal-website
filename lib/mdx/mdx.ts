// lib/mdx/mdx.ts
// MDX utilities for loading and processing articles
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";

export type ArticleLocale = "zh" | "en";

const CONTENT_DIRECTORIES: Record<ArticleLocale, string> = {
  zh: path.join(process.cwd(), "content/articles"),
  en: path.join(process.cwd(), "content/articles-en"),
};

// Slug must be kebab-style: starts with alphanum, then alphanum/hyphen, max 80 chars.
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,80}$/i;

// A "parseable date" — anything new Date() can interpret (ISO, YYYY-MM-DD, etc).
const parseableDate = z
  .string()
  .min(1)
  .refine((v) => !Number.isNaN(new Date(v).getTime()), {
    message: "must be a parseable date (ISO 8601 or YYYY-MM-DD)",
  });

// Exported so unit tests can validate raw frontmatter without going through the
// fs / gray-matter pipeline.
export const FrontmatterSchema = z.object({
  title: z.string().min(1, "title is required"),
  slug: z.string().regex(SLUG_REGEX, "slug must be kebab-style").optional(),
  summary: z.string().optional().default(""),
  date: parseableDate,
  updated: parseableDate.optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
  draft: z.boolean().optional().default(false),
  imageSrc: z.string().optional(),
  imageAlt: z.string().optional(),
  author: z.string().optional(),
  contentHash: z.string().optional(),
});

export interface ArticleFrontmatter {
  title: string;
  slug: string;
  summary: string;
  date: string;
  updated?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  draft?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  author?: string;
  contentHash?: string;
}

export interface Article extends ArticleFrontmatter {
  content: string;
  readingTime: number;
  wordCount: number;
  publicPath: string;
}

export interface ArticlePreview extends ArticleFrontmatter {
  readingTime: number;
  chapter?: number; // 0 for preface, 1-16 for chapters
  publicPath: string;
}

function getPublicArticlePath(slug: string, locale: ArticleLocale): string {
  const standalonePath = path.join(
    process.cwd(),
    "public",
    "articles",
    `${slug}.html`
  );
  if (locale === "en") return `/en/articles/${slug}`;
  return fs.existsSync(standalonePath)
    ? `/articles/${slug}.html`
    : `/articles/${slug}`;
}

/**
 * Extract chapter number from slug.
 * - Slugs containing "preface" are chapter 0 (preface)
 * - Slugs matching pattern like "hello-agents-ch01" extract the number (1-16)
 * Returns undefined if not a chapter article
 */
export function extractChapterFromSlug(slug: string): number | undefined {
  // Check for preface
  if (slug.toLowerCase().includes("preface")) {
    return 0;
  }
  // Check for chapter pattern like ch01, ch02, etc.
  const match = slug.match(/ch(\d+)$/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 16) {
      return num;
    }
  }
  return undefined;
}

/**
 * Calculate reading time from content. Exported for testing.
 */
export function calculateReadingTime(
  content: string
): { time: number; words: number } {
  const trimmed = content.trim();
  if (!trimmed) return { time: 1, words: 1 };

  const cjkCharacters = trimmed.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)?.length ?? 0;
  const nonCjkText = trimmed.replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu, " ");
  const latinWords = nonCjkText.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  const words = cjkCharacters + latinWords;
  const minutes = cjkCharacters / 400 + latinWords / 200;
  return { time: Math.max(1, Math.ceil(minutes)), words: Math.max(1, words) };
}

/**
 * Get all article files from the content directory
 */
function getArticleFiles(locale: ArticleLocale): string[] {
  const contentDir = CONTENT_DIRECTORIES[locale];
  try {
    if (!fs.existsSync(contentDir)) {
      return [];
    }
    return fs
      .readdirSync(contentDir)
      .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
  } catch {
    return [];
  }
}

/**
 * Parse article file and extract frontmatter + content. Validates frontmatter
 * against a Zod schema so a malformed article cannot poison the feed/sitemap;
 * invalid articles are skipped with a clear console error.
 */
function parseArticleFile(
  filePath: string
): { frontmatter: ArticleFrontmatter; content: string } | null {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error(`Error reading article file ${filePath}:`, error);
    return null;
  }

  const filename = path.basename(filePath, path.extname(filePath));
  const { data, content } = matter(raw);

  const result = FrontmatterSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    console.warn(
      `[articles] Skipping ${filename}.mdx — invalid frontmatter:\n${issues}`
    );
    return null;
  }

  const fm = result.data;
  const frontmatter: ArticleFrontmatter = {
    title: fm.title,
    slug: fm.slug || filename,
    summary: fm.summary,
    date: fm.date,
    updated: fm.updated,
    category: fm.category,
    tags: fm.tags,
    featured: fm.featured,
    draft: fm.draft,
    imageSrc: fm.imageSrc,
    imageAlt: fm.imageAlt,
    author: fm.author,
    contentHash: fm.contentHash,
  };

  return { frontmatter, content };
}

/**
 * Get all published articles (excludes drafts in production)
 */
export async function getArticles(
  locale: ArticleLocale = "zh"
): Promise<ArticlePreview[]> {
  const contentDir = CONTENT_DIRECTORIES[locale];
  const files = getArticleFiles(locale);
  const articles: ArticlePreview[] = [];

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const parsed = parseArticleFile(filePath);

    if (!parsed) continue;
    const { frontmatter, content } = parsed;

    // Skip drafts in production
    if (frontmatter.draft && process.env.NODE_ENV === "production") {
      continue;
    }

    const { time } = calculateReadingTime(content);
    const chapter = extractChapterFromSlug(frontmatter.slug);

    articles.push({
      ...frontmatter,
      readingTime: time,
      chapter,
      publicPath: getPublicArticlePath(frontmatter.slug, locale),
    });
  }

  // Sort by date (newest first), featured articles at top
  return articles.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(
  slug: string,
  locale: ArticleLocale = "zh"
): Promise<Article | null> {
  const contentDir = CONTENT_DIRECTORIES[locale];
  const files = getArticleFiles(locale);

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const parsed = parseArticleFile(filePath);

    if (!parsed) continue;
    const { frontmatter, content } = parsed;

    if (frontmatter.slug === slug) {
      // Skip drafts in production
      if (frontmatter.draft && process.env.NODE_ENV === "production") {
        return null;
      }

      const { time, words } = calculateReadingTime(content);

      return {
        ...frontmatter,
        content,
        readingTime: time,
        wordCount: words,
        publicPath: getPublicArticlePath(frontmatter.slug, locale),
      };
    }
  }

  return null;
}

/**
 * Get all article slugs for static generation
 */
export async function getArticleSlugs(
  locale: ArticleLocale = "zh"
): Promise<string[]> {
  const articles = await getArticles(locale);
  return articles.map((article) => article.slug);
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(
  category: string,
  locale: ArticleLocale = "zh"
): Promise<ArticlePreview[]> {
  const articles = await getArticles(locale);
  return articles.filter(
    (article) =>
      article.category?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get articles by tag
 */
export async function getArticlesByTag(
  tag: string,
  locale: ArticleLocale = "zh"
): Promise<ArticlePreview[]> {
  const articles = await getArticles(locale);
  return articles.filter((article) =>
    article.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Get all unique categories
 */
export async function getCategories(): Promise<string[]> {
  const articles = await getArticles();
  const categories = new Set<string>();

  for (const article of articles) {
    if (article.category) {
      categories.add(article.category);
    }
  }

  return Array.from(categories).sort();
}

/**
 * Get all unique tags
 */
export async function getTags(): Promise<string[]> {
  const articles = await getArticles();
  const tags = new Set<string>();

  for (const article of articles) {
    for (const tag of article.tags) {
      tags.add(tag);
    }
  }

  return Array.from(tags).sort();
}

/**
 * Get related articles based on tags
 */
export async function getRelatedArticles(
  currentSlug: string,
  limit: number = 3,
  locale: ArticleLocale = "zh"
): Promise<ArticlePreview[]> {
  const current = await getArticleBySlug(currentSlug, locale);
  if (!current || !current.tags?.length) return [];

  const articles = await getArticles(locale);

  // Score articles by number of matching tags
  const scored = articles
    .filter((article) => article.slug !== currentSlug)
    .map((article) => {
      const matchingTags =
        article.tags?.filter((tag) => current.tags?.includes(tag)).length || 0;
      return { article, score: matchingTags };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ article }) => article);
}
