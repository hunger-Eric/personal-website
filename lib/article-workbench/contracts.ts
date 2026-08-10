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
  "SOURCES_INSUFFICIENT",
  "SOURCES_INVALID",
  "ARTICLE_MODEL_OUTPUT_INVALID",
  "PROVIDER_RECEIPT_PERSISTENCE_FAILED",
  "PUBLISHER_CONFLICT",
  "VERIFICATION_MISMATCH",
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

export const EditorialBriefSchema = z
  .object({
    readerQuestion: nonEmptyText.max(500),
    centralThesis: nonEmptyText.max(1_000),
    evidenceNeeds: z.array(nonEmptyText.max(500)).min(3).max(8),
  })
  .strict();
export type EditorialBrief = z.infer<typeof EditorialBriefSchema>;

export const ARTICLE_VISIBLE_PROSE_MINIMUM = 500;
export const ARTICLE_PROSE_PARAGRAPH_MINIMUM = 5;
export const ARTICLE_SUBSTANTIVE_PARAGRAPH_MINIMUM = 4;
export const ARTICLE_SUBSTANTIVE_PARAGRAPH_LENGTH = 60;

export const ResearchPlanProposalSchema = z
  .object({
    editorialBrief: EditorialBriefSchema,
    queries: z.array(researchProposalQuerySchema).min(2).max(5),
  })
  .strict();
export type ResearchPlanProposal = z.infer<typeof ResearchPlanProposalSchema>;

const researchQuerySchema = researchProposalQuerySchema.extend({
  id: z.string().regex(/^Q\d{3}$/),
});

export const ResearchPlanSchema = z
  .object({
    editorialBrief: EditorialBriefSchema,
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
    editorialBrief: proposal.editorialBrief,
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

export const ArticleRunFailureSchema = z.object({
  stage: z.enum(["profile", "research_plan", "sources", "article", "publication", "verification"]),
  code: ArticleWorkbenchFailureCodeSchema,
  message: nonEmptyText.max(500),
  occurredAt: z.string().datetime(),
  userActionRequired: z.boolean(),
}).strict();
export type ArticleRunFailure = z.infer<typeof ArticleRunFailureSchema>;

export const ArticleWorkbenchRunSchema = z.object({
  id: z.string().regex(/^awr_[a-f0-9]{24}$/),
  status: ArticleRunStatusSchema,
  failure: ArticleRunFailureSchema.optional(),
}).strict().superRefine((run, context) => {
  if (run.status === "failed" && !run.failure) context.addIssue({ code: z.ZodIssueCode.custom, path: ["failure"], message: "Failed runs require a failure record" });
  if (run.status !== "failed" && run.failure) context.addIssue({ code: z.ZodIssueCode.custom, path: ["failure"], message: "Only failed runs may have a failure record" });
});
export type ArticleWorkbenchRun = z.infer<typeof ArticleWorkbenchRunSchema>;

export const ArticleWorkbenchArtifactSchema = z.enum([
  "input", "publicationDefaults", "researchPlan", "sourcePacket", "modelResponse", "modelProviderReceipts", "searchProviderReceipts", "validatedArticle", "articleEdits", "publicationRecord", "publicationAttempt", "publicationConflictEvidence", "verificationAttempt", "renderedMdx", "publicationReceipt",
]);
export type ArticleWorkbenchArtifact = z.infer<typeof ArticleWorkbenchArtifactSchema>;

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
  collect(plan: ResearchPlan): Promise<SourcePacketResult>;
}

export const ArticleResearchPlanInputSchema = z
  .object({
    profile: BusinessProfileSchema,
    topic: nonEmptyText,
  })
  .strict();
export type ArticleResearchPlanInput = z.infer<typeof ArticleResearchPlanInputSchema>;

export const ExtractedSourceSchema = SourceCandidateSchema.extend({
  content: z.string().trim().min(1).max(20_000),
  publisher: nonEmptyText.max(200).optional(),
}).strict().superRefine((source, context) => {
  if (normalizeEvidenceText(source.content).length < 24) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["content"], message: "Extracted source content is too short for evidence attribution" });
  }
});
export type ExtractedSource = z.infer<typeof ExtractedSourceSchema>;

