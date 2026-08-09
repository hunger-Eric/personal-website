import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const { getArticleWorkbenchServer } = vi.hoisted(() => ({ getArticleWorkbenchServer: vi.fn() }));
vi.mock("@/lib/article-workbench/server", async (original) => ({ ...(await original<typeof import("@/lib/article-workbench/server")>()), getArticleWorkbenchServer }));
import { GET } from "@/app/api/admin/articles/runs/[runId]/publication/route";
const context = { params: Promise.resolve({ runId: "awr_aaaaaaaaaaaaaaaaaaaaaaaa" }) };
describe("article publication API", () => {
  it("returns 404 when disabled", async () => { vi.stubEnv("NODE_ENV", "production"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test"; expect((await GET(new NextRequest("http://localhost", { headers: { "x-admin-token": "test" } }), context)).status).toBe(404); });
  it("returns a safe publication receipt", async () => { vi.stubEnv("NODE_ENV", "test"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test"; getArticleWorkbenchServer.mockReturnValue({ refresh: vi.fn().mockResolvedValue({ id: "commit", slug: "article", contentHash: `sha256:${"a".repeat(64)}`, status: "submitted" }) }); const body = await (await GET(new NextRequest("http://localhost", { headers: { "x-admin-token": "test" } }), context)).json(); expect(body.publication).toEqual({ id: "commit", slug: "article", contentHash: `sha256:${"a".repeat(64)}`, status: "submitted" }); });
});
