import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { reviewedBilingualArticleSlugs } from "@/config/locale";
import { getArticleBySlug } from "@/lib/mdx/mdx";

const slug = "why-geo-after-seo";

describe("SEO and GEO bilingual article", () => {
  it("publishes the reviewed SEO and GEO guide in both languages", async () => {
    const [chinese, english] = await Promise.all([
      getArticleBySlug(slug, "zh"),
      getArticleBySlug(slug, "en"),
    ]);

    expect(chinese).toMatchObject({
      title: "网站已经做了 SEO，为什么还需要 GEO？",
      author: "实解智能",
      date: "2026-09-08",
      publicPath: `/articles/${slug}`,
      contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });
    expect(english).toMatchObject({
      title: "Why GEO Still Matters When Your Website Already Has SEO",
      author: "SolveReal Systems",
      date: "2026-09-08",
      publicPath: `/en/articles/${slug}`,
      contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });

    for (const article of [chinese, english]) {
      expect(article?.content).toContain("https://developers.google.com/search/docs/appearance/ai-features");
      expect(article?.content).toContain("https://developers.openai.com/api/docs/bots");
      expect(article?.content).toContain("https://arxiv.org/abs/2311.09735");
    }

    expect(chinese?.content).toContain("SEO 是 GEO 的地基");
    expect(chinese?.content).toContain("不保证收录、引用、排名、流量或咨询转化");
    expect(chinese?.content).toContain("https://geo.itheheda.online/zh");
    expect(chinese?.content).toContain("](/projects/open-geo-console)");
    expect(chinese?.content).toContain("](/services)");
    expect(chinese?.content).toContain("](/contact)");

    expect(english?.content).toContain("SEO is the foundation for GEO");
    expect(english?.content).toContain("does not guarantee indexing, citations, rankings, traffic, or inquiries");
    expect(english?.content).toContain("https://geo.itheheda.online/en");
    expect(english?.content).toContain("](/en/projects/open-geo-console)");
    expect(english?.content).toContain("](/en/services)");
    expect(english?.content).toContain("](/en/contact)");
    expect(reviewedBilingualArticleSlugs).toContain(slug);

    for (const localeDirectory of ["articles", "articles-en"]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "content", localeDirectory, `2026-09-08-${slug}.mdx`),
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
