// app/sitemap.ts
import { MetadataRoute } from "next";
import { siteConfig } from "@/config/siteConfig";
import { getArticles } from "@/lib/mdx/mdx";
import { SITE_URL } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/resume`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/links`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  if (siteConfig.sections?.articles) {
    staticPages.push({
      url: `${SITE_URL}/articles`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Articles are sourced from the MDX loader so the sitemap stays in lockstep
  // with content/articles/*.mdx — never the legacy config/articles.json.
  let articlePages: MetadataRoute.Sitemap = [];
  if (siteConfig.sections?.articles) {
    try {
      const articles = await getArticles();
      articlePages = articles.map((article) => {
        const lastModSource = article.updated || article.date;
        const parsed = new Date(lastModSource);
        return {
          url: `${SITE_URL}/articles/${article.slug}`,
          lastModified: Number.isNaN(parsed.getTime()) ? now : parsed,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        };
      });
    } catch (error) {
      console.warn("[sitemap] Failed to load articles:", error);
    }
  }

  return [...staticPages, ...articlePages];
}
