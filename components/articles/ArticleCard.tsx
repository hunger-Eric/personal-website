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
 * Horizontal article card — image takes the same width as the content half
 * (50/50 on sm+), stacks on mobile. Author + date use the same typography
 * separated by a thin "|" divider. No hover-underline animation.
 */
export function ArticleCard({ article }: Props) {
  const author = (article as { author?: string }).author || siteConfig.name;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors duration-200 hover:border-accent/50 hover:bg-white/[0.07] sm:flex-row"
    >
      {/* Image — takes the same horizontal half as the content on sm+ */}
      <div className="relative aspect-[16/10] w-full flex-none overflow-hidden bg-white/5 sm:aspect-auto sm:w-1/2 sm:self-stretch">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={articleImage(article)}
          alt={article.imageAlt || article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 p-5 sm:w-1/2">
        <h3 className="text-lg font-semibold leading-snug text-foreground">
          {article.title}
        </h3>

        {article.summary && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
        )}

        {/* Author + " | " + date — same color/size/weight */}
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative h-8 w-8 flex-none overflow-hidden rounded-full ring-1 ring-white/10">
            <Image
              src={AUTHOR_AVATAR}
              alt=""
              fill
              sizes="32px"
              className="object-cover"
            />
          </span>
          <span>{author}</span>
          <span aria-hidden className="text-muted-foreground/60">
            |
          </span>
          <span>{formatDate(article.date)}</span>
        </div>
      </div>
    </Link>
  );
}
