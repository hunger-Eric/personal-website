import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
const { getArticleWorkbenchServer } = vi.hoisted(() => ({ getArticleWorkbenchServer: vi.fn() }));
vi.mock("@/lib/article-workbench/server", async (original) => ({ ...(await original<typeof import("@/lib/article-workbench/server")>()), getArticleWorkbenchServer }));
import { GET, PUT } from "@/app/api/admin/articles/runs/[runId]/route";
import { articleApiError, createArticleWorkbenchServer } from "@/lib/article-workbench/server";
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
      await store.saveArtifact(run.id, "sourcePacket", { status: "ok", sources: [{ id: "S001", title: "Authority", url: "https://example.com/one", excerpt: sourceContent.slice(0, 2_000), content: sourceContent }, { id: "S002", title: "Standard", url: "https://example.com/two", excerpt: "Public evidence", content: "Public evidence" }] });
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
  it.each([["ARTICLE_WORKBENCH_READ_FAILED", 502], ["ARTICLE_WORKBENCH_PERSISTENCE_FAILED", 502], ["PUBLICATION_RECEIPT_MISSING", 409], ["PUBLICATION_RECORD_REQUIRED", 409], ["VERIFICATION_MISMATCH", 502]] as const)("maps %s to %i", (code, status) => {
    expect(articleApiError(new Error(code)).status).toBe(status);
  });
});
