import { ArticlesPageClient } from "@/components/articles/ArticlesPageClient";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { generateArticleCollectionSchema } from "@/lib/structured-data";

export const metadata = buildPublicPageMetadata({
  title: "Articles and system practice",
  description:
    "Reviewed English writing from SolveReal Systems about enterprise AI systems, automation, and delivery boundaries.",
  path: "/articles",
  locale: "en",
});

export default function EnglishArticlesPage() {
  return (
    <ArticlesPageClient
      articles={[]}
      initialCategory={null}
      structuredData={generateArticleCollectionSchema([], "en")}
    />
  );
}
