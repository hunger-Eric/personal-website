import {
  ArticlePublicationRecordSchema,
  ArticleOriginSchema,
  ArticleResearchPlanInputSchema,
  ArticleSourceBoundWriteInputSchema,
  BusinessProfileSchema,
  PublicationReceiptSchema,
  SourceBoundArticleProposalSchema,
  SourceConfirmationSchema,
  SourcePacketResultSchema,
  assignResearchPlanIds,
  validateArticleEditorialQuality,
  validateSourceBoundArticleProposal,
  type ArticleWorkbenchFailureCode,
  type ArticleRunFailure,
  type ArticleWorkbenchRun,
  type BusinessProfilePort,
  type ModelPort,
  type PublisherPort,
  PublisherConflictError,
  type RunStorePort,
  type SearchPort,
  type SourceConfirmation,
} from "./contracts";
import { z } from "zod";
import { ArticlePublicationDefaultsSchema, formatArticle, formatOpenGeoMarkdownImport, type ArticlePublicationDefaults, type OpenGeoMarkdownImportInput } from "./article-format";
import type { OpenGeoArticleOutput } from "./open-geo-local";

export interface GenerateArticleInput {
  topic: string;
  articleRules: string[];
}

export const ArticleEditsInputSchema = z.object({
  confirmations: z.array(SourceConfirmationSchema),
  title: z.string().optional(), slugProposal: z.string().optional(), summary: z.string().optional(),
  tags: z.array(z.string()).optional(), body: z.string().optional(),
}).strict();
export type ArticleEditsInput = z.infer<typeof ArticleEditsInputSchema>;

export interface ArticleWorkflowDependencies {
  profile: BusinessProfilePort;
  generationPortsForRun(runId: string): { model: ModelPort; search: SearchPort };
  store: RunStorePort;
  publisher: PublisherPort;
  publicationDefaultsForRun(): ArticlePublicationDefaults;
  now?: () => Date;
}

export function createArticleWorkflow(dependencies: ArticleWorkflowDependencies) {
  return new ArticleWorkflow(dependencies);
}

class ArticleWorkflow {
  constructor(private readonly dependencies: ArticleWorkflowDependencies) {}

  async importOpenGeoMarkdown(input: Omit<OpenGeoMarkdownImportInput, "defaults">): Promise<ArticleWorkbenchRun> {
    const { store } = this.dependencies;
    const run = await store.createRun();
    const defaults = ArticlePublicationDefaultsSchema.parse(this.dependencies.publicationDefaultsForRun());
    const formatted = formatOpenGeoMarkdownImport({ ...input, defaults });
    await store.saveArtifact(run.id, "publicationDefaults", defaults);
    await store.saveArtifact(run.id, "articleOrigin", { type: "open_geo_markdown" });
    await store.saveArtifact(run.id, "validatedArticle", formatted.article);
    await store.saveArtifact(run.id, "renderedMdx", formatted.renderedMdx);
    await store.saveArtifact(run.id, "publicationRecord", formatted.publicationRecord);
    await store.updateRunStatus(run.id, "validated");
    return this.requireRun(run.id);
  }

  async completeOpenGeoGeneration(runId: string, output: OpenGeoArticleOutput): Promise<ArticleWorkbenchRun> {
    const run = await this.requireRun(runId);
    if (run.status !== "created") throw new Error("ARTICLE_EDIT_STATE_INVALID");
    const origin = ArticleOriginSchema.parse(await this.dependencies.store.loadArtifact(runId, "articleOrigin"));
    if (origin.type !== "open_geo_local") throw new Error("ARTICLE_EDIT_STATE_INVALID");
    const defaults = await this.publicationDefaults(runId);
    const formatted = formatOpenGeoMarkdownImport({
      markdown: `# ${output.title}\n\n${output.summary}\n\n${output.bodyMarkdown}`,
      slugProposal: `open-geo-${runId.slice(-12)}`,
      tags: ["GEO"],
      defaults,
    });
    await this.dependencies.store.saveArtifact(runId, "validatedArticle", formatted.article);
    await this.dependencies.store.saveArtifact(runId, "renderedMdx", formatted.renderedMdx);
    await this.dependencies.store.saveArtifact(runId, "publicationRecord", formatted.publicationRecord);
    await this.dependencies.store.updateRunStatus(runId, "validated");
    return this.requireRun(runId);
  }

