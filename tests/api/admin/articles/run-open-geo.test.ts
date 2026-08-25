import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { createArticleWorkbenchServer } from "@/lib/article-workbench/server";

const input = {
  topic: "企业如何准备 GEO 证据",
  sourceUrl: "https://me.itheheda.online",
  sourceText: "只使用已审核的公开事实。",
  targetReader: "正在比较企业 AI 方案的业务负责人",
  requirements: "保留可核实来源和相关官网链接。",
};

describe("Open GEO automatic article run", () => {
  it("keeps one run from local preflight through automatic draft import without exposing capabilities", async () => {
    let statusCalls = 0;
    const fetcher = vi.fn<typeof fetch>(async (url) => {
      const value = String(url);
      if (value.endsWith("/api/articles/projects")) return new Response(JSON.stringify({ preflightId: "preflight-1", status: "queued" }), {
        status: 202,
        headers: { "content-type": "application/json", "set-cookie": "ogc_article_preflight_preflight-1=preflight-secret; Path=/; HttpOnly" },
      });
      if (value.includes("/preflights/")) return new Response(JSON.stringify({ status: "promoted", projectId: "free-project-1", jobId: "free-job-1" }), {
        headers: { "content-type": "application/json", "set-cookie": "ogc_article_free-project-1=project-secret; Path=/; HttpOnly" },
      });
      if (value.endsWith("/status")) {
        statusCalls += 1;
        return Response.json(statusCalls === 1
          ? { projectStatus: "active", job: { stage: "writing", progress: 67, etaSeconds: 42, publicError: null } }
          : { projectStatus: "active", job: { stage: "completed", progress: 100, etaSeconds: 0, publicError: null } });
      }
      return Response.json({ title: "生成标题", summary: "生成摘要", bodyMarkdown: "正文保留 [来源](https://example.com/source)。" });
    });
    const root = await mkdtemp(path.join(tmpdir(), "open-geo-auto-run-"));
    try {
      const server = createArticleWorkbenchServer({
        OPEN_GEO_LOCAL_BASE_URL: "http://127.0.0.1:3000",
        NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
      }, { rootDir: root, openGeoFetch: fetcher, now: () => new Date("2026-08-25T12:00:00.000Z") }) as ReturnType<typeof createArticleWorkbenchServer> & {
        startOpenGeoGeneration?: (value: unknown) => Promise<{ run: Record<string, unknown>; capability: Record<string, unknown> }>;
        refreshOpenGeoGeneration?: (runId: string, capability: unknown) => Promise<{ run: Record<string, unknown>; capability: Record<string, unknown> }>;
      };

      expect(typeof server.startOpenGeoGeneration).toBe("function");
      expect(typeof server.refreshOpenGeoGeneration).toBe("function");
      if (!server.startOpenGeoGeneration || !server.refreshOpenGeoGeneration) return;

      const started = await server.startOpenGeoGeneration(input);
      expect(started.run).toMatchObject({ status: "created", origin: "open_geo_local", openGeo: { phase: "checking", progress: 5 } });
      expect(started.capability).toEqual({ preflightToken: "preflight-secret" });
      expect(JSON.stringify(started.run)).not.toMatch(/preflight-secret|project-secret/);

      const active = await server.refreshOpenGeoGeneration(String(started.run.id), started.capability);
      expect(active.run).toMatchObject({ status: "created", openGeo: { phase: "writing", progress: 67, etaSeconds: 42, projectId: "free-project-1" } });
      expect(active.capability).toEqual({ preflightToken: "preflight-secret", projectToken: "project-secret" });
      expect(JSON.stringify(active.run)).not.toMatch(/preflight-secret|project-secret/);

      const completed = await server.refreshOpenGeoGeneration(String(started.run.id), active.capability);
      expect(completed.run).toMatchObject({
        status: "validated",
        origin: "open_geo_local",
        openGeo: { phase: "completed", progress: 100 },
        article: { title: "生成标题", summary: "生成摘要", body: "正文保留 [来源](https://example.com/source)。", tags: ["GEO"], sourceAssessments: [] },
      });
      expect(String((completed.run.article as { slugProposal: string }).slugProposal)).toMatch(/^open-geo-[a-f0-9]{12}$/);
      expect(String(completed.run.previewMdx)).toContain("正文保留 [来源](https://example.com/source)。");
      expect(fetcher.mock.calls.map(([url]) => String(url))).not.toEqual(expect.arrayContaining([expect.stringMatching(/checkout|order|payment/)]));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
