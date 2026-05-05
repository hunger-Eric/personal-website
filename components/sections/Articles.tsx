// components/sections/Articles.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import {
  SquareArrowOutUpRight,
  BookOpenText,
  PenLine,
  NotebookPen,
  FileText,
  CalendarDays,
  Clock3,
} from "lucide-react";

// ✅ FIX: your config likely exports blogPosts; alias it to "articles"
import { blogPosts as articles } from "../../config/articles";

/**
 * Articles Section (homepage)
 * - Always shows: 1 featured + 2 latest
 * - CTA links to /articles
 */
export function ArticleSection() {
  // Ensure "latest first" ordering (best-effort by date, fallback to original order)
  const ordered = useMemo(() => {
    const list = [...(articles ?? [])];
    list.sort((a: any, b: any) => {
      const da = a?.date ? new Date(a.date).getTime() : 0;
      const db = b?.date ? new Date(b.date).getTime() : 0;

      const aValid = Number.isFinite(da) && da > 0;
      const bValid = Number.isFinite(db) && db > 0;

      if (aValid && bValid) return db - da; // newest first
      if (aValid && !bValid) return -1;
      if (!aValid && bValid) return 1;
      return 0;
    });
    return list;
  }, []);

  if (!ordered.length) return null;

  const featured = ordered.find((post: any) => post.featured) ?? ordered[0];
  const latestTwo = ordered
    .filter((p: any) => p.id !== featured.id)
    .slice(0, 2);

  return (
    <section id="articles" className="py-16 scroll-mt-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <h2 className="font-mono text-base font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
              ~/Articles
            </h2>
            <div className="h-px w-40 bg-white/15 sm:w-72" aria-hidden />
          </div>

          {/* ✅ Moved CTA here (replaces dropdown entirely) */}
          <div className="w-full sm:w-auto">
            <div className="mt-1 flex sm:justify-end">
              <Link
                href="/articles"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition-colors duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white sm:w-auto"
              >
                View articles
                <SquareArrowOutUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Default view only: 1 featured + 2 latest */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <ArticleCard post={featured as Article} wrapperClassName="h-full" />

          <div className="flex h-full flex-col gap-4">
            {latestTwo[0] && (
              <ArticleCard
                post={latestTwo[0] as Article}
                wrapperClassName="flex-1"
              />
            )}
            {latestTwo[1] && (
              <ArticleCard
                post={latestTwo[1] as Article}
                wrapperClassName="flex-1"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Optional alias (in case you later prefer plural naming in imports)
export const ArticlesSection = ArticleSection;

type Article = (typeof articles)[number];

/* ---------- Card ---------- */

function ArticleCard({
  post,
  wrapperClassName = "",
}: {
  post: Article;
  wrapperClassName?: string;
}) {
  const href = getPostHref(post);
  const isExternal = /^https?:\/\//i.test(href);

  const Inner = <ArticleCardInner post={post} />;

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={`block ${wrapperClassName}`}
      >
        {Inner}
      </a>
    );
  }

  return (
    <Link href={href} className={`block ${wrapperClassName}`}>
      {Inner}
    </Link>
  );
}

function ArticleCardInner({ post }: { post: Article }) {
  const date = post.date?.trim() ? formatMonthDayYear(post.date) : "";
  const readTime = post.readTime?.trim()
    ? normalizeReadTime(post.readTime)
    : "";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5 transition-colors duration-200 ease-out hover:border-white/20 hover:bg-white/[0.07]">
      {/* Cover image fills available space */}
      <div className="relative min-h-[140px] w-full flex-1 overflow-hidden bg-white/5">
        {post.imageSrc ? (
          <Image
            src={post.imageSrc}
            alt={post.imageAlt || post.title}
            fill
            sizes="(min-width: 1024px) 520px, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/25 via-violet-500/15 to-sky-500/15" />
        )}
      </div>

      {/* Compact content footer */}
      <div className="flex flex-none flex-col gap-2 p-4 sm:p-5">
        {post.category ? <CategoryBadge category={post.category} /> : null}

        <h4 className="min-w-0 text-[15px] font-semibold leading-snug text-foreground sm:text-base">
          <span className="block min-w-0 break-words line-clamp-2">
            {post.title}
          </span>
        </h4>

        {(date || readTime) && (
          <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-muted-foreground sm:text-[13px]">
            {date ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{date}</span>
              </span>
            ) : null}
            {readTime ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{readTime}</span>
              </span>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}

/* ---------- Helpers ---------- */

function CategoryBadge({ category }: { category: string }) {
  const key = category.toLowerCase().trim();

  const Icon = key.includes("deep")
    ? BookOpenText
    : key.includes("guide")
    ? PenLine
    : key.includes("wiki")
    ? NotebookPen
    : FileText;

  return (
    <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/75">
      <Icon className="h-4 w-4 text-white/65" aria-hidden="true" />
      <span className="leading-none">{category}</span>
    </span>
  );
}

function getPostHref(post: Article): string {
  const p = post as any;
  if (p.href && String(p.href).length > 0) return String(p.href);
  if (p.slug && String(p.slug).length > 0) return `/articles/${String(p.slug)}`;
  if (p.url && String(p.url).length > 0) return String(p.url);
  return "/articles";
}

function formatMonthDayYear(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function normalizeReadTime(input: string): string {
  const trimmed = input.trim();
  if (/read$/i.test(trimmed)) return trimmed;
  return `${trimmed} read`;
}

