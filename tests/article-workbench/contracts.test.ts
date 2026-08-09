import { describe, expect, it } from "vitest";

import {
  ArticleRunStatusSchema,
  ResearchPlanProposalSchema,
  ResearchPlanSchema,
  SourceAssessmentSchema,
  assignResearchPlanIds,
} from "@/lib/article-workbench/contracts";

describe("article-workbench contracts", () => {
  it("rejects unsupported article run statuses", () => {
    expect(ArticleRunStatusSchema.safeParse("queued").success).toBe(false);
    expect(ArticleRunStatusSchema.safeParse("published").success).toBe(true);
  });

  it("rejects proposal-supplied query identifiers", () => {
    expect(
      ResearchPlanProposalSchema.safeParse({
        queries: [
          { id: "Q001", query: "AI workflow audit", type: "general" },
          { query: "AI adoption research", type: "academic" },
        ],
      }).success
    ).toBe(false);
  });

  it("rejects research plans with duplicate code-owned query identifiers", () => {
    expect(
      ResearchPlanSchema.safeParse({
        queries: [
          { id: "Q001", query: "AI workflow audit", type: "general" },
          { id: "Q001", query: "AI adoption research", type: "academic" },
        ],
      }).success
    ).toBe(false);
  });

  it("rejects proposals with more than five queries", () => {
    expect(
      ResearchPlanProposalSchema.safeParse({
        queries: Array.from({ length: 6 }, (_, index) => ({
          query: `query ${index + 1}`,
          type: "general",
        })),
      }).success
    ).toBe(false);
  });

  it("assigns stable query identifiers in proposal order", () => {
    expect(
      assignResearchPlanIds({
        queries: [
          { query: "AI workflow audit", type: "general" },
          { query: "human review AI research", type: "academic" },
        ],
      })
    ).toEqual({
      queries: [
        { id: "Q001", query: "AI workflow audit", type: "general" },
        { id: "Q002", query: "human review AI research", type: "academic" },
      ],
    });
  });

  it("keeps human confirmation out of model source assessments", () => {
    expect(
      SourceAssessmentSchema.safeParse({
        sourceId: "S001",
        category: "official",
        rationale: "Published by the responsible public body.",
        confirmed: true,
      }).success
    ).toBe(false);
  });
});
