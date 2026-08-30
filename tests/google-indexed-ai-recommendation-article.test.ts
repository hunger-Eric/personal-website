import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import { GET as getEnglishJsonFeed } from "@/app/(site-en)/en/feed.json/route";
import { GET as getEnglishRssFeed } from "@/app/(site-en)/en/feed.xml/route";
import { GET as getLlms } from "@/app/llms.txt/route";
import { reviewedBilingualArticleSlugs } from "@/config/locale";
import { getArticleBySlug } from "@/lib/mdx/mdx";

const slug = "google-indexed-ai-does-not-recommend-website";
const siteUrl = "https://me.itheheda.online";
const chineseUrl = `${siteUrl}/articles/${slug}`;
const englishUrl = `${siteUrl}/en/articles/${slug}`;

describe("Google-indexed bilingual AI recommendation article", () => {
  it("loads one reviewed article per locale with the correct reader path and CTA", async () => {
    const [chinese, english] = await Promise.all([
      getArticleBySlug(slug, "zh"),
      getArticleBySlug(slug, "en"),
    ]);

    expect(chinese).toMatchObject({
      title: "官网已经被 Google 收录，为什么 AI 还是不推荐你？",
      author: "实解智能",
      date: "2026-08-30",
      updated: "2026-08-30",
      publicPath: `/articles/${slug}`,
      contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });
    expect(english).toMatchObject({
      title: "Google Indexed Your Website. Why Won't AI Recommend Your Company?",
      author: "SolveReal Systems",
      date: "2026-08-30",
      updated: "2026-08-30",
      publicPath: `/en/articles/${slug}`,
      contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });

    expect(chinese?.content).toContain("https://geo.itheheda.online/zh");
    expect(chinese?.content).not.toContain("https://geo.itheheda.online/en");
    expect(english?.content).toContain("https://geo.itheheda.online/en");
    expect(english?.content).not.toContain("https://geo.itheheda.online/zh");
    expect(chinese?.content).not.toBe(english?.content);
    expect(reviewedBilingualArticleSlugs).toContain(slug);
  });

  it("publishes both locale URLs through sitemap, llms.txt, and English feeds", async () => {
    const [entries, llmsResponse, rssResponse, jsonResponse] = await Promise.all([
      sitemap(),
      getLlms(),
      getEnglishRssFeed(),
      getEnglishJsonFeed(),
    ]);
    const llms = await llmsResponse.text();
    const rss = await rssResponse.text();
    const json = (await jsonResponse.json()) as {
      items: Array<{ url: string }>;
    };
    const languages = {
      "zh-CN": chineseUrl,
      en: englishUrl,
      "x-default": chineseUrl,
    };

    expect(entries.find((entry) => entry.url === chineseUrl)?.alternates?.languages).toEqual(
      languages,
    );
    expect(entries.find((entry) => entry.url === englishUrl)?.alternates?.languages).toEqual(
      languages,
    );
    expect(llms).toContain(chineseUrl);
    expect(llms).toContain(englishUrl);
    expect(rss).toContain(`<link>${englishUrl}</link>`);
    expect(json.items.some((item) => item.url === englishUrl)).toBe(true);
  });
});
