import type { Locale } from "@/config/locale";

const articleCopy = {
  zh: {
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

export function getSiteCopy(locale: Locale) {
  return { articles: articleCopy[locale] };
}
