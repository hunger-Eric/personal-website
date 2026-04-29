"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Folder,
  Sparkles,
} from "lucide-react";

import type { ArticleListItem } from "./ArticlesBrowser";

type Props = {
  articles: ArticleListItem[];
  intervalMs?: number;
};

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

/**
 * Auto-advancing featured carousel: full-bleed cover image with article title,
 * meta and summary overlaid on a darkening gradient. Slides crossfade rather
 * than remounting so the image stays steady during transitions.
 */
export function FeaturedArticlesCarousel({
  articles,
  intervalMs = 6000,
}: Props) {
  const items = articles.filter(Boolean);
  const count = items.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [count, paused, intervalMs]);

  if (count === 0) return null;
  const safe = Math.min(index, count - 1);
  const active = items[safe];

  const go = (delta: number) => {
    setIndex((i) => (i + delta + count) % count);
  };

  return (
    <section
      aria-label="Featured articles"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Featured
        </h2>
      </div>

      {/* Slide stage — full-bleed hero card. We render every slide in the same
          stack and crossfade opacity so the image never blanks out between
          transitions. */}
      <Link
        href={`/articles/${active.slug}`}
        aria-label={`Read featured article: ${active.title}`}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:aspect-[21/9]"
      >
        {items.map((article, i) => (
          <div
            key={article.slug}
            aria-hidden={i !== safe}
            className={[
              "absolute inset-0 transition-opacity duration-700 ease-out",
              i === safe ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageSrc || FALLBACK_IMG}
              alt={article.imageAlt || article.title}
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              loading={i === 0 ? "eager" : "lazy"}
            />
            {/* Darkening gradient — heavier at the bottom for legible overlay */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/15"
            />
          </div>
        ))}

        {/* Overlay content — pinned to the bottom-left of the hero. */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 md:p-10">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-white/80 sm:text-sm">
              {active.category && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  <Folder className="h-3 w-3" aria-hidden />
                  {active.category}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" aria-hidden />
                {formatDate(active.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {active.readingTime} min read
              </span>
            </div>
            <h3 className="text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl">
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
                {active.title}
              </span>
            </h3>
            {active.summary && (
              <p className="mt-3 hidden max-w-xl text-sm leading-relaxed text-white/80 sm:block sm:text-base">
                {active.summary}
              </p>
            )}
          </div>
        </div>

        {/* Prev / Next buttons — sit on top of the gradient so they're legible
            against any image. */}
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous featured article"
              onClick={(e) => {
                e.preventDefault();
                go(-1);
              }}
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:inline-flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next featured article"
              onClick={(e) => {
                e.preventDefault();
                go(1);
              }}
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:inline-flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </Link>

      {/* Dots */}
      {count > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to featured slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={[
                "h-1.5 rounded-full transition-all",
                i === safe
                  ? "w-8 bg-accent"
                  : "w-3 bg-white/30 hover:bg-white/50",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
