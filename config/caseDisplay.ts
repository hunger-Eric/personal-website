import raw from "./projects.json";

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

export function formatCaseDisplayMode(
  mode: CaseDisplayMode,
  locale: "zh" | "en"
) {
  if (locale === "zh") {
    if (mode === "featured") return "精选展示";
    if (mode === "catalog") return "索引 / 分类";
    return "自动适配";
  }

  if (mode === "featured") return "Featured";
  if (mode === "catalog") return "Catalog";
  return "Auto";
}
