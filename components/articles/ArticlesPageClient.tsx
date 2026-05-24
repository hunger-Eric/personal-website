"use client";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import { ArticlesBrowser, type ArticleListItem } from "./ArticlesBrowser";

type Props = {
  articles: ArticleListItem[];
};

export function ArticlesPageClient({ articles }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <header className="mb-14 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {copy.articles.heading}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {copy.articles.description}
        </p>
      </header>

      <ArticlesBrowser articles={articles} />
    </div>
  );
}
