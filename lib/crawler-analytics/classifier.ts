import type { CrawlerIdentity, VisibleCrawlerCategory } from "./types";

type Rule = CrawlerIdentity & { patterns: readonly string[] };

const RULES: readonly Rule[] = [
  {
    id: "open-geo-console",
    name: "Open GEO Console",
    category: "open_geo_self_test",
    patterns: ["opengeoconsolebot/"],
  },
  {
    id: "openai",
    name: "OpenAI",
    category: "identified_ai_crawler",
    patterns: ["gptbot", "chatgpt-user", "oai-searchbot"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    category: "identified_ai_crawler",
    patterns: ["claudebot", "claude-searchbot", "claude-user"],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    category: "identified_ai_crawler",
    patterns: ["perplexitybot", "perplexity-user"],
  },
  {
    id: "meta-ai",
    name: "Meta AI",
    category: "identified_ai_crawler",
    patterns: ["meta-externalagent", "meta-externalfetcher"],
  },
  {
    id: "ai-data-crawler",
    name: "其他 AI 数据爬虫",
    category: "identified_ai_crawler",
    patterns: ["ccbot", "bytespider", "amazonbot"],
  },
  {
    id: "search-crawler",
    name: "搜索引擎爬虫",
    category: "other_automation",
    patterns: ["googlebot", "bingbot", "duckduckbot", "baiduspider", "yandexbot", "slurp"],
  },
  {
    id: "command-line-client",
    name: "命令行客户端",
    category: "other_automation",
    patterns: ["curl/", "wget/", "python-requests", "httpie/"],
  },
  {
    id: "monitoring-client",
    name: "监控程序",
    category: "other_automation",
    patterns: ["uptime", "pingdom"],
  },
  {
    id: "browser-automation",
    name: "浏览器自动化",
    category: "other_automation",
    patterns: ["headlesschrome", "playwright", "puppeteer", "selenium"],
  },
];

export function classifyUserAgent(userAgent: string): CrawlerIdentity {
  const normalized = userAgent.toLowerCase();
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => normalized.includes(pattern))) {
      return { id: rule.id, name: rule.name, category: rule.category };
    }
  }
  return { id: "unclassified", name: "未分类", category: "unclassified" };
}

export function getAutomationFilterPatterns(): string[] {
  return [
    ...new Set(RULES.flatMap((rule) => rule.patterns.map((pattern) => pattern.toLowerCase()))),
  ];
}

export function isVisibleCrawlerCategory(
  category: CrawlerIdentity["category"]
): category is VisibleCrawlerCategory {
  return category !== "unclassified";
}
