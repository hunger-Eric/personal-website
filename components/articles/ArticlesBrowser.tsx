"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

import { ArticleCard } from "./ArticleCard";
import { siteConfig } from "@/config/siteConfig";

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

const PAGE_SIZE = 8;
const AUTHOR_AVATAR = "/images/avatar.jpg";
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

/** Pagination row with ellipses: 1 … 4 [5] 6 … 12 */
function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(set)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push("…");
  }
  return out;
}

/**
 * Single big featured article — image-LEFT, content-RIGHT (50/50 on sm+).
 * Same author/date typography pattern as ArticleCard. No hover-underline.
 */
function FeaturedHero({ article }: { article: ArticleListItem }) {
  const author = article.author || siteConfig.name;
  return (
    <Link
      href={`/articles/${article.slug}`}
      aria-label={`Read latest article: ${article.title}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-accent/50 hover:bg-white/[0.07] sm:flex-row"
    >
      <div className="relative aspect-[16/10] w-full flex-none overflow-hidden bg-white/5 sm:aspect-auto sm:w-1/2 sm:self-stretch">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.imageSrc || FALLBACK_IMG}
          alt={article.imageAlt || article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 p-6 sm:w-1/2 sm:p-8">
        <h2 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl">
          {article.title}
        </h2>
        {article.summary && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {article.summary}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm">
          <span className="relative h-9 w-9 flex-none overflow-hidden rounded-full ring-1 ring-white/10">
            <Image
              src={AUTHOR_AVATAR}
              alt=""
              fill
              sizes="36px"
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

export function ArticlesBrowser({ articles }: Props) {
  // Search is intentionally disabled for now — keeping the pagination state
  // around since the article list is paginated regardless.
  const [page, setPage] = useState(1);

  // Hero = the latest featured article (or just the latest overall). Articles
  // are already sorted newest-first by the loader.
  const heroArticle = useMemo(() => {
    return articles.find((a) => a.featured) || articles[0] || null;
  }, [articles]);

  // The grid lists every article *except* the hero so it never shows twice.
  const regulars = useMemo(() => {
    if (!heroArticle) return articles;
    return articles.filter((a) => a.slug !== heroArticle.slug);
  }, [articles, heroArticle]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(regulars.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = regulars.slice(pageStart, pageStart + PAGE_SIZE);

  const showHero = safePage === 1 && heroArticle != null;

  return (
    <div className="flex flex-col gap-10">
      {showHero && <FeaturedHero article={heroArticle!} />}

      {/* If the hero is the only thing to show (1 article total), skip the
          grid + empty-state entirely. */}
      {!(showHero && regulars.length === 0) && (
        <section>
          <h2 className="mb-5 text-xl font-semibold">All Posts</h2>

          {regulars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-1 text-lg font-semibold">No articles found</h3>
              <p className="text-sm text-muted-foreground">
                Articles will appear here once they're published.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 1}
              aria-label="Previous page"
              className="inline-flex h-9 items-center gap-1 rounded-md border border-white/15 bg-white/5 px-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:bg-white/5"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            {pageNumbers(safePage, totalPages).map((p, i) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  aria-hidden
                  className="px-2 text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-current={p === safePage ? "page" : undefined}
                  aria-label={`Go to page ${p}`}
                  className={[
                    "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
                    p === safePage
                      ? "border border-accent bg-accent text-white"
                      : "border border-white/15 bg-white/5 text-foreground hover:border-accent hover:bg-white/10",
                  ].join(" ")}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage === totalPages}
              aria-label="Next page"
              className="inline-flex h-9 items-center gap-1 rounded-md border border-white/15 bg-white/5 px-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:bg-white/5"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
        </section>
      )}
    </div>
  );
}
