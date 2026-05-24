// app/articles/[slug]/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import {
  getArticleBySlug,
  getArticleSlugs,
  getRelatedArticles,
} from "@/lib/mdx/mdx";
import { JsonLd } from "@/components/JsonLd";
import { generateArticleSchema } from "@/lib/structured-data";
import { MdxRenderer } from "@/components/mdx/MdxRenderer";
import { ArticleCard } from "@/components/articles/ArticleCard";
import type { ArticleListItem } from "@/components/articles/ArticlesBrowser";

// Fully static — MDX is bundled at build time; fs access at runtime is not
// available on Cloudflare Workers so we skip revalidation entirely.
export const dynamic = "force-static";
export const dynamicParams = false;

// Generate static paths
export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const canonical = `/articles/${article.slug}`;
  const ogImages = article.imageSrc
    ? [{ url: article.imageSrc, alt: article.imageAlt || article.title }]
    : undefined;

  return {
    title: article.title,
    description: article.summary,
    authors: [{ name: article.author || siteConfig.name }],
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: article.title,
      description: article.summary,
      publishedTime: article.date,
      modifiedTime: article.updated || article.date,
      authors: [article.author || siteConfig.name],
      tags: article.tags,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: article.imageSrc ? [article.imageSrc] : undefined,
    },
  };
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(slug, 3);

  const author = article.author || siteConfig.name;

  // Map related articles to the shared ArticleListItem shape so the
  // ArticleCard renders them identically to /articles.
  const related: ArticleListItem[] = relatedArticles.map((a) => ({
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    date: a.date,
    category: a.category,
    tags: a.tags,
    featured: a.featured,
    imageSrc: a.imageSrc,
    imageAlt: a.imageAlt,
    readingTime: a.readingTime,
    author: a.author,
  }));

  return (
    <>
      {/* Structured Data */}
      <JsonLd
        data={generateArticleSchema({
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          date: article.date,
          updated: article.updated,
          imageSrc: article.imageSrc,
          tags: article.tags,
          readingTime: article.readingTime,
        })}
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        {/* Left-aligned header — no breadcrumb, no TOC sidebar */}
        <header className="mb-10">
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {article.title}
          </h1>

          {/* Author + date — same typography as the cards, "|" separator */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm font-semibold">
            <span className="text-foreground">{author}</span>
            <span aria-hidden className="font-normal text-slate-500">
              |
            </span>
            <span className="text-foreground">{formatDate(article.date)}</span>
          </div>

          {article.summary && (
            <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              {article.summary}
            </p>
          )}

          {article.updated && article.updated !== article.date && (
            <p className="mt-3 text-xs text-muted-foreground/80">
              最后更新于 {formatDate(article.updated)}
            </p>
          )}
        </header>

        {/* Cover image */}
        {article.imageSrc && (
          <figure className="mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageSrc}
              alt={article.imageAlt || article.title}
              className="w-full rounded-xl border border-white/10"
              loading="eager"
              decoding="async"
            />
          </figure>
        )}

        {/* Body — single column, no TOC sidebar */}
        <article className="min-w-0">
          <MdxRenderer source={article.content} />
        </article>

        {/* Back to all */}
        <nav className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            返回文章列表
          </Link>
        </nav>
      </div>

      {/* Related posts — same horizontal ArticleCard, on the wider container
          so the cards have room. 1 → 2 → 3 cols by breakpoint. */}
      {related.length > 0 && (
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="mb-5 text-xl font-semibold">相关文章</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ArticleCard key={r.slug} article={r} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
