import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { reviewedBilingualArticleSlugs } from "@/config/locale";
import { getArticleBySlug } from "@/lib/mdx/mdx";

const slug = "why-company-websites-matter-more-in-the-ai-era";

describe("company website importance in the AI era bilingual article", () => {
  it("publishes a reviewed Chinese and English article around the GEO crawl path", async () => {
    const [chinese, english] = await Promise.all([
      getArticleBySlug(slug, "zh"),
      getArticleBySlug(slug, "en"),
    ]);

    expect(chinese).toMatchObject({
      title: "为什么企业官网在 AI 时代越来越重要",
      author: "实解智能",
      date: "2026-09-02",
      publicPath: `/articles/${slug}`,
      contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });
    expect(english).toMatchObject({
      title: "Why Company Websites Matter More in the AI Era",
      author: "SolveReal Systems",
      date: "2026-09-02",
      publicPath: `/en/articles/${slug}`,
      contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });

    for (const section of [
      "## 一次 AI 回答怎样走到企业官网",
      "## 用 Open GEO 还原官网被读取的路径",
      "## 官网要给 AI 提供哪些可核对的材料",
      "## 怎样判断这项工作有没有进展",
    ]) {
      expect(chinese?.content).toContain(section);
    }
    for (const section of [
      "## How an AI answer reaches a company website",
      "## Reconstructing the retrieval path with Open GEO",
      "## What the website must make verifiable",
      "## How to measure whether the work is progressing",
    ]) {
      expect(english?.content).toContain(section);
    }

    for (const article of [chinese, english]) {
      expect(article?.content).toContain("https://developers.google.com/search/docs/fundamentals/how-search-works");
      expect(article?.content).toContain("https://help.openai.com/en/articles/12627856-publishers-and-developers-faq");
      expect(article?.content).toContain("https://docs.perplexity.ai/docs/resources/perplexity-crawlers");
      expect(article?.content).toContain("https://geo.itheheda.online/");
    }
    expect(reviewedBilingualArticleSlugs).toContain(slug);

    for (const localeDirectory of ["articles", "articles-en"]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "content", localeDirectory, `2026-09-02-${slug}.mdx`),
        "utf8",
      );
      const declaredHash = source.match(/^contentHash: "(sha256:[a-f0-9]{64})"$/m)?.[1];
      const canonical = source
        .replace(/^contentHash:.*\r?\n/m, "")
        .replace(/\r\n?/g, "\n");
      const observedHash = `sha256:${createHash("sha256").update(canonical, "utf8").digest("hex")}`;
      expect(declaredHash, localeDirectory).toBe(observedHash);
    }
  });
});
