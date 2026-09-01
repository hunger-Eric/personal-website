import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { reviewedBilingualArticleSlugs } from "@/config/locale";
import { getArticleBySlug } from "@/lib/mdx/mdx";

const slug = "why-ai-search-misreads-your-english-brand-name";

describe("English brand AI search bilingual article", () => {
  it("publishes the reviewed problem-led title and platform-specific checks in both languages", async () => {
    const [chinese, english] = await Promise.all([
      getArticleBySlug(slug, "zh"),
      getArticleBySlug(slug, "en"),
    ]);

    expect(chinese).toMatchObject({
      title: "Google 已收录，AI 搜索为什么仍认不出英文品牌名？双语官网检查与修复清单",
      author: "实解智能",
      date: "2026-09-01",
      publicPath: `/articles/${slug}`,
      contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });
    expect(english).toMatchObject({
      title: "Google Indexed the Site. Why Does AI Search Still Misread the English Brand Name?",
      author: "SolveReal Systems",
      date: "2026-09-01",
      publicPath: `/en/articles/${slug}`,
      contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });

    for (const section of [
      "## 修改前与当前证据",
      "## Google AI Overview 先看 Google 索引",
      "## ChatGPT Search 要检查 OAI-SearchBot",
      "## Perplexity 要区分两种访问",
      "## 流量要用访问证据来判断",
    ]) {
      expect(chinese?.content).toContain(section);
    }
    for (const section of [
      "## What the before-and-current evidence proves",
      "## Google AI Overviews begin with the Google index",
      "## ChatGPT Search depends on OAI-SearchBot access",
      "## Perplexity uses two distinct access paths",
      "## Measure referral traffic with downstream evidence",
    ]) {
      expect(english?.content).toContain(section);
    }

    expect(chinese?.content).toContain("复查完成前不写成功结论");
    expect(english?.content).toContain("No success claim is warranted before that retest");
    expect(chinese?.content).toContain("https://docs.perplexity.ai/docs/resources/perplexity-crawlers");
    expect(english?.content).toContain("https://docs.perplexity.ai/docs/resources/perplexity-crawlers");
    expect(reviewedBilingualArticleSlugs).toContain(slug);

    for (const localeDirectory of ["articles", "articles-en"]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "content", localeDirectory, `2026-09-01-${slug}.mdx`),
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
