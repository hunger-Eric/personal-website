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
  if (!articles?.length) return null;

  // Ensure "latest first" ordering (best-effort by date, fallback to original order)
  const ordered = useMemo(() => {
    const list = [...articles];
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
            <div className="h-px flex-1 bg-white/10" aria-hidden />
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
          <ArticleCard
            post={featured as Article}
            variant="featured"
            wrapperClassName="h-full"
          />

          <div className="flex h-full flex-col gap-4">
            {latestTwo[0] && (
              <ArticleCard
                post={latestTwo[0] as Article}
                variant="stack"
                wrapperClassName="flex-1"
              />
            )}
            {latestTwo[1] && (
              <ArticleCard
                post={latestTwo[1] as Article}
                variant="stack"
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
type Variant = "featured" | "stack";

/* ---------- Cards ---------- */

function ArticleCard({
  post,
  variant,
  wrapperClassName = "",
}: {
  post: Article;
  variant: Variant;
  wrapperClassName?: string;
}) {
  const href = getPostHref(post);
  const isExternal = /^https?:\/\//i.test(href);

  const CardInner =
    variant === "featured" ? (
      <FeaturedCardInner post={post} />
    ) : (
      <StackCardInner post={post} />
    );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`block ${wrapperClassName}`}
      >
        {CardInner}
      </a>
    );
  }

  return (
    <Link href={href} className={`block ${wrapperClassName}`}>
      {CardInner}
    </Link>
  );
}

function FeaturedCardInner({ post }: { post: Article }) {
  const summaryMobile = post.summary ? truncateText(post.summary, 170) : "";
  const summaryDesktop = post.summary ? truncateText(post.summary, 220) : "";

  const date = post.date?.trim() ? formatMonthDayYear(post.date) : "";
  const readTime = post.readTime?.trim()
    ? normalizeReadTime(post.readTime)
    : "";

  return (
    <article className="group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5 text-sm text-muted-foreground shadow-sm sm:min-h-[470px] sm:text-base">
      <div className="relative flex-[3] overflow-hidden px-3 pb-1 pt-3">
        <div className="relative h-full w-full overflow-hidden rounded-md border border-white/10 bg-white/5">
          {post.imageSrc ? (
            <Image
              src={post.imageSrc}
              alt={post.imageAlt || post.title}
              fill
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="absolute inset-0 bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-[2] flex-col px-4 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
        {post.category ? (
          <div className="mt-2 flex items-center">
            <CategoryBadge category={post.category} />
          </div>
        ) : null}

        <h4 className="mt-2 min-w-0 text-[15px] font-semibold leading-snug text-foreground sm:text-base">
          <span className="block min-w-0 break-words line-clamp-2">
            <span>{post.title}</span>
          </span>
        </h4>

        {summaryMobile && (
          <>
            <p className="mt-3 text-xs text-muted-foreground sm:hidden">
              {summaryMobile}
            </p>
            <p className="mt-3 hidden text-xs text-muted-foreground sm:block sm:text-sm">
              {summaryDesktop}
            </p>
          </>
        )}

        {(date || readTime) && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] font-medium text-white/90">
            {date ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays
                  className="h-4 w-4 text-white/70"
                  aria-hidden="true"
                />
                <span>{date}</span>
              </span>
            ) : null}
            {readTime ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-white/70" aria-hidden="true" />
                <span>{readTime}</span>
              </span>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}

function StackCardInner({ post }: { post: Article }) {
  const summaryMobile = post.summary ? truncateText(post.summary, 140) : "";
  const summaryDesktop = post.summary ? truncateText(post.summary, 180) : "";

  const date = post.date?.trim() ? formatMonthDayYear(post.date) : "";
  const readTime = post.readTime?.trim()
    ? normalizeReadTime(post.readTime)
    : "";

  return (
    <article
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground shadow-sm",
        "sm:justify-center sm:p-5 sm:text-base",
        // ✅ subtle hover bg/border/shadow like ProjectCard (very light)
        "transition-colors transition-shadow duration-200 ease-out",
        "hover:bg-white/[0.07] hover:border-white/15 hover:shadow-sm",
      ].join(" ")}
    >
      <div className="sm:hidden">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border border-white/10 bg-white/5">
          {post.imageSrc ? (
            <Image
              src={post.imageSrc}
              alt={post.imageAlt || post.title}
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-white/5" />
          )}
        </div>
      </div>

      {post.category ? (
        <div className="mt-3 flex items-center sm:mt-0">
          <CategoryBadge category={post.category} />
        </div>
      ) : null}

      <h4 className="mt-2 min-w-0 text-[15px] font-semibold leading-snug text-foreground sm:text-base">
        <span className="block min-w-0 break-words line-clamp-2">
          <span className="bg-[length:0%_2px] bg-left-bottom bg-no-repeat bg-gradient-to-r from-white/70 to-white/70 transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_2px]">
            {post.title}
          </span>
        </span>
      </h4>

      {summaryMobile && (
        <>
          <p className="mt-3 text-xs text-muted-foreground sm:hidden">
            {summaryMobile}
          </p>
          <p className="mt-3 hidden text-xs text-muted-foreground sm:block sm:text-sm">
            {summaryDesktop}
          </p>
        </>
      )}

      {(date || readTime) && (
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] font-medium text-white/90">
          {date ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays
                className="h-4 w-4 text-white/70"
                aria-hidden="true"
              />
              <span>{date}</span>
            </span>
          ) : null}
          {readTime ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-white/70" aria-hidden="true" />
              <span>{readTime}</span>
            </span>
          ) : null}
        </div>
      )}
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

function truncateText(text: string, maxChars: number): string {
  const clean = text.trim();
  if (clean.length <= maxChars) return clean;
  return clean.slice(0, Math.max(0, maxChars - 1)).trimEnd() + "…";
}
