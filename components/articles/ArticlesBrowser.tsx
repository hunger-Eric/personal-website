"use client";

import { useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronLeft, FileText, BookOpen } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import { ArticleCard } from "./ArticleCard";

export type ArticleListItem = {
  slug: string;
  title: string;
  summary?: string;
  date: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  readingTime: number;
  author?: string;
  chapter?: number; // 0 for preface, 1-16 for chapters
};

type Props = {
  articles: ArticleListItem[];
};

function getCategory(article: ArticleListItem, fallback: string) {
  return article.category || article.tags?.[0] || fallback;
}

function getChapterLabel(chapter: number, locale: "zh" | "en"): string {
  if (chapter === 0) {
    return locale === "zh" ? "前言" : "Preface";
  }
  return locale === "zh" ? `第${chapter}章` : `Chapter ${chapter}`;
}

/* ── Category index card ── */
function CategoryCard({
  category,
  count,
  coverImage,
  onClick,
}: {
  category: string;
  count: number;
  coverImage?: string;
  onClick: () => void;
}) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={category}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4 sm:p-5">
        <h3 className="text-lg font-semibold tracking-tight">{category}</h3>
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {count} {copy.articles.articlesCountSuffix}
        </span>
      </div>
    </button>
  );
}

/* ── Chapter row (same for preface & chapters) ── */
function ChapterRow({ article }: { article: ArticleListItem }) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const chapterLabel = article.chapter !== undefined
    ? getChapterLabel(article.chapter, locale)
    : "";
  const author = article.author || "";
  const readingTime =
    article.readingTime && article.readingTime > 0
      ? `${article.readingTime} ${copy.articles.readTimeSuffix}`
      : "";

  return (
    <a
      href={`/articles/${article.slug}`}
      className="group flex items-start gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-muted/50"
    >
      {/* Chapter badge */}
      {chapterLabel && (
        <span className="mt-0.5 shrink-0 inline-flex items-center justify-center rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground min-w-[3.5rem] text-center">
          {chapterLabel}
        </span>
      )}

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <h4 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h4>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {author && <span>{author}</span>}
          {author && <span aria-hidden>·</span>}
          <span>{article.date}</span>
          {readingTime && (
            <>
              <span aria-hidden>·</span>
              <span>{readingTime}</span>
            </>
          )}
        </div>
        {article.summary && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
            {article.summary}
          </p>
        )}
      </div>
    </a>
  );
}

/* ── Category detail view (list of chapters) ── */
function CategoryDetail({
  category,
  articles,
  onBack,
}: {
  category: string;
  articles: ArticleListItem[];
  onBack: () => void;
}) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);

  // Separate chapter articles from non-chapter
  const { chapterArticles, otherArticles } = useMemo(() => {
    const chapters: ArticleListItem[] = [];
    const others: ArticleListItem[] = [];
    for (const a of articles) {
      if (a.chapter !== undefined) {
        chapters.push(a);
      } else {
        others.push(a);
      }
    }
    // Sort: chapter 0 (preface) first, then numeric
    chapters.sort((a, b) => (a.chapter ?? 99) - (b.chapter ?? 99));
    return { chapterArticles: chapters, otherArticles: others };
  }, [articles]);

  return (
    <div>
      {/* Back button + category title */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {locale === "zh" ? "全部分类" : "All Categories"}
        </button>
        <h2 className="text-xl font-semibold sm:text-2xl">{category}</h2>
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {articles.length} {copy.articles.articlesCountSuffix}
        </span>
      </div>

      {/* Chapter list — preface & chapters look identical */}
      {chapterArticles.length > 0 && (
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
          {chapterArticles.map((article) => (
            <ChapterRow key={article.slug} article={article} />
          ))}
        </div>
      )}

      {/* Non-chapter articles fallback (card grid) */}
      {otherArticles.length > 0 && (
        <div className="mt-6">
          {chapterArticles.length > 0 && (
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {locale === "zh" ? "其他文章" : "Other Articles"}
            </h3>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {otherArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main browser ── */
export function ArticlesBrowser({ articles }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read category from URL ?category=xxx — survives browser back/forward
  const activeCategory = searchParams.get("category");

  const selectCategory = useCallback(
    (category: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("category", category);
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const clearCategory = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  // Group articles by category
  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, ArticleListItem[]>();

    for (const article of articles) {
      const category = getCategory(article, copy.articles.categoryFallback);
      if (!map.has(category)) {
        map.set(category, []);
        order.push(category);
      }
      map.get(category)!.push(article);
    }

    return order.map((category) => ({
      category,
      items: map.get(category) || [],
    }));
  }, [articles, copy.articles.categoryFallback]);

  // Get the cover image for a category (first article's image)
  const getCoverImage = (items: ArticleListItem[]): string | undefined => {
    const withImage = items.find((a) => a.imageSrc);
    return withImage?.imageSrc;
  };

  if (!articles.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-1 text-lg font-semibold">{copy.articles.emptyTitle}</h3>
        <p className="text-sm text-muted-foreground">
          {copy.articles.emptyDescription}
        </p>
      </div>
    );
  }

  // Detail view: showing articles of a specific category
  if (activeCategory) {
    const group = groups.find((g) => g.category === activeCategory);
    if (!group) {
      // Category not found — clear URL param
      clearCategory();
      return null;
    }
    return (
      <CategoryDetail
        category={group.category}
        articles={group.items}
        onBack={clearCategory}
      />
    );
  }

  // Index view: category cards
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map(({ category, items }) => (
        <CategoryCard
          key={category}
          category={category}
          count={items.length}
          coverImage={getCoverImage(items)}
          onClick={() => selectCategory(category)}
        />
      ))}
    </div>
  );
}
