import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getArticleBySlug, getArticles } from "@/lib/mdx/mdx";
import sitemap from "@/app/sitemap";
import { reviewedBilingualArticleSlugs } from "@/config/locale";

const REQUIRED_SECTIONS = [
  "## 直接答案",
  "## 适用边界",
  "## 实施步骤",
  "## 验收清单",
  "## 参考来源",
  "## 下一步",
];

describe("published article GEO contract", () => {
  it("keeps the locale-switch projection equal to reviewed English article content", async () => {
    const englishSlugs = (await getArticles("en")).map((article) => article.slug).sort();
    expect([...reviewedBilingualArticleSlugs].sort()).toEqual(englishSlugs);
  });

  it("publishes one independently written Chinese and English Open GEO audit guide", async () => {
    const slug = "ai-search-visibility-audit-geo";
    const [chinese, english] = await Promise.all([
      getArticleBySlug(slug, "zh"),
      getArticleBySlug(slug, "en"),
    ]);

    expect(chinese).toMatchObject({
      title: "为什么 AI 搜索看不到你的官网？从可抓取性、买家问题到引用缺口做一次 GEO 诊断",
      author: "实解智能",
      updated: "2026-08-29",
      publicPath: `/articles/${slug}`,
      contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });
    expect(english).toMatchObject({
      title: "Why AI Search Cannot See Your Website: A Practical GEO Visibility Audit",
      author: "SolveReal Systems",
      updated: "2026-08-29",
      publicPath: `/en/articles/${slug}`,
      contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });

    for (const section of [
      "## 直接答案",
      "## 先把五种状态分开",
      "## 技术入口",
      "## 买家问题",
      "## 实体与证据",
      "## 整改优先级",
      "## 适用边界",
      "## 实施步骤",
      "## 验收清单",
      "## 参考来源",
      "## 下一步",
    ]) {
      expect(chinese?.content, section).toContain(section);
    }
    for (const section of [
      "## The short answer",
      "## Start with the visibility states",
      "## Crawlability and indexability",
      "## Buyer-question coverage",
      "## Entity clarity and citation readiness",
      "## Remediation ownership",
      "## Boundaries",
      "## A practical audit sequence",
      "## Verification checklist",
      "## Sources",
      "## Next step",
    ]) {
      expect(english?.content, section).toContain(section);
    }

    expect(chinese?.content).toContain("https://geo.itheheda.online/zh");
    expect(chinese?.content).toContain("](/projects/open-geo-console)");
    expect(chinese?.content).toContain("](/services)");
    expect(chinese?.content).toContain("](/contact)");
    expect(english?.content).toContain("https://geo.itheheda.online/en");
    expect(english?.content).toContain("](/en/projects/open-geo-console)");
    expect(english?.content).toContain("](/en/services)");
    expect(english?.content).toContain("](/en/contact)");
    expect(chinese?.content).toContain("不保证收录、引用、排名、流量或咨询转化");
    expect(english?.content).toContain("does not guarantee indexing, citations, rankings, traffic, or inquiries");
    expect(chinese?.content).toContain("https://developers.google.com/search/docs/fundamentals/how-search-works");
    expect(english?.content).toContain("https://help.openai.com/en/articles/12627856-publishers-and-developers-faq");
    expect(chinese?.content).not.toBe(english?.content);

    for (const localeDirectory of ["articles", "articles-en"]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "content", localeDirectory, `2026-08-29-${slug}.mdx`),
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

  it("publishes the reviewed Chinese PoC record guide without inventing an English detail page", async () => {
    const slug = "ai-automation-poc-acceptance-record-release-decision";
    const article = await getArticleBySlug(slug);
    expect(article).not.toBeNull();
    expect(article?.title).toBe("AI 自动化 PoC 验收记录怎么做？从测试样本到上线放行");
    expect(article?.content).toContain("示意记录");
    expect(article?.content).toContain("未关闭事项");
    expect(article?.content).toContain("](/projects/freight-lead-agent)");
    expect(article?.content).toContain("](/projects/hermes-notebook)");
    expect(article?.content).toContain("](/articles/enterprise-ai-automation-provider-selection-acceptance-checklist)");

    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain(`https://me.itheheda.online/articles/${slug}`);
    expect(urls).not.toContain(`https://me.itheheda.online/en/articles/${slug}`);
  });

  it("keeps every article answer-first, review-dated, sourced, and connected to conversion pages", async () => {
    const previews = await getArticles();
    expect(previews.length).toBeGreaterThan(0);

    for (const preview of previews) {
      const article = await getArticleBySlug(preview.slug);
      expect(article, preview.slug).not.toBeNull();
      expect(article?.updated, preview.slug).toBeTruthy();
      expect(new Date(article!.updated!).getTime(), preview.slug).toBeGreaterThanOrEqual(
        new Date(article!.date).getTime()
      );
      for (const section of REQUIRED_SECTIONS) {
        expect(article!.content, `${preview.slug}: ${section}`).toContain(section);
      }
      expect(article!.content, preview.slug).toMatch(/https:\/\//);
      expect(article!.content, preview.slug).toContain("](/services)");
      expect(article!.content, preview.slug).toMatch(/\]\(\/projects(?:\/[^)]+)?\)/);
      expect(article!.content, preview.slug).toContain("](/contact)");
    }
  });
});
