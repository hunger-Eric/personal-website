import type { Locale } from "@/config/locale";

const articleCopy = {
  zh: {
    indexDescription: "记录企业 AI 系统、自动化、知识工作流与交付边界。",
    categoryFallback: "未分类",
    readTimeSuffix: "分钟阅读",
    articlesCountSuffix: "篇文章",
    allCategories: "全部分类",
    preface: "序言",
    chapterPrefix: "第",
    chapterSuffix: "章",
    otherArticles: "其他文章",
    emptyTitle: "暂无文章",
    emptyDescription: "文章正在整理中。",
  },
  en: {
    indexDescription: "Research and field notes on enterprise AI systems, automation, AI search visibility, and delivery boundaries.",
    categoryFallback: "Uncategorized",
    readTimeSuffix: "min read",
    articlesCountSuffix: "articles",
    allCategories: "All categories",
    preface: "Preface",
    chapterPrefix: "Chapter",
    chapterSuffix: "",
    otherArticles: "Other articles",
    emptyTitle: "No articles yet",
    emptyDescription: "Articles are being prepared.",
  },
} as const;

const homeCopy = {
  zh: {
    recentArticlesEyebrow: "Field notes",
    recentArticlesTitle: "最近的文章与实践",
    allArticles: "查看全部文章",
  },
  en: {
    recentArticlesEyebrow: "Field notes",
    recentArticlesTitle: "Recent articles and field notes",
    allArticles: "Browse all articles",
  },
} as const;

export function getSiteCopy(locale: Locale) {
  return { articles: articleCopy[locale], home: homeCopy[locale] };
}
