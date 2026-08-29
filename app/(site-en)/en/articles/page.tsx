import { ArticlesPageClient } from "@/components/articles/ArticlesPageClient";
import type { ArticleListItem } from "@/components/articles/ArticlesBrowser";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { generateArticleCollectionSchema } from "@/lib/structured-data";
import { getArticles } from "@/lib/mdx/mdx";

export const metadata = buildPublicPageMetadata({
  title: "Articles and system practice",
  description:
    "Reviewed English writing from SolveReal Systems about enterprise AI systems, automation, and delivery boundaries.",
  path: "/articles",
  locale: "en",
});

export default async function EnglishArticlesPage() {
  const articles = await getArticles("en");
  const items: ArticleListItem[] = articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    date: article.date,
    category: article.category,
    tags: article.tags,
    featured: article.featured,
    imageSrc: article.imageSrc,
    imageAlt: article.imageAlt,
    readingTime: article.readingTime,
    author: article.author,
    chapter: article.chapter,
    publicPath: article.publicPath,
  }));
  return (
    <ArticlesPageClient
      articles={items}
      initialCategory={null}
      structuredData={generateArticleCollectionSchema(articles, "en")}
    />
  );
}
