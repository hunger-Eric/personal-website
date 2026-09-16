import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import { getLocaleSwitchPath } from "@/config/locale";
import { getArticleBySlug } from "@/lib/mdx/mdx";

const slug = "llm-training-text-chunks-geo-retrieval";
const siteUrl = "https://me.itheheda.online";
const chinesePath = `/articles/${slug}`;
const englishPath = `/en/articles/${slug}`;

describe("bilingual training and GEO article", () => {
  it("keeps reviewed content and language discovery paired", async () => {
    const [chinese, english, entries] = await Promise.all([
      getArticleBySlug(slug, "zh"),
      getArticleBySlug(slug, "en"),
      sitemap(),
    ]);

    expect(chinese).toMatchObject({
      title: "网页更新以后，大模型什么时候会读到？从训练文本讲到 GEO 检索",
      author: "实解智能",
      date: "2026-09-16",
      publicPath: chinesePath,
    });
    expect(english).toMatchObject({
      title: "When Does an AI Model Read an Updated Web Page? Training, Retrieval, and GEO",
      author: "SolveReal Systems",
      date: "2026-09-16",
      publicPath: englishPath,
    });
    expect(getLocaleSwitchPath(chinesePath, "en")).toBe(englishPath);
    expect(getLocaleSwitchPath(englishPath, "zh")).toBe(chinesePath);

    for (const [article, articlePath] of [[chinese, chinesePath], [english, englishPath]] as const) {
      expect(article?.content).toContain("https://arxiv.org/abs/2005.14165");
      expect(article?.content).toContain("https://arxiv.org/abs/2005.11401");
      expect(article?.content).toContain("https://developers.google.com/search/docs/appearance/ai-features");
      expect(entries.some((entry) => entry.url === `${siteUrl}${articlePath}`)).toBe(true);
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
