"use client";

import Image from "next/image";
import Link from "next/link";

import { useLocale } from "@/components/LocaleProvider";
import { Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import { formatLocalizedDate } from "@/config/locale-utils";
import { siteConfig } from "@/config/siteConfig";
import type { ArticleListItem } from "./ArticlesBrowser";

type Props = {
  article: ArticleListItem;
};

export function ArticleCard({ article }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const author = article.author || siteConfig.name;
  const category =
    article.category || article.tags?.[0] || copy.articles.categoryFallback;
  const formattedDate = article.date ? formatLocalizedDate(article.date, locale) : "";
  const readingTime =
    article.readingTime && article.readingTime > 0
      ? `${article.readingTime} ${copy.articles.readTimeSuffix}`
      : "";

  return (
    <Link href={`/articles/${article.slug}`} className="group block h-full">
      <Surface
        tone="paper"
        className="flex h-full flex-col overflow-hidden shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-overlay"
      >
        {article.imageSrc ? (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={article.imageSrc}
              alt={article.imageAlt || article.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute left-3 top-3 rounded-full border border-hairline bg-surface-paper-elevated/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
              {category}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center px-4 pt-4">
            <span className="rounded-full border border-hairline bg-surface-paper-elevated px-3 py-1 text-xs font-medium text-foreground">
              {category}
            </span>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
            <span className="block line-clamp-2">{article.title}</span>
          </h3>

          {article.summary ? (
            <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {article.summary}
            </p>
          ) : (
            <div className="flex-1" />
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
            <span className="text-foreground">{author}</span>
            <span aria-hidden className="text-muted-foreground/70">
              /
            </span>
            <span>{formattedDate}</span>
            {readingTime ? (
              <>
                <span aria-hidden className="text-muted-foreground/70">
                  /
                </span>
                <span>{readingTime}</span>
              </>
            ) : null}
          </div>
        </div>
      </Surface>
    </Link>
  );
}
