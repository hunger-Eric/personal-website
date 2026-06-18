"use client";

import { Suspense } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { PageShell, SectionHeader } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import { ArticlesBrowser, type ArticleListItem } from "./ArticlesBrowser";

type Props = {
  articles: ArticleListItem[];
};

function ArticlesBrowserFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
    </div>
  );
}

export function ArticlesPageClient({ articles }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);

  return (
    <PageShell tone="public" className="min-h-screen px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <main className="mx-auto w-full max-w-7xl">
        <SectionHeader
          eyebrow="Knowledge Archive"
          title={copy.articles.heading}
          description={copy.articles.description}
          className="mb-10"
        />

        <Suspense fallback={<ArticlesBrowserFallback />}>
          <ArticlesBrowser articles={articles} />
        </Suspense>
      </main>
    </PageShell>
  );
}
