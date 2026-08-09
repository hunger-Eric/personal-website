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
  it("rejects oversized streamed bodies despite absent or forged content length", async () => {
    vi.stubEnv("NODE_ENV", "test"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test";
    for (const length of [undefined, "2"]) {
      let cancelled = false;
      const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new TextEncoder().encode(`"${"x".repeat(65_536)}"`)); }, cancel() { cancelled = true; } });
      const request = { headers: new Headers({ ...(length ? { "content-length": length } : {}) }), body: stream } as unknown as Request;
      await expect(readJsonBody(request)).rejects.toThrow("ARTICLE_REQUEST_TOO_LARGE");
      await Promise.resolve();
      expect(cancelled).toBe(true);
    }
  });
  it("maps oversized standard Request streams to 413 at the route boundary", async () => {
    vi.stubEnv("NODE_ENV", "test"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test";
    getArticleWorkbenchServer.mockReturnValue({ generate: vi.fn() });
    for (const length of [undefined, "2"]) {
      const oversizedPayload = JSON.stringify({ topic: "x".repeat(65_536), articleRules: ["Use sources"] });
      const request = new Request("http://localhost/api/admin/articles/generate", { method: "POST", headers: { "x-admin-token": "test" }, body: new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new TextEncoder().encode(oversizedPayload)); } }), duplex: "half" } as unknown as RequestInit);
      if (length) request.headers.set("content-length", length);
      Object.defineProperties(request, { nextUrl: { value: new URL(request.url) }, cookies: { value: { get: () => undefined } } });
      expect((await POST(request as unknown as NextRequest)).status).toBe(413);
    }
  });
  it("projects only run identity", async () => {
    vi.stubEnv("NODE_ENV", "test"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test";
    getArticleWorkbenchServer.mockReturnValue({ generate: vi.fn().mockResolvedValue({ id: "awr_aaaaaaaaaaaaaaaaaaaaaaaa", status: "validated", secret: "no" }) });
    const response = await POST(new NextRequest("http://localhost/api/admin/articles/generate", { method: "POST", headers: { "x-admin-token": "test" }, body: JSON.stringify({ topic: "Evidence", articleRules: ["Use sources"] }) }));
    expect(await response.json()).toEqual({ run: { id: "awr_aaaaaaaaaaaaaaaaaaaaaaaa", status: "validated" } });
  });
  it.each(["ARTICLE_MODEL_PERSISTENCE_FAILED", "ANYSEARCH_PERSISTENCE_FAILED", "PROVIDER_RECEIPT_PERSISTENCE_FAILED"])("maps provider receipt persistence failure %s to 502", async (code) => {
    vi.stubEnv("NODE_ENV", "test"); process.env.ENABLE_ADMIN = "true"; process.env.ADMIN_TOKEN = "test";
    getArticleWorkbenchServer.mockReturnValue({ generate: vi.fn().mockRejectedValue(new Error(code)) });
    const response = await POST(new NextRequest("http://localhost/api/admin/articles/generate", { method: "POST", headers: { "x-admin-token": "test" }, body: JSON.stringify({ topic: "Evidence", articleRules: ["Use sources"] }) }));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Article provider unavailable" });
  });
});
