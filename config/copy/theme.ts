export type ThemeMode = "light" | "dark" | "system";

export const themeCopy = {
  modes: {
    light: "Light",
    dark: "Dark",
    system: "System",
  } satisfies Record<ThemeMode, string>,
  toggleLabel: (mode: string) => `Current theme: ${mode}. Click to toggle.`,
  toggleTitle: (mode: string) => `Theme: ${mode}`,
  selectLabel: "Select theme",
};
