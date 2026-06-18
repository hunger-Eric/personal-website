// config/i18n.ts
// Generic helper to resolve i18n JSON configs.
// JSON files can have top-level "zh" and "en" keys containing locale-specific strings.
// This helper merges the locale-specific values into the top level,
// so downstream consumers see a flat config without knowing about i18n.

import type { Locale } from "./locale";
import { selectLocalized } from "./locale-utils";

type Localizable = Record<string, unknown>;

/**
 * Merge locale-specific fields into the top level of a config object.
 * If the object has a "zh" or "en" key, those fields are spread onto the top level.
 * Non-locale keys (like "handle", "avatarUrl") are preserved as-is.
 * The "zh" and "en" keys themselves are removed from the result.
 *
 * Example:
 *   Input:  { handle: "fengc", zh: { roleLine: "开发者" }, en: { roleLine: "Developer" } }
 *   Result (locale="en"): { handle: "fengc", roleLine: "Developer" }
 */
export function getLocalizedConfig<T extends Localizable>(
  raw: T,
  locale: Locale
): T {
  const { zh, en, ...rest } = raw as Localizable & {
    zh?: Localizable;
    en?: Localizable;
  };

  const localized = selectLocalized(locale, { zh, en });

  if (!localized) {
    // No locale-specific data, return as-is (minus zh/en keys)
    return rest as T;
  }

  // Deep merge: locale-specific values override shared values
  return deepMerge(rest, localized) as T;
}

function deepMerge(
  base: Localizable,
  override: Localizable
): Localizable {
  const result: Localizable = { ...base };

  for (const key of Object.keys(override)) {
    const baseVal = result[key];
    const overVal = override[key];

    if (
      baseVal &&
      overVal &&
      typeof baseVal === "object" &&
      typeof overVal === "object" &&
      !Array.isArray(baseVal) &&
      !Array.isArray(overVal)
    ) {
      result[key] = deepMerge(
        baseVal as Localizable,
        overVal as Localizable
      );
    } else {
      result[key] = overVal;
    }
  }

  return result;
}
