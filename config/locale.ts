// config/locale.ts
export type Locale = "zh" | "en";

export const LOCALE_STORAGE_KEY = "devfoliox-locale";

export type TranslationDict = {
  hero: {
    greeting: string;
    resume: string;
    contact: string;
  };
  nav: {
    home: string;
    menu: string;
    viewMore: string;
    about: string;
    projects: string;
    articles: string;
    photography: string;
    more: string;
    connect: string;
  };
  footer: {
    builtWith: string;
  };
  common: {
    viewAll: string;
  };
};

const zh: TranslationDict = {
  hero: {
    greeting: "你好，我是",
    resume: "我的简历",
    contact: "联系我",
  },
  nav: {
    home: "首页",
    menu: "菜单",
    viewMore: "查看更多",
    about: "关于",
    projects: "项目",
    articles: "文章",
    photography: "摄影",
    more: "更多",
    connect: "联系我",
  },
  footer: {
    builtWith: "使用 Next.js 与爱构建",
  },
  common: {
    viewAll: "查看全部",
  },
};

const en: TranslationDict = {
  hero: {
    greeting: "Hi, my name is",
    resume: "My Resume",
    contact: "Contact Me",
  },
  nav: {
    home: "Home",
    menu: "Menu",
    viewMore: "View more",
    about: "About",
    projects: "Projects",
    articles: "Articles",
    photography: "Photography",
    more: "More",
    connect: "Connect with me",
  },
  footer: {
    builtWith: "Built with Next.js & love",
  },
  common: {
    viewAll: "View all",
  },
};

export const translations: Record<Locale, TranslationDict> = { zh, en };

export function getTranslations(locale: Locale): TranslationDict {
  return translations[locale] || translations.zh;
}
