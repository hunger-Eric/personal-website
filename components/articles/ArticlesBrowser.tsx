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

const PAGE_SIZE = 9;
const AUTHOR_AVATAR = "/images/avatar.jpg";
const FALLBACK_IMG = "/images/demo_1.png";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function pageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(set)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | "...")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push("...");
  }
  return out;
}

function FeaturedHero({ article }: { article: ArticleListItem }) {
  const author = article.author || siteConfig.name;
  return (
    <Link
      href={`/articles/${article.slug}`}
      aria-label={`阅读文章：${article.title}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-accent/50 hover:bg-white/[0.07] sm:flex-row"
    >
      <div className="relative aspect-video w-full flex-none overflow-hidden bg-white/5 sm:aspect-auto sm:w-1/2 sm:self-stretch">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.imageSrc || FALLBACK_IMG}
          alt={article.imageAlt || article.title}
          className="h-full w-full object-cover"
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
        <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
          <span className="relative h-9 w-9 flex-none overflow-hidden rounded-full ring-1 ring-white/10">
            <Image src={AUTHOR_AVATAR} alt="" fill sizes="36px" className="object-cover" />
          </span>
          <span className="text-foreground">{author}</span>
          <span aria-hidden className="font-normal text-slate-500">|</span>
          <span className="text-foreground">{formatDate(article.date)}</span>
        </div>
      </div>
    </Link>
  );
}

export function ArticlesBrowser({ articles }: Props) {
  const [page, setPage] = useState(1);

  const heroArticle = useMemo(
    () => articles.find((a) => a.featured) || articles[0] || null,
    [articles]
  );
  const regulars = useMemo(
    () => (heroArticle ? articles.filter((a) => a.slug !== heroArticle.slug) : articles),
    [articles, heroArticle]
  );

  const totalPages = Math.max(1, Math.ceil(regulars.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = regulars.slice(pageStart, pageStart + PAGE_SIZE);
  const showHero = safePage === 1 && heroArticle != null;

  return (
    <div className="flex flex-col gap-10">
      {showHero && <FeaturedHero article={heroArticle} />}

      {!(showHero && regulars.length === 0) && (
        <section>
          <h2 className="mb-5 text-xl font-semibold">全部文章</h2>

          {regulars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-1 text-lg font-semibold">还没有文章</h3>
              <p className="text-sm text-muted-foreground">发布后会显示在这里。</p>
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
              aria-label="分页"
              className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => setPage(safePage - 1)}
                disabled={safePage === 1}
                aria-label="上一页"
                className="inline-flex h-9 items-center gap-1 rounded-md border border-white/15 bg-white/5 px-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </button>

              {pageNumbers(safePage, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} aria-hidden className="px-2 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={p === safePage ? "page" : undefined}
                    aria-label={`跳到第 ${p} 页`}
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
                aria-label="下一页"
                className="inline-flex h-9 items-center gap-1 rounded-md border border-white/15 bg-white/5 px-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </section>
      )}
    </div>
  );
}
