"use client";

import { Languages } from "lucide-react";
import { useLocale } from "./LocaleProvider";

export function LangSwitch() {
  const { locale, toggleLocale } = useLocale();
  const isZh = locale === "zh";

  return (
    <button
      onClick={toggleLocale}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      title={isZh ? "切换到 English" : "Switch to 中文"}
      aria-label={isZh ? "切换到 English" : "Switch to 中文"}
    >
      <Languages className="h-3.5 w-3.5" />
      <span className={isZh ? "text-foreground" : "text-muted-foreground"}>中</span>
      <span className="text-muted-foreground/60">/</span>
      <span className={isZh ? "text-muted-foreground" : "text-foreground"}>EN</span>
    </button>
  );
}
