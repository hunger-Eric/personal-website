import { describe, expect, it } from "vitest";

import {
  getPublishedProjectCases,
  parsePublicProjectCases,
  publicProjectCaseSchema,
  publicProjectCasesSchema,
} from "@/config/project-case-schema";
import publicProjectCases from "@/config/public-project-cases.json";

const localized = (zh: string, en: string) => ({ zh, en });

const publishedCase = {
  id: "workflow-proof",
  name: localized("流程证明案例", "Workflow proof case"),
  publicStatus: "published" as const,
  sourceVisibility: "private-curated" as const,
  purpose: localized("减少人工交接错误", "Reduce manual handoff errors"),
  currentStatus: localized("已在受控范围运行", "Running in a controlled scope"),
  reviewedAt: "2026-07-12",
  review: {
    approvedForPublic: true,
    approvedBy: "site-owner",
  },
};

describe("publicProjectCaseSchema", () => {
  it("accepts a reviewed high-level private-curated case", () => {
    expect(publicProjectCaseSchema.parse(publishedCase)).toMatchObject({
      id: "workflow-proof",
      publicStatus: "published",
    });
  });

  it("allows an unpublished draft without invented fact fields", () => {
    expect(
      publicProjectCaseSchema.parse({
        id: "draft-case",
        name: localized("待审案例", "Case pending review"),
        publicStatus: "draft",
        sourceVisibility: "public",
      })
    ).toMatchObject({ publicStatus: "draft" });
  });

  it("requires human approval and core facts before publication", () => {
    const result = publicProjectCaseSchema.safeParse({
      id: "unsafe-publication",
      name: localized("未审核案例", "Unreviewed case"),
      publicStatus: "published",
      sourceVisibility: "public",
    });

    expect(result.success).toBe(false);
  });

  it("rejects source links for private-curated cases", () => {
    const result = publicProjectCaseSchema.safeParse({
      ...publishedCase,
      evidenceArtifacts: [
        {
          id: "source",
          label: localized("源仓库", "Source repository"),
          kind: "document",
          href: "https://github.com/example/private-repository",
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it.each([
    "C:\\Users\\owner\\private\\PROJECT-STATE.md",
    "/home/owner/private/project/README.md",
    "ghp_abcdefghijklmnopqrstuvwxyz1234567890",
    "Bearer secret-token-value",
  ])("rejects sensitive public strings: %s", (sensitiveValue) => {
    const result = publicProjectCaseSchema.safeParse({
      ...publishedCase,
      limitations: [localized(sensitiveValue, "Public-safe limitation")],
    });

    expect(result.success).toBe(false);
  });
});

describe("publicProjectCasesSchema", () => {
  it("accepts an empty reviewed collection before case approval", () => {
    expect(publicProjectCasesSchema.parse([])).toEqual([]);
  });

  it("rejects duplicate public ids", () => {
    const result = publicProjectCasesSchema.safeParse([
      publishedCase,
      { ...publishedCase },
    ]);

    expect(result.success).toBe(false);
  });

  it("loads only reviewed published cases from the committed public config", () => {
    const parsed = parsePublicProjectCases(publicProjectCases);
    const published = getPublishedProjectCases(parsed);

    expect(published.map((project) => project.id)).toEqual([
      "freight-lead-agent",
    ]);
    expect(published[0].review.approvedForPublic).toBe(true);
  });
});
