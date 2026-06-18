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
    openMenu: string;
    closeMenu: string;
    mainMenu: string;
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
  pages: {
    articlesTitle: string;
    articlesDescription: string;
    photographyTitle: string;
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
    openMenu: "打开导航菜单",
    closeMenu: "关闭导航菜单",
    mainMenu: "主导航",
    viewMore: "查看更多",
    about: "关于",
    projects: "案例",
    articles: "文章",
    photography: "摄影",
    more: "更多",
    connect: "联系我",
  },
  footer: {
    builtWith: "使用 Next.js 构建",
  },
  common: {
    viewAll: "查看全部",
  },
  pages: {
    articlesTitle: "文章",
    articlesDescription: "分享软件开发、产品实践与个人学习过程中的思考。",
    photographyTitle: "摄影",
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
    openMenu: "Toggle navigation menu",
    closeMenu: "Close navigation menu",
    mainMenu: "Main navigation",
    viewMore: "View more",
    about: "About",
    projects: "Cases",
    articles: "Articles",
    photography: "Photography",
    more: "More",
    connect: "Connect with me",
  },
  footer: {
    builtWith: "Built with Next.js",
  },
  common: {
    viewAll: "View all",
  },
  pages: {
    articlesTitle: "Articles",
    articlesDescription: "Thoughts on software development, product practice, and personal learning.",
    photographyTitle: "Photography",
  },
};

export const translations: Record<Locale, TranslationDict> = { zh, en };

export function getTranslations(locale: Locale): TranslationDict {
  return translations[locale] || translations.zh;
}
