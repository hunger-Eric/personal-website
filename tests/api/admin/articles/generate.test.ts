import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const { getArticleWorkbenchServer } = vi.hoisted(() => ({ getArticleWorkbenchServer: vi.fn() }));
vi.mock("@/lib/article-workbench/server", async (original) => ({ ...(await original<typeof import("@/lib/article-workbench/server")>()), getArticleWorkbenchServer }));
import { POST } from "@/app/api/admin/articles/generate/route";
import { readJsonBody } from "@/lib/article-workbench/server";
describe("article generation API", () => {
  it("locks out production and bounds the body", async () => {
    vi.stubEnv("NODE_ENV", "production"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test";
    expect((await POST(new NextRequest("http://localhost/api/admin/articles/generate", { method: "POST", headers: { "x-admin-token": "test" }, body: "{}" }))).status).toBe(404);
    vi.stubEnv("NODE_ENV", "test");
    await expect(readJsonBody(new Request("http://localhost/api/admin/articles/generate", { method: "POST", body: `"${"x".repeat(65_536)}"` }))).rejects.toThrow("ARTICLE_REQUEST_TOO_LARGE");
  });
  it("projects only run identity", async () => {
    vi.stubEnv("NODE_ENV", "test"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test";
    getArticleWorkbenchServer.mockReturnValue({ generate: vi.fn().mockResolvedValue({ id: "awr_aaaaaaaaaaaaaaaaaaaaaaaa", status: "validated", secret: "no" }) });
    const response = await POST(new NextRequest("http://localhost/api/admin/articles/generate", { method: "POST", headers: { "x-admin-token": "test" }, body: JSON.stringify({ topic: "Evidence", articleRules: ["Use sources"] }) }));
    expect(await response.json()).toEqual({ run: { id: "awr_aaaaaaaaaaaaaaaaaaaaaaaa", status: "validated" } });
  });
});
