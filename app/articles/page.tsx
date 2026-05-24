import { Metadata } from "next";
import { ArticlesBrowser, type ArticleListItem } from "@/components/articles/ArticlesBrowser";
import { siteConfig } from "@/config/siteConfig";
import { getArticles } from "@/lib/mdx/mdx";
import { PageTitle } from "@/components/PageTitle";

export const metadata: Metadata = {
  title: "文章",
  description: `阅读 ${siteConfig.name} 的技术文章与实践记录。`,
  alternates: { canonical: "/articles" },
  openGraph: {
    type: "website",
    url: "/articles",
    title: `文章 | ${siteConfig.name}`,
    description: `阅读 ${siteConfig.name} 的技术文章与实践记录。`,
    images: [
      {
        url: "/images/og/articles.png?v=4",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} 文章`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `文章 | ${siteConfig.name}`,
    description: `阅读 ${siteConfig.name} 的技术文章与实践记录。`,
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
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <PageTitle pageKey="articles" />
      <ArticlesBrowser articles={items} />
    </div>
  );
}
