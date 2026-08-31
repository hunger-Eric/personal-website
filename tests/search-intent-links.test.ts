import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

function readArticle(filename: string) {
  return fs.readFileSync(path.join(process.cwd(), "content", "articles", filename), "utf8");
}

describe("search-intent article links", () => {
  it("links knowledge-base guidance to the reviewed Hermes evidence", () => {
    const article = readArticle("2026-08-10-knowledge-base-ai-governance-preparation.mdx");

    expect(article).toContain("[企业知识库与 AI 应用项目](/projects/hermes-notebook)");
  });

  it("links lead-workflow guidance to the reviewed Google Maps prospecting evidence", () => {
    const article = readArticle(
      "2026-08-10-lead-process-ai-automation-four-dimensions-real-sample-validation.mdx"
    );

    expect(article).toContain("[Google 地图获客与定制营销系统](/projects/freight-lead-agent)");
  });
});
