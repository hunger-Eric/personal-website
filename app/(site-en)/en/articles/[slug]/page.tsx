import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ArticleCard } from "@/components/articles/ArticleCard";
import type { ArticleListItem } from "@/components/articles/ArticlesBrowser";
import { JsonLd } from "@/components/JsonLd";
import { MdxRenderer } from "@/components/mdx/MdxRenderer";
import { publicIdentity } from "@/config/public-identity";
import {
  getArticleBySlug,
  getArticleSlugs,
  getRelatedArticles,
} from "@/lib/mdx/mdx";
import { generateArticleSchema } from "@/lib/structured-data";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getArticleSlugs("en");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, "en");

  if (!article) return { title: "Article Not Found" };

  const canonical = article.publicPath;
  const chinesePath = `/articles/${article.slug}`;
  const ogImages = article.imageSrc
    ? [{ url: article.imageSrc, alt: article.imageAlt || article.title }]
    : undefined;

  return {
    title: article.title,
    description: article.summary,
    authors: [{ name: article.author || publicIdentity.names.en }],
    alternates: {
      canonical,
      languages: {
        "zh-CN": chinesePath,
        en: canonical,
        "x-default": chinesePath,
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: article.title,
      description: article.summary,
      publishedTime: article.date,
      modifiedTime: article.updated || article.date,
      authors: [article.author || publicIdentity.names.en],
      tags: article.tags,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: article.imageSrc ? [article.imageSrc] : undefined,
    },
    ...(article.contentHash
      ? { other: { "article-content-hash": article.contentHash } }
      : {}),
  };
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function EnglishArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, "en");

  if (!article) notFound();

  const relatedArticles = await getRelatedArticles(slug, 3, "en");
  const related: ArticleListItem[] = relatedArticles.map((item) => ({
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    date: item.date,
    category: item.category,
    tags: item.tags,
    featured: item.featured,
    imageSrc: item.imageSrc,
    imageAlt: item.imageAlt,
    readingTime: item.readingTime,
    author: item.author,
    publicPath: item.publicPath,
  }));
  const author = article.author || publicIdentity.names.en;

  return (
    <>
      <JsonLd
        data={generateArticleSchema(
          {
            title: article.title,
            slug: article.slug,
            publicPath: article.publicPath,
            summary: article.summary,
            date: article.date,
            updated: article.updated,
            imageSrc: article.imageSrc,
            tags: article.tags,
            readingTime: article.readingTime,
          },
          "en"
        )}
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <header className="mb-10">
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {article.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm font-semibold">
            <span className="text-foreground">{author}</span>
            <span aria-hidden className="font-normal text-muted-foreground">|</span>
            <span className="text-foreground">{formatDate(article.date)}</span>
          </div>
          {article.summary ? (
            <p className="mt-6 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              {article.summary}
            </p>
          ) : null}
          {article.updated && article.updated !== article.date ? (
            <p className="mt-3 text-xs text-muted-foreground/80">
              Last updated {formatDate(article.updated)}
            </p>
          ) : null}
        </header>

        {article.imageSrc ? (
          <figure className="mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageSrc}
              alt={article.imageAlt || article.title}
              className="w-full rounded-card border border-hairline"
              loading="eager"
              decoding="async"
            />
          </figure>
        ) : null}

        <article className="min-w-0">
          <MdxRenderer source={article.content} />
        </article>

        <nav className="mt-12 flex items-center justify-between border-t border-hairline pt-8">
          <Link
            href="/en/articles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to articles
          </Link>
        </nav>
      </div>

      {related.length > 0 ? (
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="mb-5 text-xl font-semibold">Related articles</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard key={item.slug} article={item} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
