"use client";

import { Languages } from "lucide-react";
import { useLocale } from "./LocaleProvider";

export function LangSwitch() {
  const { locale, toggleLocale } = useLocale();

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      title={locale === "zh" ? "Switch to English" : "切换到中文"}
      aria-label={locale === "zh" ? "Switch to English" : "切换到中文"}
    >
      <Languages className="h-3.5 w-3.5" />
      <span>{locale === "zh" ? "EN" : "中"}</span>
    </button>
  );
}
