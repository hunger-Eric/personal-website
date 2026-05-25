import type { Locale } from "./locale";

type CasesCopy = {
  heading: string;
  viewAll: string;
  featuredBadge: string;
  viewDetails: string;
  emptyTitle: string;
  emptyDescription: string;
};

export type SiteCopy = {
  hero: {
    line: string;
    description: string;
  };
  about: {
    heading: string;
    socialsButton: string;
    techIntro: string;
    paragraphs: string[];
    afterTechParagraph: string;
  };
  cases: CasesCopy;
  projects: CasesCopy;
  articles: {
    heading: string;
    description: string;
    viewAll: string;
    emptyTitle: string;
    emptyDescription: string;
    categoryFallback: string;
    articlesCountSuffix: string;
    readTimeSuffix: string;
  };
  photography: {
    heading: string;
    description: string;
    ongoing: string;
    completed: string;
    private: string;
    photosSuffix: string;
    emptyTitle: string;
    emptyDescription: string;
  };
};

const zhCases: CasesCopy = {
  heading: "~/案例",
  viewAll: "查看全部案例",
  featuredBadge: "精选案例",
  viewDetails: "查看案例",
  emptyTitle: "暂无案例",
  emptyDescription: "案例内容还在整理中。",
};

const enCases: CasesCopy = {
  heading: "~/Cases",
  viewAll: "View all cases",
  featuredBadge: "Featured case",
  viewDetails: "View case",
  emptyTitle: "No cases yet",
  emptyDescription: "Case content is still being organized.",
};

const zh: SiteCopy = {
  hero: {
    line: "你好，我是 fengc。",
    description:
      "全栈程序猿，摄影爱好者。擅长 Next.js、Python、AI Agent 和自动化工具，也会把零散的内容和工作流整理成更顺手的交付。",
  },
  about: {
    heading: "~/关于我",
    socialsButton: "查看全部社交",
    techIntro: "我最常使用的一些技术：",
    paragraphs: [
      "全栈程序猿，摄影爱好者。平时主要在 Next.js、Python、AI Agent 和自动化工具之间来回切换，也会自己做一些小工具和工作流。",
      "我会把写代码、整理内容和拍照当成一套连续的工作方式，希望它们都能保持轻量、清楚、可维护。",
    ],
    afterTechParagraph:
      "最近也在琢磨怎么把 AI 更自然地放进摄影后期和日常整理流程里。",
  },
  cases: zhCases,
  projects: zhCases,
  articles: {
    heading: "文章",
    description: "分享软件开发、产品实践与个人学习过程中的思考。",
    viewAll: "查看全部文章",
    emptyTitle: "还没有文章",
    emptyDescription: "发布后会显示在这里。",
    categoryFallback: "未分类",
    articlesCountSuffix: "篇",
    readTimeSuffix: "阅读",
  },
  photography: {
    heading: "摄影",
    description: "用镜头记录走过的路、看过的风景。全栈程序猿 / 摄影爱好者。",
    ongoing: "进行中",
    completed: "已完成",
    private: "私密",
    photosSuffix: "张",
    emptyTitle: "暂无相册",
    emptyDescription: "摄影项目正在准备中。",
  },
};

const en: SiteCopy = {
  hero: {
    line: "Hi, fengc here.",
    description:
      "Full-stack developer and photography enthusiast. I work with Next.js, Python, AI agents, and automation tools, and I still make time to go shoot photos.",
  },
  about: {
    heading: "~/About Me",
    socialsButton: "View all socials",
    techIntro: "Some of the technologies I work with most often:",
    paragraphs: [
      "Full-stack developer and photography enthusiast. Most days I bounce between Next.js, Python, AI agents, and small automation tools that help me stay organized.",
      "I treat coding, content, and photography as one continuous workflow, aiming to keep each part lightweight, clear, and maintainable.",
    ],
    afterTechParagraph:
      "Lately I have been exploring how AI can fit more naturally into photo post-production and everyday organization.",
  },
  cases: enCases,
  projects: enCases,
  articles: {
    heading: "Articles",
    description: "Thoughts on software development, product practice, and personal learning.",
    viewAll: "View all articles",
    emptyTitle: "No articles yet",
    emptyDescription: "New posts will show up here after publishing.",
    categoryFallback: "Uncategorized",
    articlesCountSuffix: "posts",
    readTimeSuffix: "read",
  },
  photography: {
    heading: "Photography",
    description:
      "A visual record of places I have been and scenes I have seen. Full-stack developer / photography enthusiast.",
    ongoing: "Ongoing",
    completed: "Done",
    private: "Private",
    photosSuffix: "photos",
    emptyTitle: "No albums yet",
    emptyDescription: "Photography projects are on the way.",
  },
};

export const siteCopy: Record<Locale, SiteCopy> = { zh, en };

export function getSiteCopy(locale: Locale): SiteCopy {
  return siteCopy[locale] || siteCopy.zh;
}