  async generateArticle(input: GenerateArticleInput): Promise<ArticleWorkbenchRun> {
    const { store, profile: profilePort } = this.dependencies;
    const run = await store.createRun();
    const publicationDefaults = ArticlePublicationDefaultsSchema.parse(this.dependencies.publicationDefaultsForRun());
    await store.saveArtifact(run.id, "publicationDefaults", publicationDefaults);
    await store.saveArtifact(run.id, "input", input);
    const { model, search } = this.dependencies.generationPortsForRun(run.id);
    const profile = await this.atStage(run.id, "profile", "BUSINESS_PROFILE_INVALID", true, async () =>
      BusinessProfileSchema.parse(await profilePort.getProfile())
    );
    const plan = await this.atStage(run.id, "research_plan", "RESEARCH_PLAN_INVALID", false, async () => {
      const planInput = ArticleResearchPlanInputSchema.parse({ profile, topic: input.topic });
      return assignResearchPlanIds(await model.proposeResearchPlan(planInput));
    });
    await store.saveArtifact(run.id, "researchPlan", plan);
    await store.updateRunStatus(run.id, "research_planned");

    const packet = await this.atStage(run.id, "sources", "SOURCES_INVALID", false, async () =>
      SourcePacketResultSchema.parse(await search.collect(plan))
    );
    await store.saveArtifact(run.id, "sourcePacket", packet);
    if (packet.status !== "ok") return this.fail(run.id, "sources", "SOURCES_INSUFFICIENT", true);
    await store.updateRunStatus(run.id, "sources_ready");

    const article = await this.atStage(run.id, "article", "ARTICLE_MODEL_OUTPUT_INVALID", false, async () => {
      const writeInput = ArticleSourceBoundWriteInputSchema.parse({
        profile,
        topic: input.topic,
        editorialBrief: plan.editorialBrief,
        sources: packet.sources,
        articleRules: input.articleRules,
      });
      return validateSourceBoundArticleProposal(await model.writeSourceBoundArticle(writeInput), packet.sources);
    });
    await store.saveArtifact(run.id, "modelResponse", article);
    await store.updateRunStatus(run.id, "article_generated");
    const formatted = await this.atStage(run.id, "article", "ARTICLE_MODEL_OUTPUT_INVALID", false, async () =>
      formatArticle({ article, sources: packet.sources, defaults: publicationDefaults })
    );
    await store.saveArtifact(run.id, "validatedArticle", article);
    await store.saveArtifact(run.id, "renderedMdx", formatted.renderedMdx);
    await store.saveArtifact(run.id, "publicationRecord", formatted.publicationRecord);
    await store.updateRunStatus(run.id, "validated");
    return this.requireRun(run.id);
  }

