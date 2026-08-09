import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const { getArticleWorkbenchServer } = vi.hoisted(() => ({ getArticleWorkbenchServer: vi.fn() }));
vi.mock("@/lib/article-workbench/server", async (original) => ({ ...(await original<typeof import("@/lib/article-workbench/server")>()), getArticleWorkbenchServer }));
import { GET, PUT } from "@/app/api/admin/articles/runs/[runId]/route";
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
});
