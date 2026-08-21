// app/sitemap.ts
import { MetadataRoute } from "next";
import { getReadableRoutes } from "@/lib/ai-readable/routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getReadableRoutes();
  return routes.map((route) => ({
    url: route.url,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
