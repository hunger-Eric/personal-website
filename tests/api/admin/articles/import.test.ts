import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { importOpenGeoMarkdown } = vi.hoisted(() => ({ importOpenGeoMarkdown: vi.fn() }));
vi.mock("@/lib/article-workbench/server", async (original) => ({
  ...(await original<typeof import("@/lib/article-workbench/server")>()),
  getArticleWorkbenchServer: () => ({ importOpenGeoMarkdown }),
}));

import { POST } from "@/app/api/admin/articles/import/route";

const requestBody = {
  markdown: "# 标题\n\n摘要。\n\n正文 [来源](https://example.com/source)。",
  slugProposal: "open-geo-article",
  tags: ["GEO"],
};

describe("Open GEO article import API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ENABLE_ADMIN", "true");
    vi.stubEnv("ADMIN_TOKEN", "test-token");
  });

  it("imports one authenticated Markdown export without creating an Open GEO task or payment", async () => {
    importOpenGeoMarkdown.mockResolvedValue({ id: "awr_aaaaaaaaaaaaaaaaaaaaaaaa", status: "validated" });
    const response = await POST(new NextRequest("http://localhost/api/admin/articles/import", {
      method: "POST",
      headers: { "x-admin-token": "test-token", "content-type": "application/json" },
      body: JSON.stringify(requestBody),
    }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ run: { id: "awr_aaaaaaaaaaaaaaaaaaaaaaaa", status: "validated" } });
    expect(importOpenGeoMarkdown).toHaveBeenCalledWith(requestBody);
  });

  it("fails closed before import when the admin capability is missing", async () => {
    const response = await POST(new NextRequest("http://localhost/api/admin/articles/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(requestBody),
    }));

    expect(response.status).toBe(404);
    expect(importOpenGeoMarkdown).not.toHaveBeenCalled();
  });
});
