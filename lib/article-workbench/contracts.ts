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

export interface ModelPort {
  proposeResearchPlan(profile: BusinessProfile): Promise<ResearchPlanProposal>;
  assessSource(source: SourceCandidate): Promise<SourceAssessmentProposal>;
}

export interface RunStorePort {
  createRun(): Promise<{ id: string; status: ArticleRunStatus }>;
  updateRunStatus(id: string, status: ArticleRunStatus): Promise<void>;
}

export interface PublisherPort {
  submit(article: { title: string; body: string }): Promise<{ id: string }>;
}
