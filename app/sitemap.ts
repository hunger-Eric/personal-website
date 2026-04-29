// app/sitemap.ts
import { MetadataRoute } from "next";
import { siteConfig } from "@/config/siteConfig";
import { loadProjects } from "@/config/projects";
import { getArticles } from "@/lib/mdx/mdx";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://kevintrinh.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/resume`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/connect`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  if (siteConfig.sections?.projects) {
    staticPages.push({
      url: `${BASE_URL}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  if (siteConfig.sections?.articles) {
    staticPages.push({
      url: `${BASE_URL}/articles`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const projects = await loadProjects();
    projectPages = projects.map((project) => ({
      url: `${BASE_URL}/projects/${project.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.warn("[sitemap] Failed to load projects:", error);
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
          url: `${BASE_URL}/articles/${article.slug}`,
          lastModified: Number.isNaN(parsed.getTime()) ? now : parsed,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        };
      });
    } catch (error) {
      console.warn("[sitemap] Failed to load articles:", error);
    }
  }

  return [...staticPages, ...projectPages, ...articlePages];
}
