// app/sitemap.ts
import { MetadataRoute } from "next";
import { getReadableRoutes } from "@/lib/ai-readable/routes";
import { localizePublicPath } from "@/config/locale";
import { SITE_URL } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getReadableRoutes();
  const pairedArticlePaths = new Map<string, { zh?: string; en?: string }>();
  for (const route of routes) {
    if (route.kind !== "article" || !route.locale) continue;
    const slug = route.path.split("/").filter(Boolean).at(-1);
    if (!slug) continue;
    const pair = pairedArticlePaths.get(slug) ?? {};
    pair[route.locale] = route.path;
    pairedArticlePaths.set(slug, pair);
  }

  return routes.flatMap((route) => {
    const common = {
      lastModified: route.lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    };

    if (route.kind === "article") {
      const slug = route.path.split("/").filter(Boolean).at(-1);
      const pair = slug ? pairedArticlePaths.get(slug) : undefined;
      if (!pair?.zh || !pair.en) return [{ url: route.url, ...common }];

      const chineseUrl = `${SITE_URL}${pair.zh}`;
      const englishUrl = `${SITE_URL}${pair.en}`;
      return [{
        url: route.url,
        ...common,
        alternates: {
          languages: {
            "zh-CN": chineseUrl,
            en: englishUrl,
            "x-default": chineseUrl,
          },
        },
      }];
    }

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
