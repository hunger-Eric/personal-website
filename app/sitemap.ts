// app/sitemap.ts
import { MetadataRoute } from "next";
import { getReadableRoutes } from "@/lib/ai-readable/routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes = await getReadableRoutes();
  return routes.map((route) => ({
    url: route.url,
    lastModified: route.lastModified || now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