  async saveArticleEdits(runId: string, edits: ArticleEditsInput): Promise<ArticleWorkbenchRun> {
    const run = await this.requireRun(runId);
    if (run.status !== "validated") throw new Error("ARTICLE_EDIT_STATE_INVALID");
    const parsedEdits = ArticleEditsInputSchema.parse(edits);
    const confirmations: SourceConfirmation[] = parsedEdits.confirmations;
    const distinct = new Set(confirmations.map((value) => value.sourceId));
    if (distinct.size !== confirmations.length) throw new Error("SOURCE_CONFIRMATION_INVALID");
    const article = await this.validatedArticle(runId);
    const assessedIds = new Set(article.sourceAssessments.map((assessment) => assessment.sourceId));
    if (confirmations.some((confirmation) => !assessedIds.has(confirmation.sourceId))) throw new Error("SOURCE_CONFIRMATION_INVALID");
    const imported = ArticleOriginSchema.safeParse(await this.dependencies.store.loadArtifact(runId, "articleOrigin")).success;
    if (imported) {
      if (confirmations.length) throw new Error("SOURCE_CONFIRMATION_INVALID");
      const previous = await this.edits(runId);
      const merged = { ...article, ...pickEditable(previous), ...pickEditable(parsedEdits), sourceAssessments: [] };
      const defaults = await this.publicationDefaults(runId);
      const formatted = formatOpenGeoMarkdownImport({
        markdown: `# ${merged.title}\n\n${merged.summary}\n\n${merged.body}`,
        slugProposal: merged.slugProposal,
        tags: merged.tags,
        defaults,
      });
      await this.dependencies.store.saveArtifact(runId, "articleEdits", { ...pickEditable(previous), ...pickEditable(parsedEdits), confirmations: [] });
      await this.dependencies.store.saveArtifact(runId, "validatedArticle", formatted.article);
      await this.dependencies.store.saveArtifact(runId, "renderedMdx", formatted.renderedMdx);
      await this.dependencies.store.saveArtifact(runId, "publicationRecord", formatted.publicationRecord);
      return this.requireRun(runId);
    }
    const packet = SourcePacketResultSchema.parse(await this.dependencies.store.loadArtifact(runId, "sourcePacket"));
    if (packet.status !== "ok") throw new Error("ARTICLE_EDIT_STATE_INVALID");
    const previous = await this.edits(runId);
    const editable = { title: article.title, slugProposal: article.slugProposal, summary: article.summary, tags: article.tags, body: article.body };
    const merged = { ...article, ...editable, ...pickEditable(previous), ...pickEditable(parsedEdits), sourceAssessments: article.sourceAssessments };
    const defaults = await this.publicationDefaults(runId);
    validateArticleEditorialQuality(merged, packet.sources);
    const formatted = formatArticle({ article: merged, sources: packet.sources, defaults });
    const validatedArticle = { ...merged, slugProposal: formatted.publicationRecord.slug };
    await this.dependencies.store.saveArtifact(runId, "articleEdits", { ...pickEditable(previous), ...pickEditable(parsedEdits), confirmations });
    await this.dependencies.store.saveArtifact(runId, "validatedArticle", validatedArticle);
    await this.dependencies.store.saveArtifact(runId, "renderedMdx", formatted.renderedMdx);
    await this.dependencies.store.saveArtifact(runId, "publicationRecord", formatted.publicationRecord);
    return this.requireRun(runId);
  }

  async submitPublication(runId: string) {
    const { store, publisher } = this.dependencies;
    const run = await this.requireRun(runId);
    if (run.status === "publish_submitted" || run.status === "published") {
      const receipt = await store.loadArtifact(runId, "publicationReceipt");
      if (!receipt) throw new Error("PUBLICATION_RECEIPT_MISSING");
      return PublicationReceiptSchema.parse(receipt);
    }
    if (run.status !== "validated") throw new Error("PUBLICATION_STATE_INVALID");
    const recordValue = await store.loadArtifact(runId, "publicationRecord");
    if (!recordValue) throw new Error("PUBLICATION_RECORD_REQUIRED");
    const record = ArticlePublicationRecordSchema.parse(recordValue);
    const claim = await store.claimPublication(runId, record);
    if (claim.status === "already_claimed") {
      const recoveredValue = await this.atPublicationStage(runId, () => publisher.recover(record));
      const recovered = recoveredValue === null ? null : PublicationReceiptSchema.parse(recoveredValue);
      if (recovered === null) throw new Error("PUBLICATION_ALREADY_CLAIMED");
      if (recovered.slug !== record.slug || recovered.contentHash !== record.contentHash) {
        await store.saveArtifact(runId, "publicationAttempt", recovered);
        return this.fail(runId, "publication", "PUBLISHER_CONFLICT", true);
      }
      const submittedRecovery = { ...recovered, status: "submitted" as const };
      await store.saveArtifact(runId, "publicationReceipt", submittedRecovery);
      await store.updateRunStatus(runId, "publish_submitted");
      return submittedRecovery;
    }
    const submitted = await this.atPublicationStage(runId, async () =>
      PublicationReceiptSchema.parse(await publisher.submit(record))
    );
    if (submitted.slug !== record.slug || submitted.contentHash !== record.contentHash) {
      await store.saveArtifact(runId, "publicationAttempt", submitted);
      return this.fail(runId, "publication", "PUBLISHER_CONFLICT", true);
    }
    await store.saveArtifact(runId, "publicationReceipt", submitted);
    await store.updateRunStatus(runId, "publish_submitted");
    return submitted;
  }

