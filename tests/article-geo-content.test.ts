import { describe, expect, it } from "vitest";

import { getArticleBySlug, getArticles } from "@/lib/mdx/mdx";
import sitemap from "@/app/sitemap";

const REQUIRED_SECTIONS = [
  "## 直接答案",
  "## 适用边界",
  "## 实施步骤",
  "## 验收清单",
  "## 参考来源",
  "## 下一步",
];

describe("published article GEO contract", () => {
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
      expect(article!.content, preview.slug).toContain("](/projects)");
      expect(article!.content, preview.slug).toContain("](/contact)");
    }
  });
});
