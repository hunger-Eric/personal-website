// components/ThemeToggle.tsx
"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { themeConfig } from "@/config/theme";
import { themeCopy, type ThemeMode } from "@/config/copy/theme";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  // Don't render if toggle is disabled
  if (!themeConfig.allowToggle) {
    return null;
  }

  const label =
    theme === "system"
      ? themeCopy.modes.system
      : resolvedTheme === "dark"
        ? themeCopy.modes.dark
        : themeCopy.modes.light;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative inline-flex items-center justify-center rounded-control p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      aria-label={themeCopy.toggleLabel(label)}
      title={themeCopy.toggleTitle(label)}
    >
      {/* Icon with animation */}
      <span className="relative h-5 w-5">
        {/* Sun icon */}
        <Sun
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            resolvedTheme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
        />
        {/* Moon icon */}
        <Moon
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            resolvedTheme === "dark" && theme !== "system"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
        {/* Monitor icon for system */}
        <Monitor
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            theme === "system"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
        />
      </span>

      {/* Optional label */}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">{label}</span>
      )}
    </button>
  );
}

/**
 * Dropdown version of the theme toggle for more precise control
 */
export function ThemeDropdown({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  if (!themeConfig.allowToggle) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeMode)}
        className="appearance-none rounded-control border border-border bg-surface-paper px-3 py-2 pr-8 text-sm text-foreground transition-colors hover:border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        aria-label={themeCopy.selectLabel}
      >
        <option value="light">{themeCopy.modes.light}</option>
        <option value="dark">{themeCopy.modes.dark}</option>
        {themeConfig.respectSystemPreference && (
          <option value="system">{themeCopy.modes.system}</option>
        )}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg
          className="h-4 w-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

export default ThemeToggle;
