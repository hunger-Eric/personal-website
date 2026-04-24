// app/sitemap.ts
import { MetadataRoute } from "next";
import { siteConfig } from "@/config/siteConfig";
import { loadProjects } from "@/config/projects";
import { blogPosts } from "@/config/articles";

// Base URL - should be configured in site.json or environment
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://kevintrinh.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Core pages - always included
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
  ];

  // Add projects listing page
  if (siteConfig.sections?.projects) {
    staticPages.push({
      url: `${BASE_URL}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Add articles listing page
  if (siteConfig.sections?.articles) {
    staticPages.push({
      url: `${BASE_URL}/articles`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Generate project pages
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
    console.warn("Failed to load projects for sitemap:", error);
  }

  // Article pages
  const articlePages: MetadataRoute.Sitemap = siteConfig.sections?.articles
    ? blogPosts.map((article) => ({
        url: `${BASE_URL}/articles/${article.slug}`,
        lastModified: article.date ? new Date(article.date) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    : [];

  return [...staticPages, ...projectPages, ...articlePages];
}
