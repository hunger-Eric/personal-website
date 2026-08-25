import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ startOpenGeoGeneration: vi.fn(), refreshOpenGeoGeneration: vi.fn() }));
vi.mock("@/lib/article-workbench/server", async (original) => ({
  ...(await original<typeof import("@/lib/article-workbench/server")>()), getArticleWorkbenchServer: () => mocks,
}));

import { POST } from "@/app/api/admin/articles/open-geo/route";
import { GET } from "@/app/api/admin/articles/runs/[runId]/open-geo/route";
import { OpenGeoGenerationRequestSchema } from "@/lib/article-workbench/server";

const runId = "awr_aaaaaaaaaaaaaaaaaaaaaaaa";
const input = { topic: "企业如何准备 GEO 证据", sourceUrl: "https://me.itheheda.online" };

describe("Open GEO automatic generation API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ENABLE_ADMIN", "true");
    vi.stubEnv("ADMIN_TOKEN", "test-token");
  });

  it("accepts the complete request shape submitted by the workbench UI", () => {
    expect(OpenGeoGenerationRequestSchema.safeParse({
      topic: "企业如何准备 GEO 证据",
      sourceUrl: "http://localhost:3000",
      sourceText: "",
      targetReader: "正在搜索该主题、比较解决方案，并可能发起咨询、合作或采购的潜在客户与业务决策者。",
      requirements: "写成一篇适合 AI 搜索与传统搜索理解和引用的中文 GEO 文章。先回答核心问题，再展开证据、方法、适用边界与行动建议；保留可靠来源链接，不编造事实、数据、案例或客户结果。",
    }).success).toBe(true);
  });

  it("creates one authenticated task and keeps the Open GEO capability out of JSON", async () => {
    mocks.startOpenGeoGeneration.mockResolvedValue({
      run: { id: runId, status: "created", origin: "open_geo_local", openGeo: { phase: "checking", progress: 5 } },
      capability: { preflightToken: "preflight-secret" },
    });
    const response = await POST(new NextRequest("http://localhost/api/admin/articles/open-geo", {
      method: "POST", headers: { "x-admin-token": "test-token", "content-type": "application/json" }, body: JSON.stringify(input),
    }));

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toEqual({ run: { id: runId, status: "created", origin: "open_geo_local", openGeo: { phase: "checking", progress: 5 } } });
    expect(JSON.stringify(body)).not.toContain("preflight-secret");
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(new RegExp(`open_geo_bridge_${runId}=[^;]+;`));
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toMatch(/SameSite=strict/i);
    expect(cookie).not.toContain("preflight-secret");
    expect(mocks.startOpenGeoGeneration).toHaveBeenCalledWith(input);
  });

  it("polls the same run with its HttpOnly capability and rotates it without exposing either token", async () => {
    mocks.startOpenGeoGeneration.mockResolvedValue({ run: { id: runId, status: "created" }, capability: { preflightToken: "preflight-secret" } });
    const created = await POST(new NextRequest("http://localhost/api/admin/articles/open-geo", {
      method: "POST", headers: { "x-admin-token": "test-token", "content-type": "application/json" }, body: JSON.stringify(input),
    }));
    const cookie = (created.headers.get("set-cookie") ?? "").split(";")[0];
    mocks.refreshOpenGeoGeneration.mockResolvedValue({
      run: { id: runId, status: "validated", origin: "open_geo_local", openGeo: { phase: "completed", progress: 100 }, article: { title: "生成标题" } },
      capability: { preflightToken: "preflight-secret", projectToken: "project-secret" },
    });

    const response = await GET(new NextRequest(`http://localhost/api/admin/articles/runs/${runId}/open-geo`, {
      headers: { "x-admin-token": "test-token", cookie },
    }), { params: Promise.resolve({ runId }) });

    expect(response.status).toBe(200);
    const serialized = JSON.stringify(await response.json());
    expect(serialized).toContain("生成标题");
    expect(serialized).not.toMatch(/preflight-secret|project-secret/);
    expect(response.headers.get("set-cookie")).not.toMatch(/preflight-secret|project-secret/);
    expect(mocks.refreshOpenGeoGeneration).toHaveBeenCalledWith(runId, { preflightToken: "preflight-secret" });
  });

  it("fails closed before task creation or polling when admin or run capability is absent", async () => {
    const unauthorized = await POST(new NextRequest("http://localhost/api/admin/articles/open-geo", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input),
    }));
    expect(unauthorized.status).toBe(404);
    expect(mocks.startOpenGeoGeneration).not.toHaveBeenCalled();

    const noCapability = await GET(new NextRequest(`http://localhost/api/admin/articles/runs/${runId}/open-geo`, {
      headers: { "x-admin-token": "test-token" },
    }), { params: Promise.resolve({ runId }) });
    expect(noCapability.status).toBe(409);
    expect(mocks.refreshOpenGeoGeneration).not.toHaveBeenCalled();
  });

  it("returns a readable service error when the local Open GEO process is unavailable", async () => {
    mocks.startOpenGeoGeneration.mockRejectedValue(new Error("OPEN_GEO_LOCAL_UNAVAILABLE"));
    const response = await POST(new NextRequest("http://localhost/api/admin/articles/open-geo", {
      method: "POST", headers: { "x-admin-token": "test-token", "content-type": "application/json" }, body: JSON.stringify(input),
    }));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "本机 Open GEO 服务不可用，请确认 Web 与文章 Worker 已启动。" });
  });

  it("identifies an invalid loopback service configuration without disguising it as article input", async () => {
    mocks.startOpenGeoGeneration.mockRejectedValue(new Error("OPEN_GEO_LOCAL_URL_INVALID"));
    const response = await POST(new NextRequest("http://localhost/api/admin/articles/open-geo", {
      method: "POST", headers: { "x-admin-token": "test-token", "content-type": "application/json" }, body: JSON.stringify(input),
    }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "本机 Open GEO 地址配置无效，只允许 localhost 或回环地址。" });
  });
});
