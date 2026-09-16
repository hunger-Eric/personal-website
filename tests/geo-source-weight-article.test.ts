import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import { getLocaleSwitchPath } from "@/config/locale";
import { getArticleBySlug } from "@/lib/mdx/mdx";

const slug = "geo-source-weight-official-website";
const chinesePath = `/articles/${slug}`;
const englishPath = `/en/articles/${slug}`;

describe("bilingual GEO source-weight article", () => {
  it("publishes both researched versions with primary sources and a site-check route", async () => {
    const [chinese, english, entries] = await Promise.all([
      getArticleBySlug(slug, "zh"),
      getArticleBySlug(slug, "en"),
      sitemap(),
    ]);

    expect(chinese).toMatchObject({
      author: "实解智能",
      date: "2026-09-16",
      publicPath: chinesePath,
    });
    expect(english).toMatchObject({
      author: "SolveReal Systems",
      date: "2026-09-16",
      publicPath: englishPath,
    });
    expect(getLocaleSwitchPath(chinesePath, "en")).toBe(englishPath);
    expect(getLocaleSwitchPath(englishPath, "zh")).toBe(chinesePath);

    for (const [article, articlePath, productUrl] of [
      [chinese, chinesePath, "https://geo.itheheda.online/zh"],
      [english, englishPath, "https://geo.itheheda.online/en"],
    ] as const) {
      expect(article?.content).toContain("https://developers.google.com/search/docs/appearance/ai-features");
      expect(article?.content).toContain("https://help.openai.com/en/articles/9237897-chatgpt-search");
      expect(article?.content).toContain("https://arxiv.org/abs/2005.11401");
      expect(article?.content).toContain("https://arxiv.org/abs/2604.25707");
      expect(article?.content).toContain("https://arxiv.org/abs/2607.15771");
      expect(article?.content).toContain("https://arxiv.org/abs/2305.14627");
      expect(article?.content).toContain(productUrl);
      expect(entries.some((entry) => entry.url === `https://me.itheheda.online${articlePath}`)).toBe(true);
    }
    expect(chinese?.content).not.toBe(english?.content);
  });

  it("binds each published version to its reviewed source hash", () => {
    for (const directory of ["articles", "articles-en"]) {
      const file = path.join(process.cwd(), "content", directory, `2026-09-16-${slug}.mdx`);
      const source = fs.readFileSync(file, "utf8");
      const declaredHash = source.match(/^contentHash: "(sha256:[a-f0-9]{64})"$/m)?.[1];
      const canonical = source.replace(/^contentHash:.*\r?\n/m, "").replace(/\r\n?/g, "\n");
      const observedHash = `sha256:${createHash("sha256").update(canonical, "utf8").digest("hex")}`;
      expect(declaredHash, directory).toBe(observedHash);
    }
  });
});
