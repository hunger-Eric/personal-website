import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { GET as getEnglishJsonFeed } from "@/app/(site-en)/en/feed.json/route";
import { GET as getEnglishRssFeed } from "@/app/(site-en)/en/feed.xml/route";
import { GET as getChineseJsonFeed } from "@/app/feed.json/route";
import { GET as getChineseRssFeed } from "@/app/feed.xml/route";
import { GET as getLlms } from "@/app/llms.txt/route";
import sitemap from "@/app/sitemap";
import { getLocaleSwitchPath } from "@/config/locale";
import { getArticleBySlug } from "@/lib/mdx/mdx";

const slug = "geo-public-fact-governance-website-consistency";
const siteUrl = "https://me.itheheda.online";
const chinesePath = `/articles/${slug}`;
const englishPath = `/en/articles/${slug}`;
const primarySources = [
  "https://developers.google.com/search/docs/appearance/publication-dates",
  "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap",
  "https://developers.google.com/search/docs/appearance/structured-data/sd-policies",
  "https://developers.google.com/search/docs/specialty/international/localized-versions",
  "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls",
  "https://www.indexnow.org/faq",
  "https://developers.openai.com/api/docs/bots",
  "https://www.w3.org/TR/prov-o/",
];

describe("bilingual GEO public-fact governance article", () => {
  it("publishes distinct reviewed versions with primary sources and localized routes", async () => {
    const [chinese, english, entries] = await Promise.all([
      getArticleBySlug(slug, "zh"),
      getArticleBySlug(slug, "en"),
      sitemap(),
    ]);

    expect(chinese).toMatchObject({
      author: "实解智能",
      date: "2026-09-21",
      publicPath: chinesePath,
      title: "官网自己说法不一时，GEO 应该先改哪一页？",
    });
    expect(english).toMatchObject({
      author: "SolveReal Systems",
      date: "2026-09-21",
      publicPath: englishPath,
      title: "When Your Website Contradicts Itself, What Should GEO Fix First?",
    });
    expect(getLocaleSwitchPath(chinesePath, "en")).toBe(englishPath);
    expect(getLocaleSwitchPath(englishPath, "zh")).toBe(chinesePath);

    for (const [article, articlePath, productUrl] of [
      [chinese, chinesePath, "https://geo.itheheda.online/zh"],
      [english, englishPath, "https://geo.itheheda.online/en"],
    ] as const) {
      for (const source of primarySources) {
        expect(article?.content).toContain(source);
      }
      expect(article?.content).toContain(productUrl);
      expect(entries.some((entry) => entry.url === `https://me.itheheda.online${articlePath}`)).toBe(true);
    }
    expect(chinese?.content).not.toBe(english?.content);
  });

  it("publishes both versions through llms.txt and locale feeds", async () => {
    const [
      entries,
      llmsResponse,
      chineseRssResponse,
      chineseJsonResponse,
      englishRssResponse,
      englishJsonResponse,
    ] = await Promise.all([
      sitemap(),
      getLlms(),
      getChineseRssFeed(),
      getChineseJsonFeed(),
      getEnglishRssFeed(),
      getEnglishJsonFeed(),
    ]);
    const llms = await llmsResponse.text();
    const chineseRss = await chineseRssResponse.text();
    const englishRss = await englishRssResponse.text();
    const chineseJson = (await chineseJsonResponse.json()) as {
      items: Array<{ url: string }>;
    };
    const englishJson = (await englishJsonResponse.json()) as {
      items: Array<{ url: string }>;
    };
    const chineseUrl = `${siteUrl}${chinesePath}`;
    const englishUrl = `${siteUrl}${englishPath}`;
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
    expect(chineseRss).toContain(`<link>${chineseUrl}</link>`);
    expect(englishRss).toContain(`<link>${englishUrl}</link>`);
    expect(chineseJson.items.some((item) => item.url === chineseUrl)).toBe(true);
    expect(englishJson.items.some((item) => item.url === englishUrl)).toBe(true);
  });

  it("binds each language version to the reviewed article text", () => {
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
