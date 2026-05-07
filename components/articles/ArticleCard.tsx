"use client";

import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/siteConfig";
import type { ArticleListItem } from "./ArticlesBrowser";

const FALLBACK_IMG = "/images/demo_1.png";
const AUTHOR_AVATAR = "/images/avatar.jpg";

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
};

/**
 * Vertical article card — image on top, content below. Used for every card
 * except the page-1 hero. Author and date render in white (foreground)
 * separated by a muted "|"; no hover-underline animation.
 */
export function ArticleCard({ article }: Props) {
  const author = (article as { author?: string }).author || siteConfig.name;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors duration-200 hover:border-accent/50 hover:bg-white/[0.07]"
    >
      <div className="relative aspect-[16/10] w-full flex-none overflow-hidden bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={articleImage(article)}
          alt={article.imageAlt || article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-semibold leading-snug text-foreground">
          {article.title}
        </h3>

        {article.summary && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 text-xs">
          <span className="relative h-8 w-8 flex-none overflow-hidden rounded-full ring-1 ring-white/10">
            <Image
              src={AUTHOR_AVATAR}
              alt=""
              fill
              sizes="32px"
              className="object-cover"
            />
          </span>
          <span className="text-foreground">{author}</span>
          <span aria-hidden className="text-muted-foreground/60">
            |
          </span>
          <span className="text-foreground">{formatDate(article.date)}</span>
        </div>
      </div>
    </Link>
  );
}
