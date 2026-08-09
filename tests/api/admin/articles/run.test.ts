import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
const { getArticleWorkbenchServer } = vi.hoisted(() => ({ getArticleWorkbenchServer: vi.fn() }));
vi.mock("@/lib/article-workbench/server", async (original) => ({ ...(await original<typeof import("@/lib/article-workbench/server")>()), getArticleWorkbenchServer }));
import { GET, PUT } from "@/app/api/admin/articles/runs/[runId]/route";
import { ArticleEditsRequestSchema, GenerateRequestSchema, articleApiError, createArticleWorkbenchServer, parseRunId, readJsonBody } from "@/lib/article-workbench/server";
import { createArticleWorkbenchRunStore } from "@/lib/article-workbench/run-store";
const context = { params: Promise.resolve({ runId: "awr_aaaaaaaaaaaaaaaaaaaaaaaa" }) };
describe("article run API", () => {
  it("returns 404 when disabled", async () => { vi.stubEnv("NODE_ENV", "production"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test"; expect((await GET(new NextRequest("http://localhost", { headers: { "x-admin-token": "test" } }), context)).status).toBe(404); });
  it("does not expose extracted source content", async () => {
    vi.stubEnv("NODE_ENV", "test"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test";
    getArticleWorkbenchServer.mockReturnValue({ getRun: vi.fn().mockResolvedValue({ id: "awr_aaaaaaaaaaaaaaaaaaaaaaaa", status: "validated", sources: [{ id: "S001", title: "Source", url: "https://example.com", excerpt: "Short" }] }) });
    expect(JSON.stringify(await (await GET(new NextRequest("http://localhost", { headers: { "x-admin-token": "test" } }), context)).json())).not.toContain("content");
    getArticleWorkbenchServer.mockReturnValue({ saveEdits: vi.fn().mockResolvedValue({ id: "awr_aaaaaaaaaaaaaaaaaaaaaaaa", status: "validated" }) });
    expect((await PUT(new NextRequest("http://localhost", { method: "PUT", headers: { "x-admin-token": "test" }, body: JSON.stringify({ confirmations: [] }) }), context)).status).toBe(200);
  });
  it("projects real persisted runs without page content or assessment replay", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-api-"));
    try {
      const store = createArticleWorkbenchRunStore({ rootDir: root });
      const run = await store.createRun();
      for (const status of ["research_planned", "sources_ready", "article_generated", "validated"] as const) await store.updateRunStatus(run.id, status);
      const sourceContent = `DO_NOT_EXPOSE_SECRET_MARKER ${"evidence ".repeat(100)}`;
      await store.saveArtifact(run.id, "sourcePacket", { status: "ok", sources: [{ id: "S001", title: "Authority", url: "https://example.com/one", excerpt: sourceContent.slice(0, 2_000), content: sourceContent }, { id: "S002", title: "Standard", url: "https://example.com/two", excerpt: "Public evidence", content: "Public evidence with enough extracted detail." }] });
      await store.saveArtifact(run.id, "validatedArticle", { title: "Safe article", slugProposal: "safe-article", summary: "Summary", tags: ["evidence"], body: "Claim [[S001]] and corroboration [[S002]].", sourceAssessments: [{ sourceId: "S001", category: "official", rationale: sourceContent, claimsSupported: ["A safe category explanation"] }, { sourceId: "S002", category: "standard", rationale: "Independent standard", claimsSupported: ["Corroboration"] }] });
      const server = createArticleWorkbenchServer({ ARTICLE_MODEL_PROVIDER: "test", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://models.example.test/v1", ARTICLE_MODEL_NAME: "test-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only", NEXT_PUBLIC_BASE_URL: "https://example.com" }, { rootDir: root });
      const projection = await server.getRun(run.id);
      const serialized = JSON.stringify(projection);
      expect(serialized).not.toContain("DO_NOT_EXPOSE_SECRET_MARKER");
      expect(serialized).not.toContain(sourceContent);
      expect(serialized).not.toContain(root);
      expect(projection?.sources?.[0]).toEqual({ id: "S001", title: "Authority", url: "https://example.com/one" });
      expect(projection?.article?.sourceAssessments[0]).toEqual({ sourceId: "S001", category: "official", claimsSupported: ["A safe category explanation"] });
      expect(projection?.article?.sourceAssessments[1]).toMatchObject({ sourceId: "S002", category: "standard", rationale: "Independent standard" });
    } finally { await rm(root, { recursive: true, force: true }); }
  });
  it.each([["ARTICLE_WORKBENCH_READ_FAILED", 502], ["ARTICLE_WORKBENCH_PERSISTENCE_FAILED", 502], ["PROVIDER_RECEIPT_PERSISTENCE_FAILED", 502], ["PUBLICATION_RECEIPT_MISSING", 409], ["PUBLICATION_RECORD_REQUIRED", 409], ["VERIFICATION_MISMATCH", 502]] as const)("maps %s to %i", (code, status) => {
    expect(articleApiError(new Error(code)).status).toBe(status);
  });

  it("rejects malformed request bodies and maps each public error family", async () => {
    await expect(readJsonBody(new Request("http://localhost", { method: "POST" }))).rejects.toThrow("ARTICLE_REQUEST_INVALID");
    await expect(readJsonBody(new Request("http://localhost", { method: "POST", headers: { "content-length": "not-a-number" }, body: "{}" }))).rejects.toThrow("ARTICLE_REQUEST_TOO_LARGE");
    await expect(readJsonBody(new Request("http://localhost", { method: "POST", body: "not-json" }))).rejects.toThrow("ARTICLE_REQUEST_INVALID");
    expect(parseRunId("awr_aaaaaaaaaaaaaaaaaaaaaaaa")).toBe("awr_aaaaaaaaaaaaaaaaaaaaaaaa");
    expect(() => parseRunId("bad")).toThrow();
    expect(GenerateRequestSchema.safeParse({ topic: "", articleRules: [] }).success).toBe(false);
    expect(ArticleEditsRequestSchema.safeParse({ confirmations: [{ sourceId: "invalid", confirmed: true }] }).success).toBe(false);

    expect(articleApiError(new Error("ARTICLE_REQUEST_TOO_LARGE")).status).toBe(413);
    expect(articleApiError(new Error("ARTICLE_RUN_NOT_FOUND")).status).toBe(404);
    expect(articleApiError(new Error("SOURCES_INSUFFICIENT")).status).toBe(422);
    expect(articleApiError(new Error("SOMETHING_INVALID")).status).toBe(422);
    expect(articleApiError(new Error("something else")).status).toBe(400);
    expect(articleApiError("not an error").status).toBe(400);
  });

  it("fails closed for streamed decoder and reader errors", async () => {
    const invalidUtf8 = new ReadableStream<Uint8Array>({
      start(controller) { controller.enqueue(new Uint8Array([0xc3, 0x28])); controller.close(); },
    });
    await expect(readJsonBody({ headers: new Headers(), body: invalidUtf8 } as unknown as Request)).rejects.toThrow("ARTICLE_REQUEST_INVALID");

    const failingRead = { headers: new Headers(), body: { getReader: () => ({ read: async () => { throw new Error("read failed"); } }) } };
    await expect(readJsonBody(failingRead as unknown as Request)).rejects.toThrow("ARTICLE_REQUEST_INVALID");
  });

  it("persists a reviewed profile and safely projects optional run artifacts", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-server-"));
    try {
      const environment = { ARTICLE_MODEL_PROVIDER: "test", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://models.example.test/v1", ARTICLE_MODEL_NAME: "test-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only", NEXT_PUBLIC_BASE_URL: "https://example.com" };
      const server = createArticleWorkbenchServer(environment, { rootDir: root });
      const profile = await server.getProfile();
      await expect(server.saveProfile(profile)).resolves.toEqual(profile);
      const store = createArticleWorkbenchRunStore({ rootDir: root });
      const run = await store.createRun();
      await store.saveArtifact(run.id, "articleEdits", { confirmations: [{ sourceId: "S001", confirmed: true }] });
      await store.saveArtifact(run.id, "renderedMdx", "# Preview");
      await store.saveArtifact(run.id, "publicationReceipt", { id: "commit", slug: "safe-article", contentHash: `sha256:${"a".repeat(64)}`, status: "submitted" });
      const safe = await server.getRun(run.id);
      expect(safe).toMatchObject({ id: run.id, status: "created", confirmations: [{ sourceId: "S001", confirmed: true }], previewMdx: "# Preview", publication: { id: "commit", status: "submitted" } });
      await expect(server.getRun("bad")).rejects.toThrow();
    } finally { await rm(root, { recursive: true, force: true }); }
  });

  it("omits malformed and absent persisted artifacts from the safe run projection", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-server-safe-"));
    try {
      const environment = { ARTICLE_MODEL_PROVIDER: "test", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://models.example.test/v1", ARTICLE_MODEL_NAME: "test-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only", NEXT_PUBLIC_BASE_URL: "https://example.com" };
      const server = createArticleWorkbenchServer(environment, { rootDir: root });
      const store = createArticleWorkbenchRunStore({ rootDir: root });
      const run = await store.createRun();
      await store.saveArtifact(run.id, "sourcePacket", { malformed: true });
      await store.saveArtifact(run.id, "validatedArticle", { title: "partial" });
      await store.saveArtifact(run.id, "articleEdits", { confirmations: [{ sourceId: "S001", confirmed: false }] });
      await store.saveArtifact(run.id, "publicationReceipt", { id: "partial" });
      const safe = await server.getRun(run.id);
      expect(safe).toEqual({ id: run.id, status: "created" });
      expect(await server.getProfile()).toMatchObject({ identity: { name: expect.any(String) } });
    } finally { await rm(root, { recursive: true, force: true }); }
  });

  it("persists run-isolated model and concurrent search receipts without exposing them through the safe API projection", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "article-server-receipts-"));
    try {
      let modelCall = 0;
      const modelFetch = vi.fn(async () => {
        modelCall += 1;
        const content = modelCall % 2 === 1
          ? { queries: [{ query: "official evidence", type: "general" }, { query: "standard evidence", type: "general" }] }
          : {
              title: "Receipt-safe article", slugProposal: "receipt-safe-article", summary: "A verified summary.", tags: ["evidence"],
              body: "One [[S001]], two [[S002]], three [[S003]], and four [[S004]].",
              sourceAssessments: ["S001", "S002", "S003", "S004"].map((sourceId, index) => ({ sourceId, category: index % 2 === 0 ? "official" : "standard", rationale: `Assessment ${index + 1}`, claimsSupported: [`Claim ${index + 1}`] })),
            };
        return new Response(JSON.stringify({ id: `model-${modelCall}`, choices: [{ message: { content: JSON.stringify(content) } }] }), { status: 200 });
      });
      const searchFetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        const request = JSON.parse(String(init?.body)) as { params: { name: string; arguments: { url?: string } } };
        if (request.params.name === "extract") {
          const delay = request.params.arguments.url?.endsWith("source-1") ? 200 : request.params.arguments.url?.endsWith("source-2") ? 120 : 5;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        const text = request.params.name === "batch_search"
          ? [1, 2, 3, 4].map((index) => `## ${index}. [Source ${index}](https://example.com/source-${index})`).join("\n")
          : `Extracted public evidence for ${request.params.arguments.url} with enough detail for source validation.`;
        return new Response(JSON.stringify({ jsonrpc: "2.0", result: { content: [{ type: "text", text }] }, metadata: { internalMarker: "PROVIDER_ONLY_MARKER", apiKey: "must-not-persist" } }), { status: 200, headers: { "content-type": "application/json" } });
      });
      const environment = { ARTICLE_MODEL_PROVIDER: "test", ARTICLE_MODEL_PROTOCOL: "openai_compatible", ARTICLE_MODEL_BASE_URL: "https://models.example.test/v1", ARTICLE_MODEL_NAME: "test-model", ARTICLE_MODEL_API_KEY: "test-key", ARTICLE_MODEL_STRUCTURED_OUTPUT_MODE: "prompt_only", NEXT_PUBLIC_BASE_URL: "https://example.com" };
      const server = createArticleWorkbenchServer(environment, { rootDir: root, modelFetch, searchFetch });
      const first = await server.generate({ topic: "First receipt run", articleRules: ["Use supplied sources only"] });
      const second = await server.generate({ topic: "Second receipt run", articleRules: ["Use supplied sources only"] });
      const store = createArticleWorkbenchRunStore({ rootDir: root });

      for (const run of [first, second]) {
        expect(await store.loadArtifact(run.id, "modelProviderReceipts")).toHaveLength(2);
        expect(await store.loadArtifact(run.id, "searchProviderReceipts")).toHaveLength(5);
        const stored = JSON.stringify([await store.loadArtifact(run.id, "modelProviderReceipts"), await store.loadArtifact(run.id, "searchProviderReceipts")]);
        expect(stored).not.toContain("PROVIDER_ONLY_MARKER");
        expect(stored).not.toContain("must-not-persist");
        expect(stored).not.toContain("Receipt-safe article");
        expect(stored).not.toContain("Extracted public evidence");
        expect(JSON.stringify(await server.getRun(run.id))).not.toContain("PROVIDER_ONLY_MARKER");
      }
      expect((await store.loadArtifact(first.id, "modelProviderReceipts") as Array<{ responseId: string }>).map((receipt) => receipt.responseId)).toEqual(["model-1", "model-2"]);
      expect((await store.loadArtifact(second.id, "modelProviderReceipts") as Array<{ responseId: string }>).map((receipt) => receipt.responseId)).toEqual(["model-3", "model-4"]);
      expect((await store.loadArtifact(first.id, "searchProviderReceipts") as Array<{ requestId: number }>).map((receipt) => receipt.requestId)).toEqual([1, 4, 5, 3, 2]);
      expect((await store.loadArtifact(second.id, "searchProviderReceipts") as Array<{ requestId: number }>).map((receipt) => receipt.requestId)).toEqual([1, 4, 5, 3, 2]);
      expect(first.id).not.toBe(second.id);
      expect(modelFetch).toHaveBeenCalledTimes(4);
      expect(searchFetch).toHaveBeenCalledTimes(10);
    } finally { await rm(root, { recursive: true, force: true }); }
  });
});
