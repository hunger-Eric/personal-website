// app/articles/page.tsx
import { Metadata } from "next";
import { siteConfig } from "@/config/siteConfig";
import { getArticles, getCategories, getTags } from "@/lib/mdx/mdx";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  ArticlesBrowser,
  type ArticleListItem,
} from "@/components/articles/ArticlesBrowser";

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

export default async function ArticlesPage() {
  const articles = await getArticles();
  const categories = await getCategories();
  const tags = await getTags();

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
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12">
        <Breadcrumbs
          items={[
            { name: "Home", url: "/" },
            { name: "Articles", url: "/articles" },
          ]}
        />

        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Articles
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Thoughts, tutorials, and insights about software development,
          technology, and more.
        </p>
      </div>

      <ArticlesBrowser articles={items} categories={categories} tags={tags} />
    </div>
  );
}
