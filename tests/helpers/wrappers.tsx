// tests/helpers/wrappers.tsx
import React from "react";
import { vi } from "vitest";

// Mock locale translations
export const mockTranslations = {
  hero: {
    greeting: "你好，我是",
    description: "描述文本",
  },
  nav: {
    about: "关于",
    projects: "项目",
    articles: "文章",
    photography: "摄影",
  },
  about: {
    sectionTitle: "~/About Me",
    technologies: "Some of the technologies I work with",
    viewAllSocials: "View all my socials",
  },
  articles: {
    readMore: "阅读更多",
    heroTag: "精选",
  },
  heroShowcase: {
    more: "更多",
    contact: "联系我",
  },
};

// Mock the locale config module
vi.mock("@/config/locale", () => ({
  LOCALE_STORAGE_KEY: "devfoliox-locale",
  getTranslations: () => mockTranslations,
}));

// Mock the LocaleProvider to provide context
vi.mock("@/components/LocaleProvider", () => {
  const LocaleContext = React.createContext({
    locale: "zh" as const,
    t: mockTranslations,
    setLocale: vi.fn(),
    toggleLocale: vi.fn(),
  });

  return {
    LocaleProvider: ({ children }: { children: React.ReactNode }) => (
      <LocaleContext.Provider
        value={{
          locale: "zh",
          t: mockTranslations,
          setLocale: vi.fn(),
          toggleLocale: vi.fn(),
        }}
      >
        {children}
      </LocaleContext.Provider>
    ),
    useLocale: () => React.useContext(LocaleContext),
    LocaleScript: () => null,
  };
});
