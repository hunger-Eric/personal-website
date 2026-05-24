// components/PageTitle.tsx
// Client component that renders a localized page header using the locale system.
"use client";

import { useLocale } from "@/components/LocaleProvider";

interface PageTitleProps {
  /** Translation key prefix, e.g. "articles" → t.pages.articlesTitle */
  pageKey: "articles" | "photography";
  /** Show description paragraph */
  showDescription?: boolean;
}

export function PageTitle({ pageKey, showDescription = true }: PageTitleProps) {
  const { t } = useLocale();
  const title = t.pages[`${pageKey}Title` as keyof typeof t.pages];
  const descKey = `${pageKey}Description` as keyof typeof t.pages;
  const description = t.pages[descKey];

  return (
    <header className="mb-10 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      {showDescription && description && (
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}
