import { z } from "zod";

export const ArticleRunStatusSchema = z.enum([
  "created",
  "research_planned",
  "sources_ready",
  "article_generated",
  "validated",
  "publish_submitted",
  "published",
  "failed",
]);
export type ArticleRunStatus = z.infer<typeof ArticleRunStatusSchema>;

export const ArticleWorkbenchFailureCodeSchema = z.enum([
  "BUSINESS_PROFILE_INVALID",
  "RESEARCH_PLAN_PROPOSAL_INVALID",
  "RESEARCH_PLAN_INVALID",
  "SOURCE_ASSESSMENT_INVALID",
]);
export type ArticleWorkbenchFailureCode = z.infer<
  typeof ArticleWorkbenchFailureCodeSchema
>;

const nonEmptyText = z.string().trim().min(1).max(2_000);

export const BusinessProfileSchema = z
  .object({
    identity: z
      .object({
        name: nonEmptyText,
        category: nonEmptyText,
        positioning: nonEmptyText,
        description: nonEmptyText,
      })
      .strict(),
    services: z.array(nonEmptyText).min(1).max(20),
    audience: nonEmptyText,
    geographicScope: z.array(nonEmptyText).max(20),
    differentiators: z.array(nonEmptyText).min(1).max(20),
    approvedEvidence: z
      .array(
        z
          .object({
            id: z.string().trim().min(1).max(120),
            claim: nonEmptyText,
            reviewed: z.literal(true),
          })
          .strict()
      )
      .max(50),
    disallowedClaims: z.array(nonEmptyText).min(1).max(20),
    callToAction: z
      .object({
        label: nonEmptyText,
        href: z.string().trim().min(1).max(500),
      })
      .strict()
      .optional(),
  })
  .strict();
export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;

export const ResearchQueryTypeSchema = z.enum(["general", "academic"]);
export type ResearchQueryType = z.infer<typeof ResearchQueryTypeSchema>;

const researchProposalQuerySchema = z
  .object({
    query: nonEmptyText,
    type: ResearchQueryTypeSchema,
  })
  .strict();

export const ResearchPlanProposalSchema = z
  .object({
    queries: z.array(researchProposalQuerySchema).min(2).max(5),
  })
  .strict();
export type ResearchPlanProposal = z.infer<typeof ResearchPlanProposalSchema>;

const researchQuerySchema = researchProposalQuerySchema.extend({
  id: z.string().regex(/^Q\d{3}$/),
});

export const ResearchPlanSchema = z
  .object({
    queries: z.array(researchQuerySchema).min(2).max(5),
  })
  .strict()
  .superRefine((plan, context) => {
    const seenIds = new Set<string>();
    plan.queries.forEach((query, index) => {
      const expectedId = `Q${String(index + 1).padStart(3, "0")}`;
      if (query.id !== expectedId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Research query ids must match their code-owned order",
          path: ["queries", index, "id"],
        });
      }
      if (seenIds.has(query.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Research query ids must be unique",
          path: ["queries", index, "id"],
        });
      }
      seenIds.add(query.id);
    });
  });
export type ResearchPlan = z.infer<typeof ResearchPlanSchema>;

export function assignResearchPlanIds(input: unknown): ResearchPlan {
  const proposal = ResearchPlanProposalSchema.parse(input);
  return ResearchPlanSchema.parse({
    queries: proposal.queries.map((query, index) => ({
      ...query,
      id: `Q${String(index + 1).padStart(3, "0")}`,
    })),
  });
}

export const SourceCategorySchema = z.enum([
  "official",
  "standard",
  "original_research",
  "peer_reviewed",
]);
export type SourceCategory = z.infer<typeof SourceCategorySchema>;

export const SourceAssessmentProposalSchema = z
  .object({
    category: SourceCategorySchema,
    rationale: nonEmptyText,
  })
  .strict();
export type SourceAssessmentProposal = z.infer<
  typeof SourceAssessmentProposalSchema
>;

const sourceIdSchema = z.string().regex(/^S\d{3}$/);

export const SourceAssessmentSchema = SourceAssessmentProposalSchema.extend({
  sourceId: sourceIdSchema,
}).strict();
export type SourceAssessment = z.infer<typeof SourceAssessmentSchema>;

export const SourceConfirmationSchema = z
  .object({
    sourceId: sourceIdSchema,
    confirmed: z.literal(true),
  })
  .strict();
export type SourceConfirmation = z.infer<typeof SourceConfirmationSchema>;

export interface SearchRequest {
  query: string;
  type: ResearchQueryType;
}