export function normalizeEvidenceText(value: string): string {
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (/^extract_[a-z0-9_]+(?:\s|$)/i.test(normalized)) return "";
  return normalized
    .replace(/^\*\*Source\*\*:\s*https?:\/\/\S+\s*(?:---\s*)?/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const SourcePacketResultSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("ok"), sources: z.array(ExtractedSourceSchema).min(2).max(8) }).strict(),
  z.object({ status: z.literal("insufficient_sources"), sources: z.array(ExtractedSourceSchema).max(8) }).strict(),
]);
export type SourcePacketResult = z.infer<typeof SourcePacketResultSchema>;

export const ArticleSourceBoundWriteInputSchema = z
  .object({
    profile: BusinessProfileSchema,
    topic: nonEmptyText,
    editorialBrief: EditorialBriefSchema,
    sources: z.array(ExtractedSourceSchema).min(2).max(8),
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
  const citationTokens = [...article.body.matchAll(/\[\[([^\]]*)\]\]/g)].map((match) => match[1]);
  if (!citationTokens.length || citationTokens.some((sourceId) => !/^S\d{3}$/.test(sourceId) || !sourceIds.has(sourceId))) {
    throw new Error("ARTICLE_MODEL_OUTPUT_INVALID");
  }
  const nonCitationBody = article.body.replace(/\[\[S\d{3}\]\]/g, "");
  if (nonCitationBody.includes("[[") || nonCitationBody.includes("]]")) {
    throw new Error("ARTICLE_MODEL_OUTPUT_INVALID");
  }
  const outputText = [
    article.title,
    article.summary,
    ...article.tags,
    article.body,
    ...article.sourceAssessments.flatMap((assessment) => [assessment.rationale, ...assessment.claimsSupported]),
  ];
  if (outputText.some(isForbiddenModelOutputText)) {
    throw new Error("ARTICLE_MODEL_OUTPUT_INVALID");
  }
  validateArticleEditorialQuality(article, sources);
  return article;
}

