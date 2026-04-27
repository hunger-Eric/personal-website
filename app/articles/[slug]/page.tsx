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
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { generateArticleSchema } from "@/lib/structured-data";
import { MdxRenderer } from "@/components/mdx/MdxRenderer";
import { extractToc } from "@/lib/mdx/toc";
import { TableOfContents } from "@/components/articles/TableOfContents";
import { ShareLinks } from "@/components/articles/ShareLinks";
import { Calendar, ArrowLeft } from "lucide-react";

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
      month: "short",
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
  const toc = extractToc(article.content);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Articles", url: "/articles" },
    { name: article.title, url: `/articles/${article.slug}` },
  ];

  const author = article.author || siteConfig.name;
  const articleUrl = `/articles/${article.slug}`;

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

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Breadcrumbs items={breadcrumbs} className="mb-8" />

        {/* Centered article header */}
        <header className="mx-auto mb-10 max-w-3xl text-center">
          {/* Published · By line */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              Published {formatDate(article.date)}
            </span>
            <span aria-hidden>•</span>
            <span>
              By: <span className="font-medium text-foreground">{author}</span>
            </span>
            <span aria-hidden>•</span>
            <span>{article.readingTime} min read</span>
          </div>

          {/* Title */}
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            {article.title}
          </h1>

          {/* Description */}
          {article.summary && (
            <p className="mt-5 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              {article.summary}
            </p>
          )}

          {/* Tag badges */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
              {article.category && (
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                  {article.category}
                </span>
              )}
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Updated notice */}
          {article.updated && article.updated !== article.date && (
            <p className="mt-4 text-xs text-muted-foreground/80">
              Last updated on {formatDate(article.updated)}
            </p>
          )}
        </header>

        {/* Cover image (centered) */}
        {article.imageSrc && (
          <figure className="mx-auto mb-12 max-w-4xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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

        {/* Article body + TOC sidebar */}
        <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-x-12">
          <article className="min-w-0">
            <MdxRenderer source={article.content} />

            {/* Share section */}
            <div className="mt-12 border-t border-white/10 pt-8">
              <ShareLinks
                url={articleUrl}
                title={article.title}
                summary={article.summary}
              />
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
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-accent/50 hover:bg-white/[0.07]"
                    >
                      <p className="mb-1 text-xs text-muted-foreground">
                        {formatDate(related.date)}
                      </p>
                      <h3 className="line-clamp-2 font-medium">
                        <span className="relative inline-block transition-colors group-hover:text-accent after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                          {related.title}
                        </span>
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
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Articles
              </Link>
            </nav>
          </article>

          {/* TOC sidebar — desktop only, sticky */}
          {toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents entries={toc} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
