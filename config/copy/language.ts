import type { Locale } from "@/config/locale";
import { selectLocalized } from "@/config/locale-utils";

const activeClass = "text-foreground";
const inactiveClass = "text-muted-foreground";

const segmentClassByLocale: Record<Locale, Record<Locale, string>> = {
  zh: { zh: activeClass, en: inactiveClass },
  en: { zh: inactiveClass, en: activeClass },
};

export const languageSwitchCopy = {
  separator: "/",
  segments: {
    zh: "中",
    en: "EN",
  },
};

export function getLanguageSwitchLabel(locale: Locale): string {
  return selectLocalized(locale, {
    zh: "切换到 English",
    en: "Switch to 中文",
  });
}

export function getLanguageSwitchSegmentClass(
  locale: Locale,
  target: Locale
): string {
  return segmentClassByLocale[locale]?.[target] ?? inactiveClass;
}
