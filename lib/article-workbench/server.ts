import { z } from "zod";

import { defaultArticleBusinessProfile } from "@/config/article-business-profile";

import { createAnySearchResearchAdapter } from "./anysearch";
import { ArticleEditsInputSchema, createArticleWorkflow, type ArticleEditsInput } from "./core";
import { createArticleModelConfig, OpenAICompatibleModelProvider } from "./model";
import { createPersonalWebsitePublisher } from "./publisher";
import { createArticleWorkbenchRunStore } from "./run-store";
import { BusinessProfileSchema, PublicationReceiptSchema, SourceBoundArticleProposalSchema, SourcePacketResultSchema, type ArticleWorkbenchRun, type BusinessProfile } from "./contracts";

const MAX_BODY_BYTES = 64 * 1024;
const runIdSchema = z.string().regex(/^awr_[a-f0-9]{24}$/);

export const GenerateRequestSchema = z.object({
  topic: z.string().trim().min(1).max(2_000),
  articleRules: z.array(z.string().trim().min(1).max(2_000)).min(1).max(30),
}).strict();

export const ArticleEditsRequestSchema = z.object({
  confirmations: z.array(z.object({ sourceId: z.string().regex(/^S\d{3}$/), confirmed: z.literal(true) }).strict()).max(8),
  title: z.string().trim().min(1).max(200).optional(),
  slugProposal: z.string().trim().min(1).max(160).optional(),
  summary: z.string().trim().min(1).max(2_000).optional(),
  tags: z.array(z.string().trim().min(1).max(100)).min(1).max(10).optional(),
  body: z.string().trim().min(1).max(40_000).optional(),
}).strict();

export interface ArticleWorkbenchServer {
  getProfile(): Promise<BusinessProfile>;
  saveProfile(profile: BusinessProfile): Promise<BusinessProfile>;
  generate(input: z.infer<typeof GenerateRequestSchema>): Promise<ArticleWorkbenchRun>;
  getRun(runId: string): Promise<SafeRun | null>;
  saveEdits(runId: string, edits: ArticleEditsInput): Promise<SafeRun>;
  submit(runId: string): Promise<{ id: string; slug: string; contentHash: string; status: "submitted" | "published" }>;
  refresh(runId: string): Promise<{ id: string; slug: string; contentHash: string; status: "submitted" | "published" }>;
}

export interface SafeRun {
  id: string;
  status: ArticleWorkbenchRun["status"];
  failure?: ArticleWorkbenchRun["failure"];
  article?: { title: string; slugProposal: string; summary: string; tags: string[]; body: string; sourceAssessments: Array<{ sourceId: string; category: "official" | "standard" | "original_research" | "peer_reviewed"; rationale?: string; claimsSupported?: string[] }> };
  sources?: Array<{ id: string; title: string; url: string; publisher?: string }>;
  confirmations?: Array<{ sourceId: string; confirmed: true }>;
  previewMdx?: string;
  publication?: { id: string; slug: string; contentHash: string; status: "submitted" | "published" };
}

export interface ArticleWorkbenchServerOptions { rootDir?: string; }

export function createArticleWorkbenchServer(environment: Record<string, string | undefined> = process.env, options: ArticleWorkbenchServerOptions = {}): ArticleWorkbenchServer {
  const modelConfig = createArticleModelConfig(environment);
  const store = createArticleWorkbenchRunStore({ rootDir: options.rootDir });
  const profilePort = {
    async getProfile() {
      return BusinessProfileSchema.parse((await store.loadProfile()) ?? defaultArticleBusinessProfile);
    },
  };
  const model = new OpenAICompatibleModelProvider({ config: modelConfig });
  const search = createAnySearchResearchAdapter({ apiKey: environment.ANYSEARCH_API_KEY });
  const publisher = createPersonalWebsitePublisher({ siteUrl: environment.NEXT_PUBLIC_BASE_URL });
  const workflow = createArticleWorkflow({
    profile: profilePort,
    model,
    search,
    store,
    publisher,
    publicationDefaults: { date: new Date().toISOString().slice(0, 10), author: defaultArticleBusinessProfile.identity.name },
  });

  return {
    async getProfile() {
      return BusinessProfileSchema.parse((await store.loadProfile()) ?? defaultArticleBusinessProfile);
    },
    async saveProfile(profile) {
      const validated = BusinessProfileSchema.parse(profile);
      await store.saveProfile(validated);
      return validated;
    },
    generate(input) {
      const parsed = GenerateRequestSchema.parse(input) as { topic: string; articleRules: string[] };
      return workflow.generateArticle(parsed);
    },
    async getRun(runId) {
      runIdSchema.parse(runId);
      const run = await store.getRun(runId);
      return run ? safeRun(run, store) : null;
    },
    async saveEdits(runId, edits) {
      runIdSchema.parse(runId);
      await workflow.saveArticleEdits(runId, ArticleEditsRequestSchema.parse(edits));
      const run = await store.getRun(runId);
      if (!run) throw new Error("ARTICLE_RUN_NOT_FOUND");
      return safeRun(run, store);
    },
    async submit(runId) { runIdSchema.parse(runId); return PublicationReceiptSchema.parse(await workflow.submitPublication(runId)) as { id: string; slug: string; contentHash: string; status: "submitted" | "published" }; },
    async refresh(runId) { runIdSchema.parse(runId); return PublicationReceiptSchema.parse(await workflow.refreshPublication(runId)) as { id: string; slug: string; contentHash: string; status: "submitted" | "published" }; },
  };
}

