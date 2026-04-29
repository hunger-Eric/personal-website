"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Tag,
  Folder,
  FileText,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { ArticleCard } from "./ArticleCard";
import { FeaturedArticlesCarousel } from "./FeaturedArticlesCarousel";

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
};

type Props = {
  articles: ArticleListItem[];
  categories: string[];
  tags: string[];
};

const PAGE_SIZE = 6;

/**
 * Build the visible page-number row with ellipses.
 *   1 … 4 [5] 6 … 12
 */
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

export function ArticlesBrowser({ articles, categories, tags }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<{
    type: "category" | "tag";
    value: string;
  } | null>(null);
  const [page, setPage] = useState(1);

  // Debounce search input — 150ms is fast enough to feel live but cheap.
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 150);
    return () => window.clearTimeout(t);
  }, [query]);

  // Reset to page 1 when search/filter changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, activeFilter]);

  const featured = useMemo(() => articles.filter((a) => a.featured), [articles]);

  // Filter pipeline: chip filter first, then text search.
  const filtered = useMemo(() => {
    let list = articles;
    if (activeFilter) {
      const v = activeFilter.value.toLowerCase();
      if (activeFilter.type === "category") {
        list = list.filter((a) => a.category?.toLowerCase() === v);
      } else {
        list = list.filter((a) =>
          a.tags?.some((t) => t.toLowerCase() === v)
        );
      }
    }
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) => {
      const haystack = [
        a.title,
        a.summary ?? "",
        a.category ?? "",
        ...(a.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [articles, debouncedQuery, activeFilter]);

  const hasFilter = !!activeFilter || debouncedQuery.trim().length > 0;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const clearAll = () => {
    setQuery("");
    setActiveFilter(null);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Featured carousel — full width, sits ABOVE the sidebar + list */}
      {featured.length > 0 && !hasFilter && (
        <FeaturedArticlesCarousel articles={featured} />
      )}

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-8">
      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Search */}
        <div className="relative mb-6">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles by title, summary, tag, or category…"
            aria-label="Search articles"
            className="h-11 w-full rounded-lg border border-white/15 bg-white/5 pl-9 pr-10 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground/70 focus:border-accent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Active filter chip */}
        {activeFilter && (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Filtering by:</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
              {activeFilter.type === "category" ? (
                <Folder className="h-3 w-3" />
              ) : (
                <Tag className="h-3 w-3" />
              )}
              {activeFilter.value}
              <button
                type="button"
                onClick={() => setActiveFilter(null)}
                aria-label="Clear filter"
                className="ml-1 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-accent/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}

        {/* Result count when filtered */}
        {hasFilter && (
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filtered.length} {filtered.length === 1 ? "match" : "matches"}
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-accent transition-colors hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* All / Filtered list — same card style as the featured carousel */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">
            {hasFilter ? "Results" : "All Articles"}
          </h2>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-1 text-lg font-semibold">No articles found</h3>
              <p className="text-sm text-muted-foreground">
                {hasFilter
                  ? "Try a different search or clear your filters."
                  : "Articles will appear here once they're published."}
              </p>
              {hasFilter && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:bg-white/10"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            // Cards — image left, content right (matches the featured carousel)
            <div className="space-y-5">
              {pageItems.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}

          {/* Pagination */}
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
      </div>

      {/* Sidebar — Categories → Recent → Tags → Share */}
      <aside className="w-full lg:w-60 lg:flex-shrink-0">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <Folder className="h-4 w-4" />
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active =
                  activeFilter?.type === "category" &&
                  activeFilter.value === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setActiveFilter(
                        active ? null : { type: "category", value: c }
                      )
                    }
                    className={[
                      "rounded-lg px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-accent/15 text-accent"
                        : "bg-white/5 text-foreground hover:bg-white/10",
                    ].join(" ")}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <Tag className="h-4 w-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => {
                const active =
                  activeFilter?.type === "tag" && activeFilter.value === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setActiveFilter(
                        active ? null : { type: "tag", value: t }
                      )
                    }
                    className={[
                      "rounded-md px-2 py-1 text-xs transition-colors",
                      active
                        ? "bg-accent/15 text-accent"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>
      </div>
    </div>
  );
}
