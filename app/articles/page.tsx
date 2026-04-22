// app/articles/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";
import { getArticles, getCategories, getTags } from "@/lib/mdx/mdx";
import { JsonLd } from "@/components/JsonLd";
import { ShareButton } from "@/components/ShareButton";
import { generateBreadcrumbSchema } from "@/lib/structured-data";
import {
  Calendar,
  Clock,
  Tag,
  Folder,
  ArrowRight,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Articles",
  description: `Read ${siteConfig.name}'s articles about software development, technology, and more.`,
  openGraph: {
    title: `Articles | ${siteConfig.name}`,
    description: `Read ${siteConfig.name}'s articles about software development, technology, and more.`,
  },
};

// Revalidate every hour
export const revalidate = 3600; // 1 hour

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

// Dynamic fallback image generated from title/category when article has no imageSrc
function articleImage(a: { imageSrc?: string; title: string; category?: string }): string {
  if (a.imageSrc) return a.imageSrc;
  const params = new URLSearchParams({
    title: a.title,
    subtitle: a.category || "Article",
  });
  return `/api/og?${params.toString()}`;
}

export default async function ArticlesPage() {
  const articles = await getArticles();
  const categories = await getCategories();
  const tags = await getTags();

  const featuredArticles = articles.filter((a) => a.featured);
  const regularArticles = articles.filter((a) => !a.featured);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Articles", url: "/articles" },
  ];

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between gap-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-accent">
                Home
              </Link>
              <span>/</span>
              <span className="text-foreground">Articles</span>
            </nav>
            <ShareButton label="Share" />
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Articles
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Thoughts, tutorials, and insights about software development,
            technology, and more.
          </p>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Main content */}
          <div className="flex-1">
            {/* Featured articles */}
            {featuredArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="mb-6 text-xl font-semibold">Featured</h2>
                <div className="space-y-6">
                  {featuredArticles.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/articles/${article.slug}`}
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

                      <p className="mb-4 line-clamp-2 text-muted-foreground">
                        {article.summary}
                      </p>

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {article.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag}
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

            {/* All articles */}
            <section>
              <h2 className="mb-6 text-xl font-semibold">
                {featuredArticles.length > 0 ? "All Articles" : "Articles"}
              </h2>

              {regularArticles.length > 0 ? (
                <div className="space-y-4">
                  {regularArticles.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/articles/${article.slug}`}
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
                      <div className="flex-1 min-w-0">
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

                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {article.summary}
                        </p>
                      </div>

                      <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="mb-4 h-16 w-16 text-muted-foreground/50" />
                  <h3 className="mb-2 text-xl font-semibold">
                    No articles yet
                  </h3>
                  <p className="text-muted-foreground">
                    Articles will appear here once they&apos;re published.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          {(categories.length > 0 || tags.length > 0) && (
            <aside className="w-full lg:w-64 lg:flex-shrink-0">
              {/* Categories */}
              {categories.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    <Folder className="h-4 w-4" />
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <span
                        key={category}
                        className="rounded-lg bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
                      >
                        {category}
                      </span>
                    ))}
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
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground hover:bg-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