let server: ArticleWorkbenchServer | undefined;
export function getArticleWorkbenchServer(): ArticleWorkbenchServer {
  server ??= createArticleWorkbenchServer();
  return server;
}

async function safeRun(run: ArticleWorkbenchRun, store: ReturnType<typeof createArticleWorkbenchRunStore>): Promise<SafeRun> {
  const safe: SafeRun = { id: run.id, status: run.status, ...(run.failure ? { failure: run.failure } : {}) };
  const [article, packet, edits, previewMdx, publication] = await Promise.all([
    store.loadArtifact(run.id, "validatedArticle"), store.loadArtifact(run.id, "sourcePacket"), store.loadArtifact(run.id, "articleEdits"), store.loadArtifact(run.id, "renderedMdx"), store.loadArtifact(run.id, "publicationReceipt"),
  ]);
  const parsedPacket = SourcePacketResultSchema.safeParse(packet);
  const sourceContents = parsedPacket.success && parsedPacket.data.status === "ok" ? parsedPacket.data.sources.map((source) => source.content) : [];
  const parsedArticle = SourceBoundArticleProposalSchema.safeParse(article);
  if (parsedArticle.success) {
    safe.article = {
      title: parsedArticle.data.title,
      slugProposal: parsedArticle.data.slugProposal,
      summary: parsedArticle.data.summary,
      tags: parsedArticle.data.tags,
      body: parsedArticle.data.body,
      sourceAssessments: parsedArticle.data.sourceAssessments.map((assessment) => {
        const rationale = safeAssessmentText(assessment.rationale, sourceContents, 500);
        const claimsSupported = safeClaims(assessment.claimsSupported, sourceContents);
        return { sourceId: assessment.sourceId, category: assessment.category, ...(rationale ? { rationale } : {}), ...(claimsSupported.length ? { claimsSupported } : {}) };
      }),
    };
  }
  if (parsedPacket.success && parsedPacket.data.status === "ok") {
    safe.sources = parsedPacket.data.sources.map(({ id, title, url, publisher }) => ({ id, title, url, ...(publisher ? { publisher } : {}) }));
  }
  const parsedEdits = ArticleEditsInputSchema.safeParse(edits);
  if (parsedEdits.success) {
    safe.confirmations = parsedEdits.data.confirmations.flatMap((confirmation) =>
      typeof confirmation.sourceId === "string" && confirmation.confirmed === true
        ? [{ sourceId: confirmation.sourceId, confirmed: true as const }]
        : []
    );
  }
  if (typeof previewMdx === "string") safe.previewMdx = previewMdx;
  const parsedPublication = PublicationReceiptSchema.safeParse(publication);
  if (parsedPublication.success) safe.publication = parsedPublication.data as { id: string; slug: string; contentHash: string; status: "submitted" | "published" };
  return safe;
}

function safeAssessmentText(value: string, sourceContents: readonly string[], maximumLength: number): string | undefined {
  if (value.length > maximumLength || sourceContents.some((content) => value.length >= 24 && content.includes(value))) return undefined;
  return value;
}

function safeClaims(values: readonly string[], sourceContents: readonly string[]): string[] {
  return values.slice(0, 5).flatMap((value) => {
    const safe = safeAssessmentText(value, sourceContents, 300);
    return safe ? [safe] : [];
  });
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) throw new Error("ARTICLE_REQUEST_TOO_LARGE");
  if (!request.body) throw new Error("ARTICLE_REQUEST_INVALID");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let byteLength = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => undefined);
        throw new Error("ARTICLE_REQUEST_TOO_LARGE");
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } catch (error) {
    if (error instanceof Error && error.message === "ARTICLE_REQUEST_TOO_LARGE") throw error;
    throw new Error("ARTICLE_REQUEST_INVALID");
  }
  try { return JSON.parse(text); } catch { throw new Error("ARTICLE_REQUEST_INVALID"); }
}

export function parseRunId(value: string): string { return runIdSchema.parse(value); }

export function articleApiError(error: unknown): { status: number; body: { error: string } } {
  const code = error instanceof Error ? error.message : "ARTICLE_REQUEST_INVALID";
  if (code === "ARTICLE_REQUEST_TOO_LARGE") return { status: 413, body: { error: "Request body too large" } };
  if (code === "ARTICLE_RUN_NOT_FOUND") return { status: 404, body: { error: "Not Found" } };
  if (code.includes("STATE_INVALID") || code.includes("CONFIRMATION_REQUIRED") || code.includes("ALREADY_CLAIMED") || code.includes("PUBLISHER_CONFLICT") || code.includes("CLAIM_CONFLICT") || code.includes("TRANSITION_INVALID") || code.includes("RECEIPT_MISSING") || code.includes("RECORD_REQUIRED")) return { status: 409, body: { error: "Article workflow conflict" } };
  if (code.includes("REQUEST_FAILED") || code.includes("PROVIDER_FAILED") || code.includes("PERSISTENCE_FAILED") || code.includes("WORKBENCH_READ_FAILED") || code === "VERIFICATION_MISMATCH") return { status: 502, body: { error: "Article provider unavailable" } };
  if (error instanceof z.ZodError || code === "ARTICLE_REQUEST_INVALID") return { status: 400, body: { error: "Invalid request" } };
  if (code.includes("INVALID") || code.includes("SOURCES_INSUFFICIENT")) return { status: 422, body: { error: "Article input or evidence is invalid" } };
  return { status: 400, body: { error: "Invalid request" } };
}
