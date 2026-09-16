import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import { getLocaleSwitchPath } from "@/config/locale";
import { getArticleBySlug } from "@/lib/mdx/mdx";

const slug = "from-prompt-to-answer-how-text-llms-work";
const chinesePath = `/articles/${slug}`;
const englishPath = `/en/articles/${slug}`;
const primarySources = [
  "https://help.openai.com/en/articles/9237897-chatgpt-search",
  "https://developers.google.com/search/docs/appearance/ai-features",
  "https://arxiv.org/abs/2005.11401",
  "https://arxiv.org/abs/2305.14627",
];

describe("bilingual prompt-to-answer article", () => {
  it("publishes distinct web-search explanations with working language and sitemap routes", async () => {
    const [chinese, english, entries] = await Promise.all([
      getArticleBySlug(slug, "zh"),
      getArticleBySlug(slug, "en"),
      sitemap(),
    ]);

    expect(chinese).toMatchObject({
      author: "实解智能",
      date: "2026-09-16",
      publicPath: chinesePath,
      title: "从一个问题到带来源的回答：AI 搜索怎样使用网页",
    });
    expect(english).toMatchObject({
      author: "SolveReal Systems",
      date: "2026-09-16",
      publicPath: englishPath,
    });
    expect(getLocaleSwitchPath(chinesePath, "en")).toBe(englishPath);
    expect(getLocaleSwitchPath(englishPath, "zh")).toBe(chinesePath);

    for (const [article, articlePath] of [
      [chinese, chinesePath],
      [english, englishPath],
    ] as const) {
      for (const source of primarySources) {
        expect(article?.content).toContain(source);
      }
      expect(article?.content).toContain("geo.itheheda.online");
      expect(entries.some((entry) => entry.url === `https://me.itheheda.online${articlePath}`)).toBe(true);
    }
    expect(chinese?.content).not.toBe(english?.content);
  });

  it("binds each version to the reviewed article text", () => {
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
