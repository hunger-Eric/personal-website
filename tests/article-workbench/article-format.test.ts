import { describe, expect, it } from "vitest";

import { formatArticle } from "@/lib/article-workbench/article-format";

const sources = [
  {
    id: "S001",
    title: "国家标准化管理委员会：生成式人工智能服务管理暂行办法",
    url: "https://www.gov.cn/zhengce/2023-07/13/content_6891600.htm",
    excerpt: "官方规定。",
    content: "官方全文。",
  },
  {
    id: "S002",
    title: "NIST AI Risk Management Framework",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    excerpt: "风险管理框架。",
    content: "NIST framework text.",
  },
];

const proposal = {
  title: "企业 AI 工作流：从试点到可验证交付",
  slugProposal: "Enterprise---AI-Workflow",
  summary: "用可验证的边界把 AI 试点推进到稳定交付。",
  tags: ["企业 AI", "工作流"],
  body: "## 先定义交付边界\r\n\r\n团队应先明确可复核的输出。[[S002]]\r\n\r\n| 阶段 | 证据 |\r\n| --- | --- |\r\n| 试点 | 人工复核 |\r\n\r\n再把治理要求写入流程。[[S001]] 重复引用仍保留。[[S002]]",
  sourceAssessments: [
    { sourceId: "S001", category: "official" as const, rationale: "官方规则。", claimsSupported: ["治理要求"] },
    { sourceId: "S002", category: "standard" as const, rationale: "框架。", claimsSupported: ["可复核输出"] },
  ],
};

