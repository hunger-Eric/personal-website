import { Metadata } from "next";

import { ArticlesPageClient } from "@/components/articles/ArticlesPageClient";
import type { ArticleListItem } from "@/components/articles/ArticlesBrowser";
import { siteConfig } from "@/config/siteConfig";
import { getArticles } from "@/lib/mdx/mdx";

export const metadata: Metadata = {
  title: `Articles | ${siteConfig.name}`,
  description: "Notes on software development, product practice, and personal learning.",
  alternates: { canonical: "/articles" },
  openGraph: {
    type: "website",
    url: "/articles",
    title: `Articles | ${siteConfig.name}`,
    description: "Notes on software development, product practice, and personal learning.",
    images: [
      {
        url: "/images/og/articles.png?v=4",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Articles`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Articles | ${siteConfig.name}`,
    description: "Notes on software development, product practice, and personal learning.",
    images: ["/images/og/articles.png?v=4"],
  },
};

export const revalidate = 3600;

export default async function ArticlesPage() {
  const articles = await getArticles();
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
    chapter: a.chapter,
  }));

  return <ArticlesPageClient articles={items} />;
}
