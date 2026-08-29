import { beforeEach, describe, expect, it, vi } from "vitest";

const slug = "ai-search-visibility-audit-geo";
const siteUrl = "https://me.itheheda.online";
const chineseUrl = `${siteUrl}/articles/${slug}`;
const englishUrl = `${siteUrl}/en/articles/${slug}`;

const articles = {
  zh: {
    slug,
    title: "为什么 AI 搜索看不到你的官网？",
    date: "2026-08-29",
    updated: "2026-08-29",
    summary: "中文摘要",
    content: "中文完整正文",
    category: "GEO",
    tags: ["GEO"],
    author: "SolveReal Systems",
    publicPath: `/articles/${slug}`,
  },
  en: {
    slug,
    title: "Why AI Search Cannot See Your Website",
    date: "2026-08-29",
    updated: "2026-08-29",
    summary: "English summary",
    content: "Complete English article body",
    category: "GEO",
    tags: ["GEO"],
    author: "SolveReal Systems",
    publicPath: `/en/articles/${slug}`,
  },
};

vi.mock("@/lib/mdx/mdx", () => ({
  getArticles: vi.fn(async (locale: "zh" | "en" = "zh") => [articles[locale]]),
  getArticleBySlug: vi.fn(async (requestedSlug: string, locale: "zh" | "en" = "zh") =>
    requestedSlug === slug ? articles[locale] : null,
  ),
}));

beforeEach(() => {
  vi.resetModules();
});

describe("bilingual article discovery", () => {
  it("publishes both locale URLs once in sitemap and llms.txt", async () => {
    const [{ default: sitemap }, { GET: getLlms }] = await Promise.all([
      import("@/app/sitemap"),
      import("@/app/llms.txt/route"),
    ]);

    const entries = await sitemap();
    const llms = await (await getLlms()).text();
    const chineseEntry = entries.find((entry) => entry.url === chineseUrl);
    const englishEntry = entries.find((entry) => entry.url === englishUrl);
    const languages = {
      "zh-CN": chineseUrl,
      en: englishUrl,
      "x-default": chineseUrl,
    };

    expect(entries.filter((entry) => entry.url === chineseUrl)).toHaveLength(1);
    expect(entries.filter((entry) => entry.url === englishUrl)).toHaveLength(1);
    expect(chineseEntry?.alternates?.languages).toEqual(languages);
    expect(englishEntry?.alternates?.languages).toEqual(languages);
    expect(llms.match(new RegExp(chineseUrl, "g")) ?? []).toHaveLength(1);
    expect(llms.match(new RegExp(englishUrl, "g")) ?? []).toHaveLength(1);
  });

  it("publishes English RSS and JSON feeds from reviewed English content", async () => {
    const [{ GET: getRss }, { GET: getJson }] = await Promise.all([
      import("@/app/(site-en)/en/feed.xml/route"),
      import("@/app/(site-en)/en/feed.json/route"),
    ]);

    const rss = await (await getRss()).text();
    const json = (await (await getJson()).json()) as {
      language: string;
      home_page_url: string;
      feed_url: string;
      items: Array<{ url: string; content_text: string }>;
    };

    expect(rss).toContain(`<link>${siteUrl}/en/articles</link>`);
    expect(rss).toContain(`<atom:link href="${siteUrl}/en/feed.xml"`);
    expect(rss).toContain("<language>en</language>");
    expect(rss).toContain(`<link>${englishUrl}</link>`);
    expect(rss).toContain("Complete English article body");
    expect(rss).not.toContain("中文完整正文");
    expect(json).toMatchObject({
      language: "en",
      home_page_url: `${siteUrl}/en/articles`,
      feed_url: `${siteUrl}/en/feed.json`,
      items: [{ url: englishUrl, content_text: "Complete English article body" }],
    });
  });
});
