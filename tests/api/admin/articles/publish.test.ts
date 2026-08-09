import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const { getArticleWorkbenchServer } = vi.hoisted(() => ({ getArticleWorkbenchServer: vi.fn() }));
vi.mock("@/lib/article-workbench/server", async (original) => ({ ...(await original<typeof import("@/lib/article-workbench/server")>()), getArticleWorkbenchServer }));
import { POST } from "@/app/api/admin/articles/runs/[runId]/publish/route";
const context = { params: Promise.resolve({ runId: "awr_aaaaaaaaaaaaaaaaaaaaaaaa" }) };
describe("article publish API", () => {
  it("returns 404 in production", async () => { vi.stubEnv("NODE_ENV", "production"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test"; expect((await POST(new NextRequest("http://localhost", { method: "POST", headers: { "x-admin-token": "test" } }), context)).status).toBe(404); });
  it("maps workflow conflicts", async () => { vi.stubEnv("NODE_ENV", "test"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test"; getArticleWorkbenchServer.mockReturnValue({ submit: vi.fn().mockRejectedValue(new Error("PUBLISHER_CONFLICT")) }); expect((await POST(new NextRequest("http://localhost", { method: "POST", headers: { "x-admin-token": "test" } }), context)).status).toBe(409); });
});
