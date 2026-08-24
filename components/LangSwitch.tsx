"use client";

import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import { getLocaleSwitchPath } from "@/config/locale";
import {
  getLanguageSwitchLabel,
  getLanguageSwitchSegmentClass,
  languageSwitchCopy,
} from "@/config/copy/language";

type LangSwitchProps = {
  variant?: "surface" | "ghost";
};

export function LangSwitch({ variant = "surface" }: LangSwitchProps) {
  const { locale, setLocale } = useLocale();
  const pathname = usePathname();
  const targetLocale = locale === "zh" ? "en" : "zh";
  const href = getLocaleSwitchPath(pathname || "/", targetLocale);
  const label = getLanguageSwitchLabel(locale);
  const variantClass =
    variant === "ghost"
      ? "border-transparent bg-transparent px-2.5 py-1.5 hover:bg-muted hover:text-foreground"
      : "border-border bg-surface-paper px-3 py-1.5 hover:text-foreground";

  return (
    <a
      href={href}
      onClick={() => setLocale(targetLocale)}
      className={[
        "inline-flex items-center gap-2 rounded-control border text-xs font-medium text-muted-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        variantClass,
      ].join(" ")}
      title={label}
      aria-label={label}
    >
      <Languages className="h-3.5 w-3.5" />
      <span className={getLanguageSwitchSegmentClass(locale, "zh")}>
        {languageSwitchCopy.segments.zh}
      </span>
      <span className="text-muted-foreground/60">
        {languageSwitchCopy.separator}
      </span>
      <span className={getLanguageSwitchSegmentClass(locale, "en")}>
        {languageSwitchCopy.segments.en}
      </span>
    </a>
  );
}
