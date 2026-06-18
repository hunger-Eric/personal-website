// config/theme.ts
import themeJson from "./theme.json";

export type ThemeMode = "light" | "dark" | "system";

export type AccentPreset = {
  accent: string;
  accentHover: string;
  accentLight: string;
};

export type ThemeConfig = {
  defaultMode: ThemeMode;
  allowToggle: boolean;
  respectSystemPreference: boolean;
  accentColor: string;
  presets: Record<string, AccentPreset>;
};

export const themeConfig: ThemeConfig = themeJson as ThemeConfig;

export function getAccentPreset(name?: string): AccentPreset {
  const presetName = name || themeConfig.accentColor || "indigo";
  return (
    themeConfig.presets[presetName] ||
    themeConfig.presets["indigo"] || {
      accent: "#4f46e5",
      accentHover: "#4338ca",
      accentLight: "#818cf8",
    }
  );
}

export default themeConfig;
