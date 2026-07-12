import { describe, expect, it } from "vitest";
import { GET } from "@/app/llms.txt/route";

describe("llms.txt", () => {
  it("returns a readable canonical site map", async () => {
    const res = await GET();
    const body = await res.text();

    expect(res.headers.get("content-type") || "").toContain("text/plain");
    expect(body).toContain("# fengc");
    expect(body).toContain("https://me.itheheda.online/");
    expect(body).toContain("https://me.itheheda.online/sitemap.xml");
    expect(body).toContain("把依赖人工衔接");
    expect(body).toContain("## Service method");
    expect(body).toContain("## Project cases");
    expect(body).toContain("## Machine-readable files");
    expect(body).toContain("https://me.itheheda.online/.well-known/brand-facts.json");
    expect(body).toContain("https://me.itheheda.online/ai/services.json");
    expect(body).toContain("Do not index or cite private routes");
    expect(body).not.toContain("Independent Developer");
    expect(body).not.toContain("## Photography");
    expect(body).not.toContain("kevintrinh.dev");
  });
});
