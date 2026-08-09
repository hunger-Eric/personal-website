import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const { getArticleWorkbenchServer } = vi.hoisted(() => ({ getArticleWorkbenchServer: vi.fn() }));
vi.mock("@/lib/article-workbench/server", async (original) => ({ ...(await original<typeof import("@/lib/article-workbench/server")>()), getArticleWorkbenchServer }));
import { GET, PUT } from "@/app/api/admin/articles/profile/route";

describe("article profile API", () => {
  it("is unavailable when admin is disabled", async () => {
    vi.stubEnv("NODE_ENV", "production"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test";
    expect((await GET(new NextRequest("http://localhost/api/admin/articles/profile", { headers: { "x-admin-token": "test" } }))).status).toBe(404);
  });
  it("uses strict profile input", async () => {
    vi.stubEnv("NODE_ENV", "test"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test";
    getArticleWorkbenchServer.mockReturnValue({ saveProfile: vi.fn(), getProfile: vi.fn() });
    expect((await PUT(new NextRequest("http://localhost/api/admin/articles/profile", { method: "PUT", headers: { "x-admin-token": "test", "content-type": "application/json" }, body: JSON.stringify({ identity: {} }) }))).status).toBe(400);
  });
});
