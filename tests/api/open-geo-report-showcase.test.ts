import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { GET } from "@/app/(site-zh)/projects/open-geo-console/report/route";

function sha256WithLf(source: Buffer) {
  return createHash("sha256")
    .update(source.toString("utf8").replace(/\r\n/gu, "\n"))
    .digest("hex");
}

describe("Open GEO bilingual report showcase", () => {
  it("serves the fresh complete Chinese report from the Chinese project path", async () => {
    const source = fs.readFileSync(path.join(
      process.cwd(), "content", "report-samples", "open-geo-personal-site-zh.html"
    ));
    const response = await GET();
    const html = await response.text();

    expect(sha256WithLf(source)).toBe(
      "9e78cb7dc94215a5d366f2e3e8a18472bbe72efce19dff687f3423066b3bae91"
    );
    expect(source.toString("utf8")).toContain("05986f1b-4b66-48c5-b016-6d9b55444126");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("content-language")).toBe("zh-CN");
    expect(response.headers.get("content-security-policy")).toContain(
      "script-src 'none'"
    );
    expect(html).toMatch(/^<!doctype html><html lang="zh-CN">/iu);
    expect(html).toContain("https://me.itheheda.online/");
    expect(html).toContain("网站分析");
    expect(html).toContain("页面修改");
    expect(html).toContain('data-open-geo-public-shell="responsive"');
    expect(html).not.toContain("local-v4-");
    expect(html).not.toContain("report.html/download");
    expect(html).not.toContain("下载后请用浏览器打开该 HTML 文件。");
    expect(html).not.toContain("/api/reports/");
    expect(html).not.toContain("/_next/static/");
    expect(html).not.toContain("05986f1b-4b66-48c5-b016-6d9b55444126");
    expect(html).not.toMatch(/<script\b/iu);
    expect(html).not.toMatch(/<link\b[^>]*\bas=["']script["']/iu);
  });

  it("serves the fresh complete English report from the English project path", async () => {
    const source = fs.readFileSync(path.join(
      process.cwd(), "content", "report-samples", "open-geo-personal-site-en.html"
    ));
    const routePath = path.join(
      process.cwd(), "app", "(site-en)", "en", "projects", "open-geo-console", "report", "route.ts"
    );
    expect(fs.existsSync(routePath)).toBe(true);
    const route = await import(pathToFileURL(routePath).href) as { GET: () => Promise<Response> };
    const response = await route.GET();
    const html = await response.text();

    expect(sha256WithLf(source)).toBe(
      "074f2eb484e1423404b2f7e40b063559aef71335f4cdd07b3fc5120065cbc603"
    );
    expect(source.toString("utf8")).toContain("3d14f8e5-44a0-4fc6-aa5a-4aa527db7d10");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-language")).toBe("en");
    expect(response.headers.get("content-security-policy")).toContain("script-src 'none'");
    expect(html).toMatch(/^<!doctype html><html lang="en">/iu);
    expect(html).toContain("Website analysis");
    expect(html).toContain("Page changes");
    expect(html).toContain('data-open-geo-public-shell="responsive"');
    expect(html).not.toContain("local-v4-");
    expect(html).not.toContain("report.html/download");
    expect(html).not.toContain("下载 HTML");
    expect(html).not.toContain("/api/reports/");
    expect(html).not.toContain("/_next/static/");
    expect(html).not.toContain("3d14f8e5-44a0-4fc6-aa5a-4aa527db7d10");
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
