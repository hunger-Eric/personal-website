import raw from "./cases.json";
import type { Locale } from "./locale";
import { selectLocalized } from "./locale-utils";

export type CaseDisplayMode = "auto" | "featured" | "catalog";

export type CaseDisplaySettings = {
  mode: CaseDisplayMode;
  autoCatalogThreshold: number;
  featuredCount: number;
  previewLimit: number;
};

type RawCaseDisplayConfig = {
  display?: Partial<CaseDisplaySettings>;
};

const defaults: CaseDisplaySettings = {
  mode: "auto",
  autoCatalogThreshold: 4,
  featuredCount: 1,
  previewLimit: 6,
};

const caseDisplayModeLabels: Record<CaseDisplayMode, Record<Locale, string>> = {
  auto: {
    zh: "自动适配",
    en: "Auto",
  },
  featured: {
    zh: "精选展示",
    en: "Featured",
  },
  catalog: {
    zh: "索引 / 分类",
    en: "Catalog",
  },
};

export function getCaseDisplaySettings(): CaseDisplaySettings {
  const config = raw as RawCaseDisplayConfig;
  return {
    ...defaults,
    ...(config.display || {}),
  };
}

export function resolveCaseDisplayMode(
  caseCount: number
): Exclude<CaseDisplayMode, "auto"> {
  const settings = getCaseDisplaySettings();
  if (settings.mode !== "auto") {
    return settings.mode;
  }
  return caseCount >= settings.autoCatalogThreshold ? "catalog" : "featured";
}

export function formatCaseDisplayMode(mode: CaseDisplayMode, locale: Locale) {
  return selectLocalized(locale, caseDisplayModeLabels[mode]);
}
