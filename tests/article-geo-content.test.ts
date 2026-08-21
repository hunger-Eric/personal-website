import { describe, expect, it } from "vitest";

import { getArticleBySlug, getArticles } from "@/lib/mdx/mdx";

const REQUIRED_SECTIONS = [
  "## 直接答案",
  "## 适用边界",
  "## 实施步骤",
  "## 验收清单",
  "## 参考来源",
  "## 下一步",
];

describe("published article GEO contract", () => {
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
