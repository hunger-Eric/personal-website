"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Tag,
  Folder,
  ArrowRight,
  FileText,
  Search,
  Sparkles,
  X,
} from "lucide-react";

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
  return a.imageSrc || "/images/demo_1.png";
}

export function ArticlesBrowser({ articles, categories, tags }: Props) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<{
    type: "category" | "tag";
    value: string;
  } | null>(null);

  const recent = useMemo(() => {
    return [...articles]
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);
  }, [articles]);

  // Filter pipeline: chip filter first, then text search
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
    const q = query.trim().toLowerCase();
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
  }, [articles, query, activeFilter]);

  const featuredFiltered = filtered.filter((a) => a.featured);
  const regularFiltered = filtered.filter((a) => !a.featured);
  const hasFilter = !!activeFilter || query.trim().length > 0;

  const clearAll = () => {
    setQuery("");
    setActiveFilter(null);
  };

  return (
    <div className="flex flex-col gap-12 lg:flex-row">
      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Search */}
        <div className="relative mb-8">
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
          <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
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

        {/* Featured */}
        {featuredFiltered.length > 0 && !hasFilter && (
          <section className="mb-12">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-4 w-4 text-accent" />
              Featured
            </h2>
            <div className="space-y-6">
              {featuredFiltered.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-accent/50 hover:bg-white/[0.07]"
                >
                  <div className="relative aspect-[21/9] w-full overflow-hidden bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={articleImage(article)}
                      alt={article.imageAlt || article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {article.category && (
                        <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                          <Folder className="h-3 w-3" />
                          {article.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(article.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {article.readingTime} min read
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold group-hover:text-accent">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="mb-4 line-clamp-2 text-muted-foreground">
                        {article.summary}
                      </p>
                    )}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {article.tags.slice(0, 4).map((t) => (
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
              ))}
            </div>
          </section>
        )}

        {/* All / Filtered list */}
        <section>
          <h2 className="mb-6 text-xl font-semibold">
            {hasFilter
              ? "Results"
              : featuredFiltered.length > 0
                ? "All Articles"
                : "Articles"}
          </h2>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
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
            <div className="space-y-4">
              {(hasFilter ? filtered : regularFiltered).map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-start gap-4 rounded-lg border border-transparent p-4 transition-all hover:border-white/10 hover:bg-white/5"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-white/5 sm:h-24 sm:w-32">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={articleImage(article)}
                      alt={article.imageAlt || article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(article.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readingTime} min
                      </span>
                      {article.category && (
                        <span className="rounded bg-white/5 px-1.5 py-0.5">
                          {article.category}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-1 font-medium group-hover:text-accent">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="line-clamp-1 text-sm text-muted-foreground">
                        {article.summary}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-64 lg:flex-shrink-0">
        {/* Recent */}
        {recent.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              <Clock className="h-4 w-4" />
              Recent
            </h3>
            <ul className="space-y-3">
              {recent.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/articles/${a.slug}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group block"
                  >
                    <div className="text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
                      {a.title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(a.date)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

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
                      "rounded-md px-2 py-0.5 text-xs transition-colors",
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
  );
}
