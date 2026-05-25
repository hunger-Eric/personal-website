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
  heading: "~/AI Native Lab",
  viewAll: "进入系统档案",
  featuredBadge: "精选档案",
  viewDetails: "查看系统记录",
  emptyTitle: "暂无系统档案",
  emptyDescription: "案例档案还在整理中。",
};

const enCases: CasesCopy = {
  heading: "~/AI Native Lab",
  viewAll: "Open system archive",
  featuredBadge: "Featured record",
  viewDetails: "View system record",
  emptyTitle: "No system records yet",
  emptyDescription: "Case records are still being organized.",
};

const zh: SiteCopy = {
  hero: {
    line: "AI Native 独立开发者",
    description:
      "构建 AI 驱动的系统、工作流与数字产品。从自动化、知识库到 AI 内容创作，让想法快速变成真正可运行的系统。",
  },
  about: {
    heading: "~/关于我",
    socialsButton: "查看全部社交",
    techIntro: "我常设计的系统能力：",
    paragraphs: [
      "我关注的不是 AI 能生成什么，而是如何把 AI 真正组织进长期工作流与产品系统。",
      "我不只是使用 AI 写代码，而是在设计 AI 时代的新型工作方式：让模型、自动化、内容和业务流程能稳定协同。",
    ],
    afterTechParagraph:
      "面向个人和小团队，我更关心能不能快速验证想法、减少重复劳动，并把系统做成以后还能继续扩展的样子。",
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
    line: "AI Native Independent Developer",
    description:
      "I build AI-powered systems, workflows, and digital products, from automation pipelines and knowledge systems to AI-assisted creative experiences.",
  },
  about: {
    heading: "~/About Me",
    socialsButton: "View all socials",
    techIntro: "Systems I usually design:",
    paragraphs: [
      "I care less about what AI can generate in isolation, and more about how AI can be organized into long-term workflows and product systems.",
      "I do not only use AI to write code. I design new working patterns where models, automation, content, and business processes can cooperate reliably.",
    ],
    afterTechParagraph:
      "For individuals and small teams, the goal is faster idea validation, less repetitive work, and systems that can keep scaling after the first version ships.",
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
