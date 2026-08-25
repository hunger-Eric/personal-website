import { describe, expect, it, vi } from "vitest";

import { createOpenGeoLocalClient } from "@/lib/article-workbench/open-geo-local";

describe("local Open GEO article client", () => {
  it("provides a dedicated local article client instead of the public generator link", async () => {
    const clientModule = await import("@/lib/article-workbench/open-geo-local").catch(() => ({})) as Record<string, unknown>;

    expect(typeof clientModule.createOpenGeoLocalClient).toBe("function");
  });

  it("rejects non-loopback Open GEO targets before any request is sent", async () => {
    const fetcher = vi.fn<typeof fetch>();

    expect(() => createOpenGeoLocalClient({ baseUrl: "https://geo.itheheda.online", fetcher })).toThrow("OPEN_GEO_LOCAL_URL_INVALID");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("creates one free local preflight and returns its capability without touching commerce", async () => {
    let submittedUrl = "";
    let submittedInit: RequestInit | undefined;
    const fetcher = vi.fn<typeof fetch>(async (url, init) => {
      submittedUrl = String(url);
      submittedInit = init;
      return new Response(JSON.stringify({ preflightId: "preflight-1", status: "queued", locale: "zh", expiresAt: "2026-08-26T00:00:00.000Z" }), {
        status: 202,
        headers: { "content-type": "application/json", "set-cookie": "ogc_article_preflight_preflight-1=preflight-secret; Path=/; HttpOnly; SameSite=Lax" },
      });
    });
    const client = createOpenGeoLocalClient({ baseUrl: "http://127.0.0.1:3000", fetcher });

    const result = await client.createPreflight({
      topic: "企业如何准备 GEO 证据",
      sourceUrl: "https://me.itheheda.online",
      sourceText: "只使用已审核事实。",
      targetReader: "企业负责人",
      requirements: "保留来源链接。",
    }, "awr_aaaaaaaaaaaaaaaaaaaaaaaa");

    expect(result).toEqual({ preflightId: "preflight-1", preflightToken: "preflight-secret" });
    expect(submittedUrl).toBe("http://127.0.0.1:3000/api/articles/projects");
    expect(submittedInit).toMatchObject({ method: "POST", redirect: "error", headers: { "Idempotency-Key": "awr_aaaaaaaaaaaaaaaaaaaaaaaa" } });
    const form = submittedInit?.body as FormData;
    expect(Object.fromEntries(form.entries())).toEqual({
      topic: "企业如何准备 GEO 证据",
      sourceUrl: "https://me.itheheda.online",
      sourceText: "只使用已审核事实。",
      targetReader: "企业负责人",
      requirements: "保留来源链接。",
      locale: "zh",
      turnstileToken: "",
    });
    expect(submittedUrl).not.toMatch(/checkout|order|payment/);
  });

  it("follows capability-protected status and output endpoints until the exact article is available", async () => {
    const requests: Array<{ url: string; authorization: string | null }> = [];
    const fetcher = vi.fn<typeof fetch>(async (url, init) => {
      requests.push({ url: String(url), authorization: new Headers(init?.headers).get("authorization") });
      if (String(url).includes("preflights")) return new Response(JSON.stringify({ status: "promoted", projectId: "free-project-1", jobId: "free-job-1" }), {
        headers: { "content-type": "application/json", "set-cookie": "ogc_article_free-project-1=project-secret; Path=/; HttpOnly; SameSite=Lax" },
      });
      if (String(url).endsWith("/status")) return Response.json({ projectStatus: "active", job: { stage: "completed", progress: 100, etaSeconds: 0, publicError: null } });
      return Response.json({ title: "生成标题", summary: "生成摘要", bodyMarkdown: "正文保留 [来源](https://example.com/source)。" });
    });
    const client = createOpenGeoLocalClient({ baseUrl: "http://localhost:3000", fetcher });

    await expect(client.getPreflight("preflight-1", "preflight-secret")).resolves.toEqual({ status: "promoted", projectId: "free-project-1", jobId: "free-job-1", projectToken: "project-secret" });
    await expect(client.getProjectStatus("free-project-1", "project-secret")).resolves.toEqual({ projectStatus: "active", job: { stage: "completed", progress: 100, etaSeconds: 0, publicError: null } });
    await expect(client.getOutput("free-project-1", "project-secret")).resolves.toEqual({ title: "生成标题", summary: "生成摘要", bodyMarkdown: "正文保留 [来源](https://example.com/source)。" });
    expect(requests).toEqual([
      { url: "http://localhost:3000/api/articles/preflights/preflight-1/status", authorization: "Bearer preflight-secret" },
      { url: "http://localhost:3000/api/articles/projects/free-project-1/status", authorization: "Bearer project-secret" },
      { url: "http://localhost:3000/api/articles/projects/free-project-1/output", authorization: "Bearer project-secret" },
    ]);
  });
});
