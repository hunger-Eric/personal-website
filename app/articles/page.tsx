// app/articles/page.tsx
import { Metadata } from "next";
import { siteConfig } from "@/config/siteConfig";
import { getArticles } from "@/lib/mdx/mdx";
import {
  ArticlesBrowser,
  type ArticleListItem,
} from "@/components/articles/ArticlesBrowser";

export const metadata: Metadata = {
  title: "Articles",
  description: `Read ${siteConfig.name}'s articles about software development, technology, and more.`,
  alternates: { canonical: "/articles" },
  openGraph: {
    type: "website",
    url: "/articles",
    title: `Articles | ${siteConfig.name}`,
    description: `Read ${siteConfig.name}'s articles about software development, technology, and more.`,
    images: [
      {
        url: "/images/og/articles.png?v=4",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — articles`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Articles | ${siteConfig.name}`,
    description: `Read ${siteConfig.name}'s articles about software development, technology, and more.`,
    images: ["/images/og/articles.png?v=4"],
  },
};

// Revalidate every hour
export const revalidate = 3600; // 1 hour

export default async function ArticlesPage() {
  const articles = await getArticles();

  // Plain serializable items for the client component (drop unused fields)
  const items: ArticleListItem[] = articles.map((a) => ({
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
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Articles
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Thoughts, tutorials, and insights about software development,
          technology, and more.
        </p>
      </header>

      <ArticlesBrowser articles={items} />
    </div>
  );
}
