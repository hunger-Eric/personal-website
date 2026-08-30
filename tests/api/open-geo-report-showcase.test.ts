import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { GET } from "@/app/(site-zh)/projects/open-geo-console/report/route";

describe("Open GEO Chinese report showcase", () => {
  it("serves the sanitized real report only from the Chinese project path", async () => {
    const response = await GET();
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("content-security-policy")).toContain(
      "script-src 'none'"
    );
    expect(html).toContain("Open GEO 深度报告样例｜实解智能官网");
    expect(html).toContain("https://me.itheheda.online/");
    expect(html).toContain("网站现状：我们看到了什么");
    expect(html).toMatch(/3(?:<!-- -->)?\/(?:<!-- -->)?3/);
    expect(html).not.toContain("<script");
    expect(html).not.toContain("/_next/");
    expect(html).not.toContain("/api/reports/");
    expect(html).not.toContain("local-v4-");

    expect(
      fs.existsSync(
        path.join(
          process.cwd(),
          "app",
          "(site-en)",
          "en",
          "projects",
          "open-geo-console",
          "report"
        )
      )
    ).toBe(false);
  });
});
