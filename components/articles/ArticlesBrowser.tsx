"use client";

import { useMemo } from "react";
import { FileText } from "lucide-react";

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
};

type Props = {
  articles: ArticleListItem[];
};

function getCategory(article: ArticleListItem, fallback: string) {
  return article.category || article.tags?.[0] || fallback;
}

export function ArticlesBrowser({ articles }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);

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
    <div className="flex flex-col gap-10">
      {groups.map(({ category, items }) => (
        <section key={category} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold sm:text-2xl">{category}</h2>
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
      ))}
    </div>
  );
}
