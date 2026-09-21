import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { GET as getEnglishJsonFeed } from "@/app/(site-en)/en/feed.json/route";
import { GET as getChineseJsonFeed } from "@/app/feed.json/route";
import { GET as getLlms } from "@/app/llms.txt/route";
import sitemap from "@/app/sitemap";
import { getLocaleSwitchPath, reviewedBilingualArticleSlugs } from "@/config/locale";
import { getArticleBySlug } from "@/lib/mdx/mdx";

const slug = "geo-vs-seo-practical-differences";
const siteUrl = "https://me.itheheda.online";
const chinesePath = `/articles/${slug}`;
const englishPath = `/en/articles/${slug}`;
const primarySources = [
  "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
  "https://developers.google.com/search/docs/appearance/ai-features",
  "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
  "https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports",
  "https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview",
  "https://help-lb.openai.com/en/articles/12627856-publishers-and-developers-faq",
  "https://arxiv.org/abs/2311.09735",
];

describe("practical GEO vs SEO bilingual article", () => {
  it("publishes distinct reviewed versions with an operational comparison", async () => {
    const [chinese, english] = await Promise.all([
      getArticleBySlug(slug, "zh"),
      getArticleBySlug(slug, "en"),
    ]);

    expect(chinese).toMatchObject({
      title: "GEO 和 SEO 到底有什么区别？一张可执行的工作地图",
      author: "实解智能",
      date: "2026-09-21",
      publicPath: chinesePath,
    });
    expect(english).toMatchObject({
      title: "GEO vs SEO: A Practical Map of the Differences",
      author: "SolveReal Systems",
      date: "2026-09-21",
      publicPath: englishPath,
    });
    expect(getLocaleSwitchPath(chinesePath, "en")).toBe(englishPath);
    expect(getLocaleSwitchPath(englishPath, "zh")).toBe(chinesePath);
    expect(reviewedBilingualArticleSlugs).toContain(slug);

    for (const article of [chinese, english]) {
      for (const source of primarySources) {
        expect(article?.content).toContain(source);
      }
    }

    expect(chinese?.content).toContain("页面排名上升，不能证明回答准确");
    expect(chinese?.content).toContain("下面是一个假设例子，不代表本站客户或已经交付的项目");
    expect(chinese?.content).toContain("](/articles/why-geo-after-seo)");
    expect(english?.content).toContain("A higher ranking does not establish answer accuracy");
    expect(english?.content).toContain("This example does not describe a SolveReal Systems customer or completed project");
    expect(english?.content).toContain("](/en/articles/why-geo-after-seo)");
    expect(chinese?.content).not.toBe(english?.content);
  });

  it("appears in the sitemap, llms.txt, and locale feeds", async () => {
    const [entries, llmsResponse, chineseFeedResponse, englishFeedResponse] = await Promise.all([
      sitemap(),
      getLlms(),
      getChineseJsonFeed(),
      getEnglishJsonFeed(),
    ]);
    const llms = await llmsResponse.text();
    const chineseFeed = (await chineseFeedResponse.json()) as { items: Array<{ url: string }> };
    const englishFeed = (await englishFeedResponse.json()) as { items: Array<{ url: string }> };
    const chineseUrl = `${siteUrl}${chinesePath}`;
    const englishUrl = `${siteUrl}${englishPath}`;
    const languages = { "zh-CN": chineseUrl, en: englishUrl, "x-default": chineseUrl };

    expect(entries.find((entry) => entry.url === chineseUrl)?.alternates?.languages).toEqual(languages);
    expect(entries.find((entry) => entry.url === englishUrl)?.alternates?.languages).toEqual(languages);
    expect(llms).toContain(chineseUrl);
    expect(llms).toContain(englishUrl);
    expect(chineseFeed.items.some((item) => item.url === chineseUrl)).toBe(true);
    expect(englishFeed.items.some((item) => item.url === englishUrl)).toBe(true);
  });

  it("binds each language version to its reviewed article text", () => {
    for (const directory of ["articles", "articles-en"]) {
      const file = path.join(process.cwd(), "content", directory, `2026-09-21-${slug}.mdx`);
      const source = fs.readFileSync(file, "utf8");
      const declaredHash = source.match(/^contentHash: "(sha256:[a-f0-9]{64})"$/m)?.[1];
      const canonical = source.replace(/^contentHash:.*\r?\n/m, "").replace(/\r\n?/g, "\n");
      const observedHash = `sha256:${createHash("sha256").update(canonical, "utf8").digest("hex")}`;
      expect(declaredHash, directory).toBe(observedHash);
    }
  });
});
