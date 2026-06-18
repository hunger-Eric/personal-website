// components/ThemeProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { themeConfig, getAccentPreset, type ThemeMode } from "@/config/theme";

type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "devfoliox-theme";

function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage might not be available
  }
  return null;
}

function setStoredTheme(theme: ThemeMode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage might not be available
  }
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolvedTheme: ResolvedTheme): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Remove existing theme classes
  root.classList.remove("light", "dark");

  // Add new theme class
  root.classList.add(resolvedTheme);

  // Update color-scheme for native browser elements
  root.style.colorScheme = resolvedTheme;
}

function applyAccent(): void {
  if (typeof document === "undefined") return;
  const preset = getAccentPreset();
  const root = document.documentElement;
  root.style.setProperty("--accent", preset.accent);
  root.style.setProperty("--accent-hover", preset.accentHover);
  if (preset.accentLight) {
    root.style.setProperty("--accent-light", preset.accentLight);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize with stored theme or default
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (!themeConfig.allowToggle) {
      return themeConfig.defaultMode === "system"
        ? "system"
        : themeConfig.defaultMode;
    }
    return getStoredTheme() || themeConfig.defaultMode;
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    getSystemTheme()
  );
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(resolvedTheme);
    applyAccent();
    setStoredTheme(theme);
  }, [theme, resolvedTheme]);

  // Listen for system preference changes when theme is "system"
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    if (!themeConfig.allowToggle) return;
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    if (!themeConfig.allowToggle) return;

    setThemeState((current) => {
      // Cycle through: dark -> light -> system -> dark
      if (current === "dark") return "light";
      if (current === "light") return themeConfig.respectSystemPreference ? "system" : "dark";
      return "dark";
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Script to prevent flash of wrong theme on page load.
 * This runs before React hydration to immediately apply the correct theme.
 * Include this in the <head> of your document.
 */
export function ThemeScript() {
  const preset = getAccentPreset();
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('${STORAGE_KEY}');
        var theme = stored || '${themeConfig.defaultMode}';
        var resolved = theme;

        if (theme === 'system' || !stored) {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        document.documentElement.classList.add(resolved);
        document.documentElement.style.colorScheme = resolved;

        // Set accent colors from theme config
        document.documentElement.style.setProperty('--accent', '${preset.accent}');
        document.documentElement.style.setProperty('--accent-hover', '${preset.accentHover}');
        ${preset.accentLight ? `document.documentElement.style.setProperty('--accent-light', '${preset.accentLight}');` : ''}
      } catch (e) {
        document.documentElement.classList.add('dark');
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}

export default ThemeProvider;
