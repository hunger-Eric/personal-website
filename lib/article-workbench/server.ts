import { z } from "zod";

import { defaultArticleBusinessProfile } from "@/config/article-business-profile";

import { createAnySearchResearchAdapter } from "./anysearch";
import { ArticleEditsInputSchema, createArticleWorkflow, type ArticleEditsInput } from "./core";
import { createArticleModelConfig, OpenAICompatibleModelProvider } from "./model";
import { createWebsitePublisher } from "./publisher";
import { createArticleWorkbenchRunStore } from "./run-store";
import { createOfflineArticleWorkbenchFixtures } from "./offline-fixtures";
import { ArticleOriginSchema, BusinessProfileSchema, OpenGeoTaskSchema, PublicationReceiptSchema, SourceBoundArticleProposalSchema, SourcePacketResultSchema, type ArticleWorkbenchRun, type BusinessProfile, type OpenGeoTask, type PublisherPort } from "./contracts";
import { createOpenGeoLocalClient, type OpenGeoArticleInput, type OpenGeoCapability } from "./open-geo-local";

const MAX_BODY_BYTES = 64 * 1024;
const runIdSchema = z.string().regex(/^awr_[a-f0-9]{24}$/);

export const GenerateRequestSchema = z.object({
  topic: z.string().trim().min(1).max(2_000),
  articleRules: z.array(z.string().trim().min(1).max(2_000)).min(1).max(30),
}).strict();

export const ImportOpenGeoMarkdownRequestSchema = z.object({
  markdown: z.string().trim().min(1).max(40_000),
  slugProposal: z.string().trim().min(1).max(160),
  tags: z.array(z.string().trim().min(1).max(100)).min(1).max(10),
}).strict();

