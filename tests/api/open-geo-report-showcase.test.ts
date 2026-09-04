import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { GET } from "@/app/(site-zh)/projects/open-geo-console/report/route";

describe("Open GEO bilingual report showcase", () => {
  it("serves the fresh complete Chinese report from the Chinese project path", async () => {
    const response = await GET();
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("content-language")).toBe("zh-CN");
    expect(response.headers.get("content-security-policy")).toContain(
      "script-src 'none'"
    );
    expect(html).toMatch(/^<!doctype html><html lang="zh-CN">/iu);
    expect(html).toContain("de897b7a-1f95-4f94-8452-e2881883ff2d");
    expect(html).toContain("https://me.itheheda.online/");
    expect(html).toContain("结果摘要");
    expect(html).toContain('src="data:image/jpeg;base64,');
    expect(html).not.toContain("local-v4-");
    expect(html).not.toContain("report.html/download");
    expect(html).not.toContain("下载后请用浏览器打开该 HTML 文件。");
    expect(html).not.toContain("/api/reports/");
    expect(html).not.toMatch(/<script\b/iu);
    expect(html).not.toMatch(/<link\b[^>]*\bas=["']script["']/iu);
  });

  it("serves the fresh complete English report from the English project path", async () => {
    const routePath = path.join(
      process.cwd(), "app", "(site-en)", "en", "projects", "open-geo-console", "report", "route.ts"
    );
    expect(fs.existsSync(routePath)).toBe(true);
    const route = await import(pathToFileURL(routePath).href) as { GET: () => Promise<Response> };
    const response = await route.GET();
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-language")).toBe("en");
    expect(response.headers.get("content-security-policy")).toContain("script-src 'none'");
    expect(html).toMatch(/^<!doctype html><html lang="en">/iu);
    expect(html).toContain("03bbb2f7-e498-4f96-8e6f-c0864dded6b9");
    expect(html).toContain("Results summary");
    expect(html).toContain('src="data:image/jpeg;base64,');
    expect(html).not.toContain("local-v4-");
    expect(html).not.toContain("report.html/download");
    expect(html).not.toContain("下载 HTML");
    expect(html).not.toContain("/api/reports/");
    expect(html).not.toMatch(/<script\b/iu);
    expect(html).not.toMatch(/<link\b[^>]*\bas=["']script["']/iu);
  });

  it("serves only hash-named JPG evidence from the matching language report", async () => {
    const routePath = path.join(
      process.cwd(), "app", "(site-en)", "en", "projects", "open-geo-console", "evidence", "[asset]", "route.ts"
    );
    expect(fs.existsSync(routePath)).toBe(true);
    const route = await import(pathToFileURL(routePath).href) as {
      GET: (_request: Request, context: { params: Promise<{ asset: string }> }) => Promise<Response>;
    };
    const asset = "e8056a4e732efca21d13f19261071c5bc5aa7b3d42359abbf8b5ef08c124dc4d.jpg";
    const response = await route.GET(new Request("https://example.test"), { params: Promise.resolve({ asset }) });
    const rejected = await route.GET(new Request("https://example.test"), {
      params: Promise.resolve({ asset: "../open-geo-personal-site-en.html" })
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(1_000);
    expect(rejected.status).toBe(404);
  });
});
