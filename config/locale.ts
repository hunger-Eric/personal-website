export type Locale = "zh" | "en";

export const LOCALE_STORAGE_KEY = "shijie-intelligence-locale";

export const reviewedBilingualArticleSlugs = [
  "ai-search-visibility-audit-geo",
  "google-indexed-ai-does-not-recommend-website",
] as const;

const REVIEWED_BILINGUAL_ARTICLE_SLUGS = new Set<string>(reviewedBilingualArticleSlugs);

export const localeConfig = {
  zh: { htmlLang: "zh-CN", pathPrefix: "" },
  en: { htmlLang: "en", pathPrefix: "/en" },
} as const satisfies Record<
  Locale,
  { htmlLang: string; pathPrefix: string }
>;

export function localizePublicPath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withoutEnglishPrefix = normalized.replace(/^\/en(?=\/|$)/, "") || "/";

  if (locale === "zh") return withoutEnglishPrefix;
  return withoutEnglishPrefix === "/"
    ? localeConfig.en.pathPrefix
    : `${localeConfig.en.pathPrefix}${withoutEnglishPrefix}`;
}

export function getLocaleSwitchPath(pathname: string, target: Locale): string {
  const chinesePath = localizePublicPath(pathname, "zh");
  if (target === "en" && /^\/articles\/[^/]+/.test(chinesePath)) {
    const slug = chinesePath.match(/^\/articles\/([^/]+)$/)?.[1];
    if (slug && REVIEWED_BILINGUAL_ARTICLE_SLUGS.has(slug)) {
      return localizePublicPath(chinesePath, "en");
    }
    return "/en/articles";
  }
  return localizePublicPath(chinesePath, target);
}
