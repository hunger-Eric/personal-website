// components/LocaleProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Locale, TranslationDict } from "@/config/locale";
import { LOCALE_STORAGE_KEY, getTranslations } from "@/config/locale";

interface LocaleContextValue {
  locale: Locale;
  t: TranslationDict;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function getStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "zh" || stored === "en") return stored;
  } catch {
    // ignore
  }
  return null;
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return initialLocale || getStoredLocale() || "zh";
  });

  const [t, setT] = useState<TranslationDict>(() => getTranslations(locale));

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // ignore
    }
    setT(getTranslations(locale));
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === "zh" ? "en" : "zh"));
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

/**
 * Inline script that restores saved locale BEFORE React hydration,
 * so <html lang> is correct on first paint (no lang FOUC).
 * Place inside <head> of root layout, like ThemeScript.
 */
export function LocaleScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var v=localStorage.getItem("${LOCALE_STORAGE_KEY}");if(v==="en"||v==="zh"){document.documentElement.lang=v;}}catch(e){}})()`,
      }}
    />
  );
}
