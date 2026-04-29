"use client";

import Link from "next/link";
import { Calendar, Clock, Folder } from "lucide-react";

import type { ArticleListItem } from "./ArticlesBrowser";

const FALLBACK_IMG = "/images/demo_1.png";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
  /** Image side width on sm+ — defaults to a comfortable 17rem. */
  imageWidthClass?: string;
};

/**
 * Unified article card used in both the featured carousel and the All-articles
 * list. Image left on sm+, content right; stacks on mobile. The user wanted
 * both surfaces to look identical.
 */
export function ArticleCard({
  article,
  imageWidthClass = "sm:w-64 md:w-72",
}: Props) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors duration-200 hover:border-accent/50 hover:bg-white/[0.07] sm:flex-row"
    >
      {/* Image — left on sm+ */}
      <div
        className={[
          "relative aspect-[16/10] w-full flex-none overflow-hidden bg-white/5 sm:aspect-auto",
          imageWidthClass,
        ].join(" ")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={articleImage(article)}
          alt={article.imageAlt || article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      {/* Content — right on sm+. Stacked vertically so each piece of meta gets
          its own line: category → date+read → title → summary → tags. */}
      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        {article.category && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              <Folder className="h-3 w-3" />
              {article.category}
            </span>
          </div>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(article.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {article.readingTime} min read
          </span>
        </div>

        <h3 className="mb-2 text-xl font-semibold">
          <span className="relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 group-hover:after:scale-x-100">
            {article.title}
          </span>
        </h3>

        {article.summary && (
          <p className="mb-4 line-clamp-2 text-muted-foreground">
            {article.summary}
          </p>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5">
            {article.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
