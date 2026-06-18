export type OgThemeMode = "light" | "dark";

export type OgPalette = {
  background: string;
  foreground: string;
  muted: string;
  pattern: string;
  accent: string;
  accentSecondary: string;
  accentForeground: string;
  accentShadow: string;
};

export const ogCopy = {
  defaultTitle: "fengc",
  defaultSubtitle: "AI Native Builder",
  contextLabel: "Website",
  generationError: "OG Image generation error:",
};

export const ogPalettes: Record<OgThemeMode, OgPalette> = {
  dark: {
    background: "#050816",
    foreground: "#f4f4f5",
    muted: "#71717a",
    pattern: "rgba(255,255,255,0.03)",
    accent: "#4f46e5",
    accentSecondary: "#7c3aed",
    accentForeground: "#ffffff",
    accentShadow: "rgba(79, 70, 229, 0.3)",
  },
  light: {
    background: "#ffffff",
    foreground: "#1f2937",
    muted: "#6b7280",
    pattern: "rgba(0,0,0,0.03)",
    accent: "#4f46e5",
    accentSecondary: "#7c3aed",
    accentForeground: "#ffffff",
    accentShadow: "rgba(79, 70, 229, 0.2)",
  },
};

export function getOgPalette(theme?: string): OgPalette {
  return theme === "light" ? ogPalettes.light : ogPalettes.dark;
}
