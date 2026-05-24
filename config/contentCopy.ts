import type { Locale } from "./locale";

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
  projects: {
    heading: string;
    viewAll: string;
    featuredBadge: string;
    viewDetails: string;
    emptyTitle: string;
    emptyDescription: string;
  };
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

const zh: SiteCopy = {
  hero: {
    line: "你好，我是 fengc。",
    description:
      "全栈程序猿，摄影爱好者。捣鼓 Next.js、Python、AI Agent 和自动化工具，偶尔出去拍拍照。",
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
  projects: {
    heading: "~/项目",
    viewAll: "查看全部项目",
    featuredBadge: "精选项目",
    viewDetails: "查看详情",
    emptyTitle: "暂时没有项目",
    emptyDescription: "项目内容还在整理中。",
  },
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
    emptyTitle: "暂无项目",
    emptyDescription: "摄影项目正在筹备中，敬请期待。",
  },
};

const en: SiteCopy = {
  hero: {
    line: "Hi, fengc here.",
    description:
      "Full-stack developer and photography enthusiast. I tinker with Next.js, Python, AI agents, and automation tools, and I still make time to go shoot photos.",
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
  projects: {
    heading: "~/Projects",
    viewAll: "View all projects",
    featuredBadge: "Featured project",
    viewDetails: "View details",
    emptyTitle: "No projects yet",
    emptyDescription: "Project content is still being organized.",
  },
  articles: {
    heading: "Articles",
    description:
      "Notes on software development, product practice, and personal learning.",
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