/** Deterministic material floor, deliberately limited to visible prose and source binding. */
export function validateArticleEditorialQuality(article: SourceBoundArticleProposal, sources: readonly ExtractedSource[]): void {
  const proseParagraphs = article.body
    .replace(/\[\[S\d{3}\]\]/g, "")
    .split(/\n\s*\n/)
    .map((block) => block.replace(/^#{1,6}\s+.*$/gm, "").replace(/^\|.*$/gm, "").replace(/[-|:]/g, "").replace(/\s+/g, " ").trim())
    .filter((block) => block.length > 0);
  const substantiveParagraphs = proseParagraphs.filter((paragraph) => paragraph.length >= ARTICLE_SUBSTANTIVE_PARAGRAPH_LENGTH);
  const citedSourceIds = new Set([...article.body.matchAll(/\[\[(S\d{3})\]\]/g)].map((match) => match[1]));
  const sourceIds = new Set(sources.map((source) => source.id));
  const concreteEvidenceItems = sources.filter((source) => normalizeEvidenceText(source.content).length >= 48).length;
  if (
    proseParagraphs.join("").length < ARTICLE_VISIBLE_PROSE_MINIMUM ||
    proseParagraphs.length < ARTICLE_PROSE_PARAGRAPH_MINIMUM ||
    substantiveParagraphs.length < ARTICLE_SUBSTANTIVE_PARAGRAPH_MINIMUM ||
    concreteEvidenceItems < 1 ||
    citedSourceIds.size !== sourceIds.size ||
    [...citedSourceIds].some((id) => !sourceIds.has(id))
  ) throw new Error("ARTICLE_MODEL_OUTPUT_INVALID");
  const bodyBlocks = article.body
    .split(/\n\s*\n/)
    .map((block) => block.replace(/^#{1,6}\s+.*(?:\n|$)/, "").trim())
    .filter(Boolean);
  if (bodyBlocks.some((block) => block.replace(/\[\[S\d{3}\]\]/g, "").replace(/\s+/g, " ").trim().length >= ARTICLE_SUBSTANTIVE_PARAGRAPH_LENGTH && !/\[\[S\d{3}\]\]/.test(block))) {
    throw new Error("ARTICLE_MODEL_OUTPUT_INVALID");
  }
}

function isForbiddenModelOutputText(value: string): boolean {
  return /https?:\/\/|\/\/\S|(?:^|[\s(\[])www\./i.test(value) || /^\s*(?:#{1,6}\s*)?(?:sources|参考来源)\s*:?[\s]*$/im.test(value);
}

export interface ModelPort {
  proposeResearchPlan(input: ArticleResearchPlanInput): Promise<ResearchPlanProposal>;
  writeSourceBoundArticle(input: ArticleSourceBoundWriteInput): Promise<SourceBoundArticleProposal>;
}

export interface RunStorePort {
  createRun(): Promise<ArticleWorkbenchRun>;
  getRun(id: string): Promise<ArticleWorkbenchRun | null>;
  updateRunStatus(id: string, status: ArticleRunStatus, failure?: ArticleRunFailure): Promise<void>;
  saveArtifact(id: string, artifact: ArticleWorkbenchArtifact, value: unknown): Promise<void>;
  loadArtifact(id: string, artifact: ArticleWorkbenchArtifact): Promise<unknown | null>;
  claimPublication(id: string, record: ArticlePublicationRecord): Promise<PublicationClaimResult>;
}

const publicationPathSchema = z.string().regex(/^content\/articles\/\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.mdx$/);
export const CanonicalContentHashSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
export const CanonicalRemoteIdSchema = z.string().regex(/^[a-f0-9]{40}$/);
const articlePublicationRecordBaseSchema = z.object({
  title: nonEmptyText.max(200),
  body: z.string().trim().min(1).max(40_000),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
  contentHash: CanonicalContentHashSchema,
  path: publicationPathSchema,
}).strict();
export const ArticlePublicationRecordSchema = articlePublicationRecordBaseSchema.superRefine((record, context) => {
  const match = /^content\/articles\/(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.mdx$/.exec(record.path);
  if (!match || Number.isNaN(new Date(`${match[1]}T00:00:00.000Z`).valueOf()) || new Date(`${match[1]}T00:00:00.000Z`).toISOString().slice(0, 10) !== match[1] || match[2] !== record.slug) context.addIssue({ code: z.ZodIssueCode.custom, path: ["path"], message: "Publication path must match its canonical date and slug" });
});
export type ArticlePublicationRecord = z.infer<typeof ArticlePublicationRecordSchema>;

export const PublicationConflictEvidenceSchema = z.object({
  expectedContentHash: CanonicalContentHashSchema,
  observedContentHash: z.union([CanonicalContentHashSchema, z.literal("untrusted_invalid")]),
  slug: articlePublicationRecordBaseSchema.shape.slug,
  path: publicationPathSchema,
  remoteId: z.union([CanonicalRemoteIdSchema, z.literal("untrusted_invalid")]).optional(),
}).strict();
export type PublicationConflictEvidence = z.infer<typeof PublicationConflictEvidenceSchema>;

export class PublisherConflictError extends Error {
  readonly evidence: PublicationConflictEvidence;

  constructor(evidence: PublicationConflictEvidence) {
    super("PUBLISHER_CONFLICT");
    this.name = "PublisherConflictError";
    this.evidence = PublicationConflictEvidenceSchema.parse(evidence);
  }
}

export const PublicationReceiptSchema = z.object({
  id: nonEmptyText.max(500),
  slug: articlePublicationRecordBaseSchema.shape.slug,
  contentHash: articlePublicationRecordBaseSchema.shape.contentHash,
  status: z.enum(["submitted", "published"]),
}).strict();
export type PublicationReceipt = z.infer<typeof PublicationReceiptSchema>;

export const PublicationClaimResultSchema = z.object({
  status: z.enum(["claimed", "already_claimed"]),
}).strict();
export type PublicationClaimResult = z.infer<typeof PublicationClaimResultSchema>;

export interface PublisherPort {
  submit(article: ArticlePublicationRecord): Promise<PublicationReceipt>;
  recover(article: ArticlePublicationRecord): Promise<PublicationReceipt | null>;
  verify(receipt: PublicationReceipt): Promise<PublicationReceipt>;
}
