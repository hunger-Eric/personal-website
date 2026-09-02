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
    expect(html).toMatch(/^<!DOCTYPE html><html lang="zh-CN">/u);
    expect(html).toContain("ed76a2dc-e0ab-4510-867b-ab7f071f8f16");
    expect(html).toContain("https://me.itheheda.online/");
    expect(html).toContain("核心结论");
    expect(html).toContain("./evidence/");
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
    expect(html).toMatch(/^<!DOCTYPE html><html lang="en">/u);
    expect(html).toContain("b15c9474-7c3b-4688-8fef-d05c418a858c");
    expect(html).toContain("Core conclusion");
    expect(html).toContain("./evidence/");
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
