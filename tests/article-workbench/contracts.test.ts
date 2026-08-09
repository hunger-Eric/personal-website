import { describe, expect, it } from "vitest";

import {
  ArticleRunStatusSchema,
  ResearchPlanProposalSchema,
  ResearchPlanSchema,
  SourceAssessmentSchema,
  SourceAssessmentProposalSchema,
  SourceCandidateSchema,
  assignResearchPlanIds,
  bindSourceAssessment,
  ArticleSourceBoundWriteInputSchema,
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

  it("rejects forged or non-sequential code-owned query identifiers", () => {
    expect(
      ResearchPlanSchema.safeParse({
        queries: [
          { id: "Q001", query: "AI workflow audit", type: "general" },
          { id: "Q999", query: "AI adoption research", type: "academic" },
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

  it("rejects model-supplied source identifiers", () => {
    expect(
      SourceAssessmentProposalSchema.safeParse({
        sourceId: "S001",
        category: "official",
        rationale: "Published by the responsible public body.",
      }).success
    ).toBe(false);
  });

  it("binds an assessment to the validated code-owned source identifier", () => {
    const source = SourceCandidateSchema.parse({
      id: "S007",
      title: "Official guidance",
      url: "https://example.com/guidance",
      excerpt: "A public body published this guidance.",
    });
    const proposal = SourceAssessmentProposalSchema.parse({
      category: "official",
      rationale: "Published by the responsible public body.",
    });

    expect(bindSourceAssessment(source, proposal)).toEqual({
      sourceId: "S007",
      category: "official",
      rationale: "Published by the responsible public body.",
    });
  });

  it("rejects an untrusted assessment proposal that tries to supply a source identifier", () => {
    const source = SourceCandidateSchema.parse({
      id: "S007",
      title: "Official guidance",
      url: "https://example.com/guidance",
      excerpt: "A public body published this guidance.",
    });

    expect(() =>
      bindSourceAssessment(source, {
        sourceId: "S999",
        category: "official",
        rationale: "Published by the responsible public body.",
      })
    ).toThrow();
  });

  it("rejects source assessment records with non-canonical source identifiers", () => {
    expect(
      SourceAssessmentSchema.safeParse({
        sourceId: "source-1",
        category: "official",
        rationale: "Published by the responsible public body.",
      }).success
    ).toBe(false);
  });

  it("keeps provider transport fields out of source-bound writing input contracts", () => {
    expect(ArticleSourceBoundWriteInputSchema.safeParse({
      profile: {
        identity: { name: "Example", category: "Consulting", positioning: "Practical", description: "Help." },
        services: ["Strategy"], audience: "Leaders", geographicScope: [], differentiators: ["Hands-on"], approvedEvidence: [], disallowedClaims: ["best"],
      }, topic: "AI controls", articleRules: ["Be useful"], sources: [{ id: "S001", title: "Guide", url: "https://example.com/guide", excerpt: "Excerpt", content: "Evidence" }],
      provider: "opencode_zen",
    }).success).toBe(false);
  });
});