export const OpenGeoGenerationRequestSchema = z.object({
  topic: z.string().trim().min(1).max(500),
  sourceUrl: z.string().url().max(2_000).optional(),
  sourceText: z.string().max(8_000).optional(),
  targetReader: z.string().max(500).optional(),
  requirements: z.string().max(10_000).optional(),
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
  importOpenGeoMarkdown(input: z.infer<typeof ImportOpenGeoMarkdownRequestSchema>): Promise<ArticleWorkbenchRun>;
  startOpenGeoGeneration(input: z.infer<typeof OpenGeoGenerationRequestSchema>): Promise<{ run: SafeRun; capability: OpenGeoCapability }>;
  refreshOpenGeoGeneration(runId: string, capability: OpenGeoCapability): Promise<{ run: SafeRun; capability: OpenGeoCapability }>;
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
  origin?: "open_geo_markdown" | "open_geo_local";
  openGeo?: OpenGeoTask;
}

export interface ArticleWorkbenchServerOptions {
  rootDir?: string;
  now?: () => Date;
  modelFetch?: typeof globalThis.fetch;
  searchFetch?: typeof globalThis.fetch;
  openGeoFetch?: typeof globalThis.fetch;
}

export function createArticleWorkbenchServer(environment: Record<string, string | undefined> = process.env, options: ArticleWorkbenchServerOptions = {}): ArticleWorkbenchServer {
  const store = createArticleWorkbenchRunStore({ rootDir: options.rootDir });
  const profilePort = {
    async getProfile() {
      return BusinessProfileSchema.parse((await store.loadProfile()) ?? defaultArticleBusinessProfile);
    },
  };
  const fixtures = offlineFixturesFor(environment);
  let websitePublisher: PublisherPort | undefined;
  const publisher: PublisherPort = fixtures?.publisher ?? {
    submit(record) {
      websitePublisher ??= createWebsitePublisher({ siteUrl: environment.NEXT_PUBLIC_BASE_URL });
      return websitePublisher.submit(record);
    },
    recover(record) {
      websitePublisher ??= createWebsitePublisher({ siteUrl: environment.NEXT_PUBLIC_BASE_URL });
      return websitePublisher.recover(record);
    },
    verify(receipt) {
      websitePublisher ??= createWebsitePublisher({ siteUrl: environment.NEXT_PUBLIC_BASE_URL });
      return websitePublisher.verify(receipt);
    },
  };
  const openGeo = createOpenGeoLocalClient({ baseUrl: environment.OPEN_GEO_LOCAL_BASE_URL ?? "http://127.0.0.1:3000", ...(options.openGeoFetch ? { fetcher: options.openGeoFetch } : {}) });
  const workflow = createArticleWorkflow({
    profile: profilePort,
    generationPortsForRun(runId) {
      if (fixtures) return { model: fixtures.model, search: fixtures.search };
      const modelConfig = createArticleModelConfig(environment);
      const appendModelReceipt = createSerializedArtifactAppender(store, runId, "modelProviderReceipts");
      const appendSearchReceipt = createSerializedArtifactAppender(store, runId, "searchProviderReceipts");
      return {
        model: new OpenAICompatibleModelProvider({
          config: modelConfig,
          ...(options.modelFetch ? { fetch: options.modelFetch } : {}),
          persistReceipt: appendModelReceipt,
        }),
        search: createAnySearchResearchAdapter({
          apiKey: environment.ANYSEARCH_API_KEY,
          ...(options.searchFetch ? { fetch: options.searchFetch } : {}),
          persistRawResponse: appendSearchReceipt,
        }),
      };
    },
    store,
    publisher,
    publicationDefaultsForRun: () => ({
      date: (options.now?.() ?? new Date()).toISOString().slice(0, 10),
      author: defaultArticleBusinessProfile.identity.name,
    }),
    now: options.now,
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
    importOpenGeoMarkdown(input) {
      const parsed = ImportOpenGeoMarkdownRequestSchema.parse(input);
      return workflow.importOpenGeoMarkdown({
        markdown: parsed.markdown as string,
        slugProposal: parsed.slugProposal as string,
        tags: parsed.tags as string[],
      });
    },
    async startOpenGeoGeneration(input) {
      const parsed = OpenGeoGenerationRequestSchema.parse(input) as OpenGeoArticleInput;
      const run = await store.createRun();
      const defaults = {
        date: (options.now?.() ?? new Date()).toISOString().slice(0, 10),
        author: defaultArticleBusinessProfile.identity.name,
      };
      await store.saveArtifact(run.id, "publicationDefaults", defaults);
      await store.saveArtifact(run.id, "articleOrigin", { type: "open_geo_local" });
      await store.saveArtifact(run.id, "input", parsed);
      try {
        const admission = await openGeo.createPreflight(parsed, run.id);
        const task = OpenGeoTaskSchema.parse({ phase: "checking", preflightId: admission.preflightId, progress: 5, updatedAt: (options.now?.() ?? new Date()).toISOString() });
        await store.saveArtifact(run.id, "openGeoTask", task);
        return { run: await safeRun(run, store), capability: { preflightToken: admission.preflightToken } };
      } catch (error) {
        await failOpenGeoRun(store, run.id, "OPEN_GEO_TASK_FAILED", publicOpenGeoError(error), options.now);
        throw error;
      }
    },
    async refreshOpenGeoGeneration(runId, capability) {
      runIdSchema.parse(runId);
      const run = await store.getRun(runId);
      if (!run) throw new Error("ARTICLE_RUN_NOT_FOUND");
      if (run.status === "validated" || run.status === "failed") return { run: await safeRun(run, store), capability };
      const origin = ArticleOriginSchema.parse(await store.loadArtifact(runId, "articleOrigin"));
      if (origin.type !== "open_geo_local") throw new Error("ARTICLE_EDIT_STATE_INVALID");
      let task = OpenGeoTaskSchema.parse(await store.loadArtifact(runId, "openGeoTask"));
      let nextCapability = { ...capability };
      try {
        if (!task.projectId) {
          const preflight = await openGeo.getPreflight(task.preflightId, capability.preflightToken);
          if (preflight.status !== "promoted") {
            if (preflight.status === "checking") {
              task = await saveOpenGeoTask(store, runId, { ...task, phase: "checking", progress: Math.max(task.progress, 8) }, options.now);
              return { run: await safeRun(run, store), capability: nextCapability };
            }
            const message = preflight.status === "needs_input"
              ? preflight.fieldErrors.map((item) => item.message).join(" ").slice(0, 500)
              : preflight.error ?? `Open GEO task ${preflight.status}`;
            task = await saveOpenGeoTask(store, runId, { ...task, phase: preflight.status, publicError: message }, options.now);
            await failOpenGeoRun(store, runId, "OPEN_GEO_TASK_FAILED", message, options.now);
            return { run: await safeRun((await store.getRun(runId))!, store), capability: nextCapability };
          }
          nextCapability = { ...nextCapability, projectToken: preflight.projectToken };
          task = await saveOpenGeoTask(store, runId, { ...task, phase: "queued", projectId: preflight.projectId, jobId: preflight.jobId, progress: 10 }, options.now);
        }
        if (!task.projectId || !nextCapability.projectToken) throw new Error("OPEN_GEO_CAPABILITY_MISSING");
        const status = await openGeo.getProjectStatus(task.projectId, nextCapability.projectToken);
        if (status.projectStatus === "expired" || status.job?.stage === "failed") {
          const phase = status.projectStatus === "expired" ? "expired" : "failed";
          const message = status.job?.publicError ?? `Open GEO task ${phase}`;
          task = await saveOpenGeoTask(store, runId, { ...task, phase, progress: status.job?.progress ?? task.progress, publicError: message }, options.now);
          await failOpenGeoRun(store, runId, "OPEN_GEO_TASK_FAILED", message, options.now);
          return { run: await safeRun((await store.getRun(runId))!, store), capability: nextCapability };
        }
        if (status.job?.stage === "completed") {
          const output = await openGeo.getOutput(task.projectId, nextCapability.projectToken);
          task = await saveOpenGeoTask(store, runId, { ...task, phase: "completed", progress: 100, etaSeconds: 0 }, options.now);
          await workflow.completeOpenGeoGeneration(runId, output);
          return { run: await safeRun((await store.getRun(runId))!, store), capability: nextCapability };
        }
        const phase = status.job?.stage ?? "queued";
        task = await saveOpenGeoTask(store, runId, { ...task, phase, progress: status.job?.progress ?? task.progress, etaSeconds: status.job?.etaSeconds ?? null }, options.now);
        return { run: await safeRun(run, store), capability: nextCapability };
      } catch (error) {
        await failOpenGeoRun(store, runId, error instanceof z.ZodError ? "OPEN_GEO_OUTPUT_INVALID" : "OPEN_GEO_TASK_FAILED", publicOpenGeoError(error), options.now);
        throw error;
      }
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

function createSerializedArtifactAppender(
  store: ReturnType<typeof createArticleWorkbenchRunStore>,
  runId: string,
  artifact: "modelProviderReceipts" | "searchProviderReceipts"
): (receipt: unknown) => Promise<void> {
  let tail: Promise<void> = Promise.resolve();
  return (receipt) => {
    const operation = tail.then(async () => {
      const current = await store.loadArtifact(runId, artifact);
      let receipts: unknown[] = [];
      if (current !== null) {
        if (!Array.isArray(current)) throw new Error("ARTICLE_WORKBENCH_READ_FAILED");
        receipts = current;
      }
      await store.saveArtifact(runId, artifact, [...receipts, receipt]);
    });
    tail = operation.catch(() => undefined);
    return operation;
  };
}

function offlineFixturesFor(environment: Record<string, string | undefined>) {
  if (environment.ARTICLE_WORKBENCH_OFFLINE_FIXTURES !== "true") return undefined;
  if (environment.NODE_ENV === "production" || environment.ENABLE_ADMIN !== "true") {
    throw new Error("ARTICLE_OFFLINE_FIXTURES_DISABLED");
  }
  return createOfflineArticleWorkbenchFixtures();
}

let server: ArticleWorkbenchServer | undefined;
export function getArticleWorkbenchServer(): ArticleWorkbenchServer {
  server ??= createArticleWorkbenchServer();
  return server;
}

async function safeRun(run: ArticleWorkbenchRun, store: ReturnType<typeof createArticleWorkbenchRunStore>): Promise<SafeRun> {
  const safe: SafeRun = { id: run.id, status: run.status, ...(run.failure ? { failure: run.failure } : {}) };
  const [article, packet, edits, previewMdx, publication, origin, openGeoTask] = await Promise.all([
    store.loadArtifact(run.id, "validatedArticle"), store.loadArtifact(run.id, "sourcePacket"), store.loadArtifact(run.id, "articleEdits"), store.loadArtifact(run.id, "renderedMdx"), store.loadArtifact(run.id, "publicationReceipt"), store.loadArtifact(run.id, "articleOrigin"), store.loadArtifact(run.id, "openGeoTask"),
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
  const parsedOrigin = ArticleOriginSchema.safeParse(origin);
  if (parsedOrigin.success) safe.origin = parsedOrigin.data.type;
  const parsedOpenGeoTask = OpenGeoTaskSchema.safeParse(openGeoTask);
  if (parsedOpenGeoTask.success) safe.openGeo = parsedOpenGeoTask.data;
  return safe;
}

async function saveOpenGeoTask(store: ReturnType<typeof createArticleWorkbenchRunStore>, runId: string, task: Omit<OpenGeoTask, "updatedAt"> & { updatedAt?: string }, now?: () => Date): Promise<OpenGeoTask> {
  const next = OpenGeoTaskSchema.parse({ ...task, updatedAt: (now?.() ?? new Date()).toISOString() });
  await store.saveArtifact(runId, "openGeoTask", next);
  return next;
}

async function failOpenGeoRun(store: ReturnType<typeof createArticleWorkbenchRunStore>, runId: string, code: "OPEN_GEO_TASK_FAILED" | "OPEN_GEO_OUTPUT_INVALID", message: string, now?: () => Date): Promise<void> {
  const run = await store.getRun(runId);
  if (!run || run.status === "failed") return;
  await store.updateRunStatus(runId, "failed", {
    stage: "open_geo",
    code,
    message: message.slice(0, 500),
    occurredAt: (now?.() ?? new Date()).toISOString(),
    userActionRequired: true,
  });
}

function publicOpenGeoError(error: unknown): string {
  const code = error instanceof Error ? error.message : "OPEN_GEO_REQUEST_FAILED";
  if (code === "OPEN_GEO_LOCAL_UNAVAILABLE") return "本机 Open GEO 服务不可用，请确认 Web 与文章 Worker 已启动。";
  if (code === "OPEN_GEO_CAPABILITY_MISSING") return "Open GEO 任务访问凭据缺失，请从当前浏览器重新创建任务。";
  if (code === "OPEN_GEO_TASK_NOT_FOUND") return "Open GEO 文章任务不存在或已过期。";
  if (code === "OPEN_GEO_OUTPUT_INVALID" || error instanceof z.ZodError) return "Open GEO 返回的文章格式无法安全导入。";
  return "Open GEO 本地文章任务未完成。";
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
  if (code === "OPEN_GEO_LOCAL_URL_INVALID") return { status: 500, body: { error: "本机 Open GEO 地址配置无效，只允许 localhost 或回环地址。" } };
  if (code === "OPEN_GEO_LOCAL_UNAVAILABLE") return { status: 502, body: { error: "本机 Open GEO 服务不可用，请确认 Web 与文章 Worker 已启动。" } };
  if (code === "OPEN_GEO_CAPABILITY_MISSING") return { status: 409, body: { error: "Open GEO 任务访问凭据缺失，请从当前浏览器重新创建任务。" } };
  if (code === "OPEN_GEO_TASK_NOT_FOUND") return { status: 404, body: { error: "Open GEO 文章任务不存在或已过期。" } };
  if (code === "OPEN_GEO_OUTPUT_INVALID") return { status: 422, body: { error: "Open GEO 返回的文章格式无法安全导入。" } };
  if (code === "OPEN_GEO_REQUEST_FAILED" || code === "OPEN_GEO_TASK_FAILED") return { status: 502, body: { error: "Open GEO 本地文章任务未完成。" } };
  if (code === "ARTICLE_REQUEST_TOO_LARGE") return { status: 413, body: { error: "Request body too large" } };
  if (code === "ARTICLE_RUN_NOT_FOUND") return { status: 404, body: { error: "Not Found" } };
  if (code.includes("STATE_INVALID") || code.includes("CONFIRMATION_REQUIRED") || code.includes("ALREADY_CLAIMED") || code.includes("PUBLISHER_CONFLICT") || code.includes("CLAIM_CONFLICT") || code.includes("TRANSITION_INVALID") || code.includes("RECEIPT_MISSING") || code.includes("RECORD_REQUIRED")) return { status: 409, body: { error: "Article workflow conflict" } };
  if (code.includes("REQUEST_FAILED") || code.includes("PROVIDER_FAILED") || code.includes("PERSISTENCE_FAILED") || code.includes("WORKBENCH_READ_FAILED") || code === "VERIFICATION_MISMATCH") return { status: 502, body: { error: "Article provider unavailable" } };
  if (error instanceof z.ZodError || code === "ARTICLE_REQUEST_INVALID") return { status: 400, body: { error: "Invalid request" } };
  if (code.includes("INVALID") || code.includes("SOURCES_INSUFFICIENT")) return { status: 422, body: { error: "Article input or evidence is invalid" } };
  return { status: 400, body: { error: "Invalid request" } };
}
