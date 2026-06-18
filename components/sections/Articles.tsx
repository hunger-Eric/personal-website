"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";

import { ActionButton, EmptyState, SectionHeader, Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import { blogPosts, type Article } from "@/config/articles";

const copy = getSiteCopy("zh").articles;

function getPostHref(post: Article): string {
  if (post.href?.trim()) return post.href;
  if (post.slug?.trim()) return `/articles/${post.slug}`;
  if (post.url?.trim()) return post.url;
  return "/articles";
}

function normalizeReadTime(input?: string): string {
  const trimmed = input?.trim();
  if (!trimmed) return "";
  if (/read$/i.test(trimmed) || trimmed.endsWith(copy.readTimeSuffix)) return trimmed;
  return `${trimmed} ${copy.readTimeSuffix}`;
}

function formatArticleDate(input?: string): string {
  if (!input) return "";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function sortArticles(items: Article[]) {
  return [...items].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;
    return bTime - aTime;
  });
}

function ArticlePreviewCard({ post, featured = false }: { post: Article; featured?: boolean }) {
  const href = getPostHref(post);
  const isExternal = /^https?:\/\//i.test(href);
  const date = formatArticleDate(post.date);
  const readTime = normalizeReadTime(post.readTime);
  const meta = [post.category || copy.categoryFallback, date, readTime]
    .filter(Boolean)
    .join(" / ");
  const content = (
    <Surface
      as="article"
      tone="paper"
      className={[
        "group flex h-full flex-col justify-between p-5 transition-colors hover:border-accent",
        featured ? "min-h-56" : "min-h-36",
      ].join(" ")}
    >
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
          {date ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {date}
            </span>
          ) : null}
          {readTime ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {readTime}
            </span>
          ) : null}
        </div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {post.category || copy.categoryFallback}
        </p>
        <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground group-hover:text-accent">
          {post.title}
        </h3>
        {post.summary ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {post.summary}
          </p>
        ) : null}
      </div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        {copy.viewAll}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Surface>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" aria-label={`${post.title} / ${meta}`}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} aria-label={`${post.title} / ${meta}`}>
      {content}
    </Link>
  );
}

export function ArticleSection() {
  const ordered = sortArticles(blogPosts);
  if (!ordered.length) {
    return (
      <section id="articles" className="scroll-mt-12 py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <SectionHeader
            eyebrow={copy.heading}
            title={copy.otherArticles}
            description={copy.description}
          />
          <EmptyState
            className="mt-8"
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
        </div>
      </section>
    );
  }

  const featured = ordered.find((post) => post.featured) ?? ordered[0];
  const latest = ordered.filter((post) => post.id !== featured.id).slice(0, 2);

  return (
    <section id="articles" className="scroll-mt-12 py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeader
          eyebrow={copy.heading}
          title={copy.otherArticles}
          description={copy.description}
          actions={
            <ActionButton
              href="/articles"
              tone="secondary"
              icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              {copy.viewAll}
            </ActionButton>
          }
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <ArticlePreviewCard post={featured} featured />
          <div className="grid gap-4">
            {latest.map((post) => (
              <ArticlePreviewCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const ArticlesSection = ArticleSection;
