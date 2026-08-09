import { z } from "zod";

import { defaultArticleBusinessProfile } from "@/config/article-business-profile";

import { createAnySearchResearchAdapter } from "./anysearch";
import { createArticleWorkflow, type ArticleEditsInput } from "./core";
import { createArticleModelConfig, OpenAICompatibleModelProvider } from "./model";
import { createPersonalWebsitePublisher } from "./publisher";
import { createArticleWorkbenchRunStore } from "./run-store";
import { ArticleWorkbenchRunSchema, BusinessProfileSchema, PublicationReceiptSchema, type ArticleWorkbenchRun, type BusinessProfile } from "./contracts";

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
  article?: { title: string; slugProposal: string; summary: string; tags: string[]; body: string; sourceAssessments: unknown[] };
  sources?: Array<{ id: string; title: string; url: string; excerpt: string; publisher?: string }>;
  confirmations?: Array<{ sourceId: string; confirmed: true }>;
  previewMdx?: string;
  publication?: { id: string; slug: string; contentHash: string; status: "submitted" | "published" };
}

export function createArticleWorkbenchServer(environment: Record<string, string | undefined> = process.env): ArticleWorkbenchServer {
  const modelConfig = createArticleModelConfig(environment);
  const store = createArticleWorkbenchRunStore();
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
  if (article && typeof article === "object") {
    const value = article as Record<string, unknown>;
    if (typeof value.title === "string" && typeof value.slugProposal === "string" && typeof value.summary === "string" && Array.isArray(value.tags) && typeof value.body === "string" && Array.isArray(value.sourceAssessments)) {
      safe.article = { title: value.title, slugProposal: value.slugProposal, summary: value.summary, tags: value.tags.filter((tag): tag is string => typeof tag === "string"), body: value.body, sourceAssessments: value.sourceAssessments };
    }
  }
  if (packet && typeof packet === "object" && (packet as { status?: unknown }).status === "ok" && Array.isArray((packet as { sources?: unknown }).sources)) {
    safe.sources = (packet as { sources: Array<Record<string, unknown>> }).sources.flatMap((source) => typeof source.id === "string" && typeof source.title === "string" && typeof source.url === "string" && typeof source.excerpt === "string" ? [{ id: source.id, title: source.title, url: source.url, excerpt: source.excerpt, ...(typeof source.publisher === "string" ? { publisher: source.publisher } : {}) }] : []);
  }
  if (edits && typeof edits === "object" && Array.isArray((edits as { confirmations?: unknown }).confirmations)) safe.confirmations = (edits as { confirmations: Array<{ sourceId: string; confirmed: true }> }).confirmations;
  if (typeof previewMdx === "string") safe.previewMdx = previewMdx;
  if (publication && typeof publication === "object") {
    const value = publication as Record<string, unknown>;
    if (typeof value.id === "string" && typeof value.slug === "string" && typeof value.contentHash === "string" && (value.status === "submitted" || value.status === "published")) safe.publication = value as SafeRun["publication"];
  }
  return safe;
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) throw new Error("ARTICLE_REQUEST_TOO_LARGE");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new Error("ARTICLE_REQUEST_TOO_LARGE");
  try { return JSON.parse(text); } catch { throw new Error("ARTICLE_REQUEST_INVALID"); }
}

export function parseRunId(value: string): string { return runIdSchema.parse(value); }

export function articleApiError(error: unknown): { status: number; body: { error: string } } {
  const code = error instanceof Error ? error.message : "ARTICLE_REQUEST_INVALID";
  if (code === "ARTICLE_REQUEST_TOO_LARGE") return { status: 413, body: { error: "Request body too large" } };
  if (code === "ARTICLE_RUN_NOT_FOUND") return { status: 404, body: { error: "Not Found" } };
  if (code.includes("STATE_INVALID") || code.includes("CONFIRMATION_REQUIRED") || code.includes("ALREADY_CLAIMED") || code.includes("PUBLISHER_CONFLICT") || code.includes("CLAIM_CONFLICT") || code.includes("TRANSITION_INVALID")) return { status: 409, body: { error: "Article workflow conflict" } };
  if (code.includes("REQUEST_FAILED") || code.includes("PROVIDER_FAILED") || code.includes("PERSISTENCE_FAILED")) return { status: 502, body: { error: "Article provider unavailable" } };
  if (error instanceof z.ZodError || code === "ARTICLE_REQUEST_INVALID") return { status: 400, body: { error: "Invalid request" } };
  if (code.includes("INVALID") || code.includes("SOURCES_INSUFFICIENT")) return { status: 422, body: { error: "Article input or evidence is invalid" } };
  return { status: 400, body: { error: "Invalid request" } };
}
