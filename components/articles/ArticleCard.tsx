"use client";

import Image from "next/image";
import Link from "next/link";

import { useLocale } from "@/components/LocaleProvider";
import { getSiteCopy } from "@/config/contentCopy";
import { siteConfig } from "@/config/siteConfig";
import type { ArticleListItem } from "./ArticlesBrowser";

const FALLBACK_IMG = "/images/demo_1.png";

function formatDate(dateStr: string, locale: "zh" | "en"): string {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: locale === "zh" ? "numeric" : "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function articleImage(a: { imageSrc?: string }): string {
  return a.imageSrc || FALLBACK_IMG;
}

type Props = {
  article: ArticleListItem;
};

export function ArticleCard({ article }: Props) {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale);
  const author = (article as { author?: string }).author || siteConfig.name;
  const category = article.category || article.tags?.[0] || copy.articles.categoryFallback;
  const formattedDate = article.date ? formatDate(article.date, locale) : "";
  const readingTime =
    article.readingTime && article.readingTime > 0
      ? `${article.readingTime} ${copy.articles.readTimeSuffix}`
      : "";

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-sm"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={articleImage(article)}
          alt={article.imageAlt || article.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 rounded-full border border-border bg-card/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
          {category}
        </div>
      </div>

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
            ·
          </span>
          <span>{formattedDate}</span>
          {readingTime ? (
            <>
              <span aria-hidden className="text-muted-foreground/70">
                ·
              </span>
              <span>{readingTime}</span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