describe("article workbench formatter", () => {
  it("renders deterministic citations, canonical MDX, and publication identity", () => {
    const result = formatArticle({ article: proposal, sources, defaults: { date: "2026-08-09", author: "fengc" } });

    expect(result).toMatchObject({
      publicationRecord: {
        title: proposal.title,
        slug: "enterprise-ai-workflow",
        contentHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        path: "content/articles/2026-08-09-enterprise-ai-workflow.mdx",
      },
    });
    expect(result.renderedMdx).toBe(`---
title: "企业 AI 工作流：从试点到可验证交付"
slug: "enterprise-ai-workflow"
summary: "用可验证的边界把 AI 试点推进到稳定交付。"
date: "2026-08-09"
category: "企业 AI 工作流"
tags: ["企业 AI", "工作流"]
featured: false
draft: false
author: "fengc"
contentHash: "${result.publicationRecord.contentHash}"
---

## 先定义交付边界

团队应先明确可复核的输出。〔1〕

| 阶段 | 证据 |
| --- | --- |
| 试点 | 人工复核 |

再把治理要求写入流程。〔2〕 重复引用仍保留。〔1〕

## 参考来源

1. [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
2. [国家标准化管理委员会：生成式人工智能服务管理暂行办法](https://www.gov.cn/zhengce/2023-07/13/content_6891600.htm)

## 相关链接

- [项目](/projects)
- [服务](/services)
- [联系](/contact)
`);
    expect(result.publicationRecord.body).toBe(result.renderedMdx);
  });

  it.each([
    ["unknown citation", { ...proposal, body: "正文。[[S999]] [[S001]]" }],
    ["malformed citation", { ...proposal, body: "正文。[[S01]] [[S001]]" }],
    ["missing cited assessment", { ...proposal, body: "正文。[[S001]]" }],
    ["body H1", { ...proposal, body: "# 标题\n\n正文。[[S001]] [[S002]]" }],
    ["spoofed sources heading", { ...proposal, body: "## Sources\n\n正文。[[S001]] [[S002]]" }],
    ["raw URL", { ...proposal, body: "https://example.com\n\n正文。[[S001]] [[S002]]" }],
    ["protocol-relative URL", { ...proposal, body: "//example.com\n\n正文。[[S001]] [[S002]]" }],
    ["unsafe MDX import", { ...proposal, body: "import X from 'x'\n\n正文。[[S001]] [[S002]]" }],
    ["unsafe MDX JSX", { ...proposal, body: "<Widget />\n\n正文。[[S001]] [[S002]]" }],
    ["unsafe MDX expression", { ...proposal, body: "{process.env.SECRET}\n\n正文。[[S001]] [[S002]]" }],
  ])("fails closed for %s", (_name, article) => {
    expect(() => formatArticle({ article, sources, defaults: { date: "2026-08-09", author: "fengc" } })).toThrow("ARTICLE_FORMAT_INVALID");
  });

  it("rejects a human edit that removes a supplied source assessment", () => {
    expect(() => formatArticle({
      article: { ...proposal, sourceAssessments: [proposal.sourceAssessments[0]] },
      sources,
      defaults: { date: "2026-08-09", author: "fengc" },
    })).toThrow("ARTICLE_FORMAT_INVALID");
  });

  it.each([
    ["multiline expression", "{\nprocess.env.SECRET\n}\n\n正文。[[S001]] [[S002]]"],
    ["full-width source heading", "## 参考来源：\n\n正文。[[S001]] [[S002]]"],
    ["related links heading", "## 相关链接 :\n\n正文。[[S001]] [[S002]]"],
  ])("rejects %s", (_name, body) => {
    expect(() => formatArticle({ article: { ...proposal, body }, sources, defaults: { date: "2026-08-09", author: "fengc" } })).toThrow("ARTICLE_FORMAT_INVALID");
  });

  it.each(["import\"module\"", "import*as module from 'x'", "export{}"])("rejects MDX ESM syntax %s", (body) => {
    expect(() => formatArticle({ article: { ...proposal, body: `${body}\n\n正文。[[S001]] [[S002]]` }, sources, defaults: { date: "2026-08-09", author: "fengc" } })).toThrow("ARTICLE_FORMAT_INVALID");
  });

  it.each(["import/*comment*/\"module\"", "export/*comment*/*from\"module\""])("rejects comment-delimited MDX ESM %s", (body) => {
    expect(() => formatArticle({ article: { ...proposal, body: `${body}\n\n正文。[[S001]] [[S002]]` }, sources, defaults: { date: "2026-08-09", author: "fengc" } })).toThrow("ARTICLE_FORMAT_INVALID");
  });

  it("keeps ordinary prose words with import/export prefixes", () => {
    expect(formatArticle({ article: { ...proposal, body: "An important exporter writes prose. [[S001]] [[S002]]" }, sources, defaults: { date: "2026-08-09", author: "fengc" } }).renderedMdx).toContain("important exporter");
  });

  it("rejects complete extracted-source replay, including short sources and split claims", () => {
    const replaySources = [
      { ...sources[0], content: "short source" },
      { ...sources[1], content: "a complete source sentence" },
    ];
    expect(() => formatArticle({ article: { ...proposal, body: "short source [[S001]] and independent wording [[S002]]." }, sources: replaySources, defaults: { date: "2026-08-09", author: "fengc" } })).toThrow("ARTICLE_FORMAT_INVALID");
    expect(() => formatArticle({ article: { ...proposal, body: "Independent wording [[S001]] and corroboration [[S002]].", sourceAssessments: [{ ...proposal.sourceAssessments[0], claimsSupported: ["a complete", "source sentence"] }, proposal.sourceAssessments[1]] }, sources: replaySources, defaults: { date: "2026-08-09", author: "fengc" } })).toThrow("ARTICLE_FORMAT_INVALID");
    expect(() => formatArticle({ article: { ...proposal, summary: "a complete source sentence", body: "Independent wording [[S001]] and corroboration [[S002]]." }, sources: replaySources, defaults: { date: "2026-08-09", author: "fengc" } })).toThrow("ARTICLE_FORMAT_INVALID");
  });

  it("keeps safe paraphrase distinct from the extracted source", () => {
    const replaySources = [{ ...sources[0], content: "a complete source sentence" }, { ...sources[1], content: "another evidence page" }];
    expect(formatArticle({ article: { ...proposal, body: "The guidance supports a cautious approach. [[S001]] Independent evidence corroborates it. [[S002]]" }, sources: replaySources, defaults: { date: "2026-08-09", author: "fengc" } }).renderedMdx).toContain("cautious approach");
  });

  it("escapes source URL parentheses in the generated Markdown destination", () => {
    const result = formatArticle({ article: proposal, sources: [{ ...sources[0], url: "https://example.com/a_(b)" }, sources[1]], defaults: { date: "2026-08-09", author: "fengc" } });
    expect(result.renderedMdx).toContain("https://example.com/a_%28b%29");
  });

  it("rejects unsafe source titles and renders a known publisher", () => {
    expect(() => formatArticle({ article: proposal, sources: [{ ...sources[0], title: "bad\n<Widget>{x}" }, sources[1]], defaults: { date: "2026-08-09", author: "fengc" } })).toThrow("ARTICLE_FORMAT_INVALID");
    expect(formatArticle({ article: proposal, sources: [{ ...sources[0], publisher: "国务院" }, sources[1]], defaults: { date: "2026-08-09", author: "fengc" } }).renderedMdx).toContain("（国务院）");
  });

  it("escapes frontmatter values and has a stable LF-only hash", () => {
    const edited = { ...proposal, title: 'A "quoted" title', summary: "First line\nSecond line", tags: ['x"y', "z"] };
    const first = formatArticle({ article: edited, sources, defaults: { date: "2026-08-09", author: 'fen"gc' } });
    const second = formatArticle({ article: { ...edited, body: edited.body.replace(/\r\n/g, "\n") }, sources, defaults: { date: "2026-08-09", author: 'fen"gc' } });

    expect(first.renderedMdx).toContain('title: "A \\"quoted\\" title"');
    expect(first.renderedMdx).toContain('summary: "First line Second line"');
    expect(first.renderedMdx).toContain('tags: ["x\\"y", "z"]');
    expect(first.renderedMdx).not.toContain("\r");
    expect(first.publicationRecord.contentHash).toBe(second.publicationRecord.contentHash);
  });
});
