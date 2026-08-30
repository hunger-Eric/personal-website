import { describe, expect, it } from "vitest";

import { GET as getBrandFacts } from "@/app/.well-known/brand-facts.json/route";
import { GET as getServices } from "@/app/ai/services.json/route";
import { GET as getProjects } from "@/app/ai/projects.json/route";
import { GET as getProject } from "@/app/ai/projects/[...id]/route";

describe("public AI routes", () => {
  it("publishes canonical brand facts from the shared public model", async () => {
    const response = await getBrandFacts();
    const body = await response.json();

    expect(response.headers.get("content-type")).toContain("application/json");
    expect(body.schemaVersion).toBe("1.0");
    expect(body.canonicalUrl).toBe("https://me.itheheda.online");
    expect(body.positioning.zh).toContain("人工衔接");
    expect(body.machineReadable.projects).toContain("/ai/projects.json");
  });

  it("publishes service fit, method, and boundaries without a fixed industry promise", async () => {
    const body = await (await getServices()).json();

    expect(body.service.problemSignals.zh.length).toBeGreaterThan(2);
    expect(body.service.method.zh).toHaveLength(4);
    expect(body.service.deliverables.zh.map((item: { title: string }) => item.title)).toContain("异常与恢复路径");
    expect(body.service.dataBoundaries.zh.map((item: { title: string }) => item.title)).toContain("人工授权与高风险动作");
    expect(body.service.faq.zh.map((item: { question: string }) => item.question)).toContain("选择 AI 系统服务商时应该核实什么？");
    expect(body.service.boundaries.zh.join(" ")).toContain("不销售固定行业模板");
    expect(body.contact.channel).toContain("work email");
    expect(body.contact.responseExpectation.zh).toContain("不承诺固定响应时限");
  });

  it("publishes only reviewed projects without a simulated product state", async () => {
    const body = await (await getProjects()).json();

    expect(body.projects.map((project: { id: string }) => project.id)).toEqual([
      "open-geo-console",
      "hermes-notebook",
      "freight-lead-agent",
      "codex-feishu-bridge",
    ]);
    expect(body.projects.map((project: { reviewStatus: string }) => project.reviewStatus)).toEqual([
      "reviewed",
      "reviewed",
      "reviewed",
      "reviewed",
    ]);
    expect(body.projects[0]).not.toHaveProperty("isSimulation");
    expect(body.projects[0]).not.toHaveProperty("simulationScope");
    expect(body.projects[0].facts.map((fact: { kind: string }) => fact.kind)).toEqual([
      "problem",
      "solution",
      "buyerValue",
    ]);
    expect(body.projects[1].facts.map((fact: { kind: string }) => fact.kind)).toEqual([
      "problem",
      "solution",
      "buyerValue",
    ]);
    expect(body.projects[2].facts.map((fact: { kind: string }) => fact.kind)).toEqual([
      "problem",
      "solution",
      "buyerValue",
    ]);
    expect(body.projects[3].facts.map((fact: { kind: string }) => fact.kind)).toEqual([
      "problem",
      "solution",
      "buyerValue",
    ]);
    expect(body.projects.every((project: { facts: Array<{ text: { zh: string; en: string } }> }) =>
      project.facts.every((fact) => fact.text.zh.length > 0 && fact.text.en.length > 0)
    )).toBe(true);
    expect(JSON.stringify(body)).not.toContain("repository");
    expect(JSON.stringify(body)).not.toContain("materials-pending");
    expect(JSON.stringify(body)).not.toMatch(/601|521|469 条|126 家/);
  });

  it("publishes a complete reviewed project and returns 404 for unknown ids", async () => {
    const found = await getProject(new Request("http://localhost"), {
      params: Promise.resolve({ id: ["codex-feishu-bridge.json"] }),
    });
    const missing = await getProject(new Request("http://localhost"), {
      params: Promise.resolve({ id: ["missing-case.json"] }),
    });

    expect(found.status).toBe(200);
    expect((await found.json()).project.currentStatus.zh).toContain("Windows 10/11 x64");
    const hermes = await getProject(new Request("http://localhost"), {
      params: Promise.resolve({ id: ["hermes-notebook.json"] }),
    });
    expect(hermes.status).toBe(200);
    expect((await hermes.json()).project.currentStatus.zh).toContain("检索与问答 API");
    expect(missing.status).toBe(404);
  });
});
