import {
  ArticlePublicationRecordSchema,
  ArticleResearchPlanInputSchema,
  ArticleSourceBoundWriteInputSchema,
  BusinessProfileSchema,
  PublicationReceiptSchema,
  SourceBoundArticleProposalSchema,
  SourceConfirmationSchema,
  SourcePacketResultSchema,
  assignResearchPlanIds,
  validateSourceBoundArticleProposal,
  type ArticleWorkbenchFailureCode,
  type ArticleRunFailure,
  type ArticleWorkbenchRun,
  type BusinessProfilePort,
  type ModelPort,
  type PublisherPort,
  type RunStorePort,
  type SearchPort,
  type SourceConfirmation,
} from "./contracts";

const authoritativeCategories = new Set(["official", "standard", "original_research", "peer_reviewed"]);

export interface GenerateArticleInput {
  topic: string;
  articleRules: string[];
}

export interface ArticleEditsInput {
  confirmations: SourceConfirmation[];
}

export interface ArticleWorkflowDependencies {
  profile: BusinessProfilePort;
  model: ModelPort;
  search: SearchPort;
  store: RunStorePort;
  publisher: PublisherPort;
  now?: () => Date;
}

export function createArticleWorkflow(dependencies: ArticleWorkflowDependencies) {
  return new ArticleWorkflow(dependencies);
}

class ArticleWorkflow {
  constructor(private readonly dependencies: ArticleWorkflowDependencies) {}

  async generateArticle(input: GenerateArticleInput): Promise<ArticleWorkbenchRun> {
    const { store, profile: profilePort, model, search } = this.dependencies;
    const run = await store.createRun();
    await store.saveArtifact(run.id, "input", input);
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
        sources: packet.sources,
        articleRules: input.articleRules,
      });
      return validateSourceBoundArticleProposal(await model.writeSourceBoundArticle(writeInput), packet.sources);
    });
    await store.saveArtifact(run.id, "modelResponse", article);
    await store.updateRunStatus(run.id, "article_generated");
    await store.saveArtifact(run.id, "validatedArticle", article);
    await store.updateRunStatus(run.id, "validated");
    return this.requireRun(run.id);
  }

  async saveArticleEdits(runId: string, edits: ArticleEditsInput): Promise<ArticleWorkbenchRun> {
    const run = await this.requireRun(runId);
    if (run.status !== "validated") throw new Error("ARTICLE_EDIT_STATE_INVALID");
    const confirmations: SourceConfirmation[] = edits.confirmations.map((value) => SourceConfirmationSchema.parse(value) as SourceConfirmation);
    const distinct = new Set(confirmations.map((value) => value.sourceId));
    if (distinct.size !== confirmations.length) throw new Error("SOURCE_CONFIRMATION_INVALID");
    const article = await this.validatedArticle(runId);
    const assessedIds = new Set(article.sourceAssessments.map((assessment) => assessment.sourceId));
    if (confirmations.some((confirmation) => !assessedIds.has(confirmation.sourceId))) throw new Error("SOURCE_CONFIRMATION_INVALID");
    await this.dependencies.store.saveArtifact(runId, "articleEdits", { confirmations });
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
    const article = await this.validatedArticle(runId);
    const edits = await this.edits(runId);
    const confirmed = new Set(edits.confirmations.map((value) => value.sourceId));
    const authoritative = article.sourceAssessments
      .filter((assessment) => authoritativeCategories.has(assessment.category) && confirmed.has(assessment.sourceId))
      .map((assessment) => assessment.sourceId);
    if (new Set(authoritative).size < 2) throw new Error("PUBLICATION_CONFIRMATION_REQUIRED");
    const recordValue = await store.loadArtifact(runId, "publicationRecord");
    if (!recordValue) throw new Error("PUBLICATION_RECORD_REQUIRED");
    const record = ArticlePublicationRecordSchema.parse(recordValue);
    const claim = await store.claimPublication(runId, record);
    if (claim.status === "already_claimed") throw new Error("PUBLICATION_ALREADY_CLAIMED");
    const submitted = await this.atStage(runId, "publication", "PUBLISHER_CONFLICT", true, async () =>
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
    await store.updateRunStatus(runId, verified.status === "published" ? "published" : "publish_submitted");
    return verified;
  }

  private async validatedArticle(runId: string) {
    const article = await this.dependencies.store.loadArtifact(runId, "validatedArticle");
    return SourceBoundArticleProposalSchema.parse(article);
  }

  private async edits(runId: string): Promise<ArticleEditsInput> {
    const value = await this.dependencies.store.loadArtifact(runId, "articleEdits");
    if (!value || typeof value !== "object" || !Array.isArray((value as { confirmations?: unknown }).confirmations)) {
      return { confirmations: [] };
    }
    const candidate = value as { confirmations: unknown[] };
    return {
      confirmations: candidate.confirmations.map((item) => SourceConfirmationSchema.parse(item) as SourceConfirmation),
    };
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
    } catch {
      return this.fail(runId, stage, code, userActionRequired);
    }
  }
}

function safeMessage(code: string): string {
  return `${code.replace(/_/g, " ").toLowerCase()}.`;
}
