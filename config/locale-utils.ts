import type { Locale } from "./locale";

const dateFormatByLocale: Record<
  Locale,
  { locale: string; options: Intl.DateTimeFormatOptions }
> = {
  zh: {
    locale: "zh-CN",
    options: { year: "numeric", month: "numeric", day: "numeric" },
  },
  en: {
    locale: "en-US",
    options: { year: "numeric", month: "short", day: "numeric" },
  },
};

export function selectLocalized<T>(locale: Locale, values: { zh: T; en: T }): T {
  return values[locale] ?? values.zh;
}

export function formatLocalizedDate(dateStr: string, locale: Locale): string {
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    const format = selectLocalized(locale, dateFormatByLocale);
    return date.toLocaleDateString(format.locale, format.options);
  } catch {
    return dateStr;
  }
}
