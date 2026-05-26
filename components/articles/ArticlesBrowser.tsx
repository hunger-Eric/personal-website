"use client";

import { useMemo, useState } from "react";
import { FileText, ChevronDown, BookOpen } from "lucide-react";

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

function getChapterTitle(chapter: number, locale: "zh" | "en"): string {
  if (chapter === 0) {
    return locale === "zh" ? "前言 / Preface" : "Preface / 前言";
  }
  const num = locale === "zh" ? "" : "Chapter ";
  const suffix = locale === "zh" ? "章" : "";
  return `${num}${chapter}${suffix}`;
}

function ChapterAccordion({
  chapter,
  articles,
  isOpen,
  onToggle,
}: {
  chapter: number;
  articles: ArticleListItem[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const title = getChapterTitle(chapter, locale);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-semibold">{title}</span>
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {articles.length} {copy.articles.articlesCountSuffix}
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border bg-muted/30 p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrefaceCard({ article }: { article: ArticleListItem }) {
  const { locale } = useLocale();
  const title = locale === "zh" ? "前言 / Preface" : "Preface / 前言";

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5">
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">{title}</span>
        </div>
        <ArticleCard article={article} />
      </div>
    </div>
  );
}

function CategoryGroup({
  title,
  items,
}: {
  title: string;
  items: ArticleListItem[];
}) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          {items.length} {copy.articles.articlesCountSuffix}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}

export function ArticlesBrowser({ articles }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const [openChapters, setOpenChapters] = useState<Set<number>>(new Set()); // All collapsed by default

  const { preface, chapters, nonChapterArticles } = useMemo(() => {
    const prefaceArticle = articles.find((a) => a.chapter === 0);
    const chapterMap = new Map<number, ArticleListItem[]>();

    // Separate chapter articles from non-chapter articles
    const nonChapter: ArticleListItem[] = [];

    for (const article of articles) {
      if (article.chapter !== undefined && article.chapter > 0) {
        if (!chapterMap.has(article.chapter)) {
          chapterMap.set(article.chapter, []);
        }
        chapterMap.get(article.chapter)!.push(article);
      } else if (article.chapter === undefined) {
        // Article has no chapter - treat as regular category article
        nonChapter.push(article);
      }
    }

    // Sort chapters by number
    const sortedChapters = Array.from(chapterMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([chapter, items]) => ({ chapter, items }));

    // Group non-chapter articles by category (original behavior)
    const categoryGroups: { category: string; items: ArticleListItem[] }[] = [];
    if (nonChapter.length > 0) {
      const order: string[] = [];
      const map = new Map<string, ArticleListItem[]>();

      for (const article of nonChapter) {
        const category = getCategory(article, copy.articles.categoryFallback);
        if (!map.has(category)) {
          map.set(category, []);
          order.push(category);
        }
        map.get(category)!.push(article);
      }

      for (const category of order) {
        categoryGroups.push({
          category,
          items: map.get(category) || [],
        });
      }
    }

    return { preface: prefaceArticle, chapters: sortedChapters, nonChapterArticles: categoryGroups };
  }, [articles, copy.articles.categoryFallback]);

  const toggleChapter = (chapter: number) => {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapter)) {
        next.delete(chapter);
      } else {
        next.add(chapter);
      }
      return next;
    });
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

  return (
    <div className="flex flex-col gap-4">
      {/* Preface card at top */}
      {preface && <PrefaceCard article={preface} />}

      {/* Chapter accordions */}
      {chapters.map(({ chapter, items }) => (
        <ChapterAccordion
          key={chapter}
          chapter={chapter}
          articles={items}
          isOpen={openChapters.has(chapter)}
          onToggle={() => toggleChapter(chapter)}
        />
      ))}

      {/* Non-chapter articles grouped by category (fallback for existing tests) */}
      {nonChapterArticles.map(({ category, items }) => (
        <CategoryGroup key={category} title={category} items={items} />
      ))}
    </div>
  );
}