export const SourceCandidateSchema = z
  .object({
    id: sourceIdSchema,
    title: nonEmptyText,
    url: z.string().url().max(2_000),
    excerpt: nonEmptyText,
  })
  .strict();
export type SourceCandidate = z.infer<typeof SourceCandidateSchema>;

export function bindSourceAssessment(
  source: unknown,
  proposal: unknown
): SourceAssessment {
  const validatedSource = SourceCandidateSchema.parse(source);
  const validatedProposal = SourceAssessmentProposalSchema.parse(proposal);

  return SourceAssessmentSchema.parse({
    ...validatedProposal,
    sourceId: validatedSource.id,
  });
}

/**
 * Parses a completed assessment record at the trusted code-owned boundary.
 * Candidate-store membership validation is intentionally outside Task 1.
 */
export function parseTrustedSourceAssessmentRecord(input: unknown): SourceAssessment {
  return SourceAssessmentSchema.parse(input);
}

export interface BusinessProfilePort {
  getProfile(): Promise<BusinessProfile>;
}

export interface SearchPort {
  search(request: SearchRequest): Promise<SourceCandidate[]>;
}

export const ArticleResearchPlanInputSchema = z
  .object({
    profile: BusinessProfileSchema,
    topic: nonEmptyText,
  })
  .strict();
export type ArticleResearchPlanInput = z.infer<typeof ArticleResearchPlanInputSchema>;

export const ExtractedSourceSchema = SourceCandidateSchema.extend({
  content: nonEmptyText.max(20_000),
}).strict();
export type ExtractedSource = z.infer<typeof ExtractedSourceSchema>;

export const ArticleSourceBoundWriteInputSchema = z
  .object({
    profile: BusinessProfileSchema,
    topic: nonEmptyText,
    sources: z.array(ExtractedSourceSchema).min(1).max(8),
    articleRules: z.array(nonEmptyText).min(1).max(30),
  })
  .strict();
export type ArticleSourceBoundWriteInput = z.infer<typeof ArticleSourceBoundWriteInputSchema>;

const articleSourceAssessmentSchema = SourceAssessmentSchema.extend({
  claimsSupported: z.array(nonEmptyText).min(1).max(20),
}).strict();

export const SourceBoundArticleProposalSchema = z
  .object({
    title: nonEmptyText.max(200),
    slugProposal: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
    summary: nonEmptyText.max(2_000),
    tags: z.array(nonEmptyText.max(100)).min(1).max(10),
    body: nonEmptyText.max(40_000),
    sourceAssessments: z.array(articleSourceAssessmentSchema).min(1).max(8),
  })
  .strict();
export type SourceBoundArticleProposal = z.infer<typeof SourceBoundArticleProposalSchema>;

export function validateSourceBoundArticleProposal(
  input: unknown,
  sources: readonly ExtractedSource[]
): SourceBoundArticleProposal {
  const article = SourceBoundArticleProposalSchema.parse(input);
  const sourceIds = new Set(sources.map((source) => source.id));
  if (sourceIds.size !== sources.length) throw new Error("ARTICLE_MODEL_OUTPUT_INVALID");
  const assessments = new Set(article.sourceAssessments.map((assessment) => assessment.sourceId));
  if (assessments.size !== sourceIds.size || [...assessments].some((id) => !sourceIds.has(id))) {
    throw new Error("ARTICLE_MODEL_OUTPUT_INVALID");
  }
  const tokens = [...article.body.matchAll(/\[\[(S\d{3})\]\]/g)].map((match) => match[1]);
  if (!tokens.length || tokens.some((sourceId) => !sourceIds.has(sourceId))) {
    throw new Error("ARTICLE_MODEL_OUTPUT_INVALID");
  }
  if (/https?:\/\//i.test(article.body) || /^\s{0,3}#{1,6}\s*(sources|参考来源)\s*$/im.test(article.body)) {
    throw new Error("ARTICLE_MODEL_OUTPUT_INVALID");
  }
  return article;
}

export interface ModelPort {
  proposeResearchPlan(input: ArticleResearchPlanInput): Promise<ResearchPlanProposal>;
  writeSourceBoundArticle(input: ArticleSourceBoundWriteInput): Promise<SourceBoundArticleProposal>;
}

export interface RunStorePort {
  createRun(): Promise<{ id: string; status: ArticleRunStatus }>;
  updateRunStatus(id: string, status: ArticleRunStatus): Promise<void>;
}

export interface PublisherPort {
  submit(article: { title: string; body: string }): Promise<{ id: string }>;
}
