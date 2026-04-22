// app/articles/[slug]/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/siteConfig";
import {
  getArticleBySlug,
  getArticleSlugs,
  getRelatedArticles,
} from "@/lib/mdx/mdx";
import { JsonLd } from "@/components/JsonLd";
import { ShareButton } from "@/components/ShareButton";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/lib/structured-data";
import { marked } from "marked";
import {
  Calendar,
  Clock,
  Tag,
  Folder,
  ArrowLeft,
  ArrowRight,
  Share2,
  BookOpen,
} from "lucide-react";

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

  return {
    title: article.title,
    description: article.summary,
    authors: [{ name: article.author || siteConfig.name }],
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      publishedTime: article.date,
      modifiedTime: article.updated || article.date,
      authors: [article.author || siteConfig.name],
      tags: article.tags,
      images: article.imageSrc ? [{ url: article.imageSrc }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
    },
  };
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
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

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Articles", url: "/articles" },
    { name: article.title, url: `/articles/${article.slug}` },
  ];

  // Convert markdown to HTML
  const contentHtml = marked.parse(article.content) as string;

  return (
    <>
      {/* Structured Data */}
      <JsonLd
        data={[
          generateBreadcrumbSchema(breadcrumbs),
          generateArticleSchema({
            title: article.title,
            slug: article.slug,
            summary: article.summary,
            date: article.date,
            updated: article.updated,
            imageSrc: article.imageSrc,
            tags: article.tags,
            readingTime: article.readingTime,
          }),
        ]}
      />

      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Breadcrumbs + share */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-accent">
              Articles
            </Link>
            <span>/</span>
            <span className="truncate text-foreground">{article.title}</span>
          </nav>
          <ShareButton label="Share" />
        </div>

        {/* Header */}
        <header className="mb-12">
          {/* Category and metadata */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {article.category && (
              <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                <Folder className="h-3.5 w-3.5" />
                {article.category}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(article.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.readingTime} min read
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {article.wordCount.toLocaleString()} words
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {article.title}
          </h1>

          {/* Summary */}
          <p className="text-xl text-muted-foreground">{article.summary}</p>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-white/5 px-3 py-1 text-sm text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Updated notice */}
          {article.updated && article.updated !== article.date && (
            <p className="mt-4 text-sm text-muted-foreground/80">
              Last updated on {formatDate(article.updated)}
            </p>
          )}
        </header>

        {/* Cover image */}
        {article.imageSrc && (
          <figure className="mb-12">
            <img
              src={article.imageSrc}
              alt={article.imageAlt || article.title}
              className="w-full rounded-xl border border-white/10"
            />
            {article.imageAlt && (
              <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                {article.imageAlt}
              </figcaption>
            )}
          </figure>
        )}

        {/* Article content */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h2:mt-10 prose-h2:text-2xl
            prose-h3:mt-8 prose-h3:text-xl
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
            prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-[#0d1117]
            prose-img:rounded-xl prose-img:border prose-img:border-white/10
            prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground
            prose-strong:text-foreground
            prose-ul:text-muted-foreground prose-ol:text-muted-foreground
            prose-li:marker:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Share */}
        <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Share2 className="h-4 w-4" />
            <span>Share this article</span>
          </div>
          <div className="flex gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/articles/${article.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 p-2 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              aria-label="Share on Twitter"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/articles/${article.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 p-2 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              aria-label="Share on LinkedIn"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-semibold">Related Articles</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/articles/${related.slug}`}
                  className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-accent/50 hover:bg-white/[0.07]"
                >
                  <p className="mb-1 text-xs text-muted-foreground">
                    {formatDate(related.date)}
                  </p>
                  <h3 className="line-clamp-2 font-medium group-hover:text-accent">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Navigation */}
        <nav className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
          <Link
            href="/articles"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>
        </nav>
      </article>
    </>
  );
}
