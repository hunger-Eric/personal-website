"use client";

import { useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { BookOpen, ChevronLeft, FileText } from "lucide-react";

import { useLocale } from "@/components/LocaleProvider";
import { ActionButton, ArchiveCard, EmptyState, Surface } from "@/components/system";
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
  chapter?: number;
};

type Props = {
  articles: ArticleListItem[];
};

function getCategory(article: ArticleListItem, fallback: string) {
  return article.category || article.tags?.[0] || fallback;
}

function getChapterLabel(
  chapter: number,
  copy: ReturnType<typeof getSiteCopy>
): string {
  if (chapter === 0) return copy.articles.preface;
  return `${copy.articles.chapterPrefix} ${chapter}${copy.articles.chapterSuffix}`;
}

function CategoryCard({
  category,
  count,
  coverImage,
  countSuffix,
  onClick,
}: {
  category: string;
  count: number;
  coverImage?: string;
  countSuffix: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-card border border-hairline bg-surface-paper-elevated text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-overlay"
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
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
        <h3 className="min-w-0 text-lg font-semibold tracking-tight text-foreground">
          {category}
        </h3>
        <span className="inline-flex shrink-0 items-center rounded-full border border-hairline bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {count} {countSuffix}
        </span>
      </div>
    </button>
  );
}

function ChapterRow({
  article,
  copy,
}: {
  article: ArticleListItem;
  copy: ReturnType<typeof getSiteCopy>;
}) {
  const chapterLabel =
    article.chapter !== undefined ? getChapterLabel(article.chapter, copy) : "";
  const author = article.author || "";
  const readingTime =
    article.readingTime && article.readingTime > 0
      ? `${article.readingTime} ${copy.articles.readTimeSuffix}`
      : "";

  return (
    <ArchiveCard
      href={`/articles/${article.slug}`}
      title={article.title}
      description={article.summary}
      meta={
        <span className="flex flex-wrap items-center gap-2">
          {chapterLabel ? <span>{chapterLabel}</span> : null}
          {author ? <span>{author}</span> : null}
          <span>{article.date}</span>
          {readingTime ? <span>{readingTime}</span> : null}
        </span>
      }
    />
  );
}

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

  const { chapterArticles, otherArticles } = useMemo(() => {
    const chapters: ArticleListItem[] = [];
    const others: ArticleListItem[] = [];
    for (const article of articles) {
      if (article.chapter !== undefined) chapters.push(article);
      else others.push(article);
    }
    chapters.sort((a, b) => (a.chapter ?? 99) - (b.chapter ?? 99));
    return { chapterArticles: chapters, otherArticles: others };
  }, [articles]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <ActionButton
          type="button"
          tone="secondary"
          onClick={onBack}
          icon={<ChevronLeft className="h-4 w-4" aria-hidden />}
        >
          {copy.articles.allCategories}
        </ActionButton>
        <h2 className="text-xl font-semibold sm:text-2xl">{category}</h2>
        <span className="inline-flex items-center rounded-full border border-hairline bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {articles.length} {copy.articles.articlesCountSuffix}
        </span>
      </div>

      {chapterArticles.length > 0 ? (
        <Surface tone="paper" className="px-5">
          {chapterArticles.map((article) => (
            <ChapterRow key={article.slug} article={article} copy={copy} />
          ))}
        </Surface>
      ) : null}

      {otherArticles.length > 0 ? (
        <div className="mt-6">
          {chapterArticles.length > 0 ? (
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {copy.articles.otherArticles}
            </h3>
          ) : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {otherArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ArticlesBrowser({ articles }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
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

  const getCoverImage = (items: ArticleListItem[]): string | undefined =>
    items.find((article) => article.imageSrc)?.imageSrc;

  if (!articles.length) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" aria-hidden />}
        title={copy.articles.emptyTitle}
        description={copy.articles.emptyDescription}
      />
    );
  }

  if (activeCategory) {
    const group = groups.find((item) => item.category === activeCategory);
    if (!group) {
      return (
        <EmptyState
          icon={<FileText className="h-12 w-12" aria-hidden />}
          title={copy.articles.emptyTitle}
          description={copy.articles.emptyDescription}
          action={
            <ActionButton type="button" onClick={clearCategory}>
              {copy.articles.allCategories}
            </ActionButton>
          }
        />
      );
    }

    return (
      <CategoryDetail
        category={group.category}
        articles={group.items}
        onBack={clearCategory}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map(({ category, items }) => (
        <CategoryCard
          key={category}
          category={category}
          count={items.length}
          countSuffix={copy.articles.articlesCountSuffix}
          coverImage={getCoverImage(items)}
          onClick={() => selectCategory(category)}
        />
      ))}
    </div>
  );
}
