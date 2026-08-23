import { describe, expect, it } from "vitest";
import { GET } from "@/app/llms.txt/route";

describe("llms.txt", () => {
  it("returns a readable canonical site map", async () => {
    const res = await GET();
    const body = await res.text();

    expect(res.headers.get("content-type") || "").toContain("text/plain");
    expect(body).toContain("# 实解智能");
    expect(body).toContain("Slogan: 让 AI 真正在企业里跑起来。");
    expect(body).toContain("https://me.itheheda.online/");
    expect(body).toContain("https://me.itheheda.online/sitemap.xml");
    expect(body).toContain("把依赖人工衔接");
    expect(body).toContain("## Service method");
    expect(body).toContain("## Standard deliverables");
    expect(body).toContain("异常与恢复路径 / Exception and recovery path");
    expect(body).toContain("## Data and permission boundaries");
    expect(body).toContain("## Buyer questions");
    expect(body).toContain("选择 AI 系统服务商时应该核实什么？");
    expect(body).toContain("## Project cases");
    expect(body).toContain("Open GEO Console");
    expect(body).toContain("Freight Lead Agent");
    expect(body).toContain("Hermes Notebook");
    expect(body).not.toContain("Enterprise Content Growth System");
    expect(body).toContain("https://me.itheheda.online/services");
    expect(body).toContain("## Machine-readable files");
    expect(body).toContain("https://me.itheheda.online/.well-known/brand-facts.json");
    expect(body).toContain("https://me.itheheda.online/ai/services.json");
    expect(body).toContain("Do not index or cite private routes");
    expect(body).not.toContain("Independent Developer");
    expect(body).not.toContain("## Photography");
    expect(body).not.toContain("kevintrinh.dev");
  });
});