  async refreshPublication(runId: string) {
    const { store, publisher } = this.dependencies;
    const run = await this.requireRun(runId);
    if (run.status === "published") {
      const receipt = await store.loadArtifact(runId, "publicationReceipt");
      if (!receipt) throw new Error("PUBLICATION_RECEIPT_MISSING");
      return PublicationReceiptSchema.parse(receipt);
    }
    if (run.status !== "publish_submitted") throw new Error("PUBLICATION_REFRESH_STATE_INVALID");
    const storedValue = await store.loadArtifact(runId, "publicationReceipt");
    if (!storedValue) throw new Error("PUBLICATION_RECEIPT_MISSING");
    const stored = PublicationReceiptSchema.parse(storedValue);
    const verificationResponse = await this.atStage(runId, "verification", "VERIFICATION_MISMATCH", true, async () => publisher.verify(stored));
    await store.saveArtifact(runId, "verificationAttempt", verificationResponse);
    const verified = await this.atStage(runId, "verification", "VERIFICATION_MISMATCH", true, async () =>
      PublicationReceiptSchema.parse(verificationResponse)
    );
    if (verified.id !== stored.id || verified.slug !== stored.slug || verified.contentHash !== stored.contentHash) {
      return this.fail(runId, "verification", "VERIFICATION_MISMATCH", true);
    }
    await store.saveArtifact(runId, "publicationReceipt", verified);
    if (verified.status === "published") await store.updateRunStatus(runId, "published");
    return verified;
  }

  private async validatedArticle(runId: string) {
    const article = await this.dependencies.store.loadArtifact(runId, "validatedArticle");
    return SourceBoundArticleProposalSchema.parse(article);
  }

  private async edits(runId: string): Promise<ArticleEditsInput> {
    const value = await this.dependencies.store.loadArtifact(runId, "articleEdits");
    if (!value) {
      return { confirmations: [] };
    }
    return ArticleEditsInputSchema.parse(value);
  }

  private async publicationDefaults(runId: string): Promise<ArticlePublicationDefaults> {
    const parsed = ArticlePublicationDefaultsSchema.safeParse(
      await this.dependencies.store.loadArtifact(runId, "publicationDefaults")
    );
    if (!parsed.success) throw new Error("ARTICLE_WORKBENCH_READ_FAILED");
    return parsed.data;
  }

  private async requireRun(runId: string): Promise<ArticleWorkbenchRun> {
    const run = await this.dependencies.store.getRun(runId);
    if (!run) throw new Error("ARTICLE_RUN_NOT_FOUND");
    return run;
  }

  private async fail(runId: string, stage: ArticleRunFailure["stage"], code: ArticleWorkbenchFailureCode, userActionRequired: boolean): Promise<never> {
    const failure: ArticleRunFailure = {
      stage,
      code,
      message: safeMessage(code),
      occurredAt: (this.dependencies.now?.() ?? new Date()).toISOString(),
      userActionRequired,
    };
    await this.dependencies.store.updateRunStatus(runId, "failed", failure);
    throw new Error(code);
  }

  private async atStage<T>(runId: string, stage: ArticleRunFailure["stage"], code: ArticleWorkbenchFailureCode, userActionRequired: boolean, operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (isProviderReceiptPersistenceFailure(error)) {
        return this.fail(runId, stage, "PROVIDER_RECEIPT_PERSISTENCE_FAILED", true);
      }
      return this.fail(runId, stage, code, userActionRequired);
    }
  }

  private async atPublicationStage<T>(runId: string, operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof PublisherConflictError) {
        await this.dependencies.store.saveArtifact(runId, "publicationConflictEvidence", error.evidence);
      }
      return this.fail(runId, "publication", "PUBLISHER_CONFLICT", true);
    }
  }
}

function isProviderReceiptPersistenceFailure(error: unknown): boolean {
  return error instanceof Error && ["ARTICLE_MODEL_PERSISTENCE_FAILED", "ANYSEARCH_PERSISTENCE_FAILED"].includes(error.message);
}

function pickEditable(value: ArticleEditsInput): Omit<ArticleEditsInput, "confirmations"> {
  const editable = { ...value };
  delete editable.confirmations;
  return editable;
}

function safeMessage(code: string): string {
  return `${code.replace(/_/g, " ").toLowerCase()}.`;
}
