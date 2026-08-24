// app/sitemap.ts
import { MetadataRoute } from "next";
import { getReadableRoutes } from "@/lib/ai-readable/routes";
import { localizePublicPath } from "@/config/locale";
import { SITE_URL } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getReadableRoutes();
  return routes.flatMap((route) => {
    const common = {
      lastModified: route.lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    };

    if (route.kind !== "primary" && route.kind !== "project") {
      return [{ url: route.url, ...common }];
    }

    const chinesePath = localizePublicPath(route.path, "zh");
    const englishPath = localizePublicPath(route.path, "en");
    const chineseUrl = `${SITE_URL}${chinesePath === "/" ? "/" : chinesePath}`;
    const englishUrl = `${SITE_URL}${englishPath}`;
    const languages = {
      "zh-CN": chineseUrl,
      en: englishUrl,
      "x-default": chineseUrl,
    };

    return [
      { url: chineseUrl, ...common, alternates: { languages } },
      { url: englishUrl, ...common, alternates: { languages } },
    ];
  });
}
