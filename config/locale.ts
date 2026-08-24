export type Locale = "zh" | "en";

export const LOCALE_STORAGE_KEY = "shijie-intelligence-locale";

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
    return "/en/articles";
  }
  return localizePublicPath(chinesePath, target);
}
