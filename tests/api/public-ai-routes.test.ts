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
    expect(body.service.boundaries.zh.join(" ")).toContain("不销售固定行业模板");
    expect(body.contact.channel).toContain("work email");
    expect(body.contact.responseExpectation.zh).toContain("不承诺固定响应时限");
  });

  it("publishes only reviewed cases and explicitly labeled simulations", async () => {
    const body = await (await getProjects()).json();

    expect(body.projects.map((project: { id: string }) => project.id)).toEqual([
      "open-geo-console",
      "freight-lead-agent",
    ]);
    expect(body.projects.map((project: { reviewStatus: string }) => project.reviewStatus)).toEqual([
      "simulation",
      "reviewed",
    ]);
    expect(body.projects[0].simulationScope).toMatchObject({ usesSimulatedData: true, performsLiveCrawling: false, performsModelCalls: false, isFormalDiagnosis: false });
    expect(body.projects[0].facts.map((fact: { kind: string }) => fact.kind)).toEqual([
      "problem",
      "solution",
      "buyerValue",
      "boundary",
    ]);
    expect(body.projects[1].facts.map((fact: { kind: string }) => fact.kind)).toEqual([
      "problem",
      "solution",
      "buyerValue",
      "boundary",
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
      params: Promise.resolve({ id: ["freight-lead-agent.json"] }),
    });
    const missing = await getProject(new Request("http://localhost"), {
      params: Promise.resolve({ id: ["missing-case.json"] }),
    });

    expect(found.status).toBe(200);
    expect((await found.json()).project.currentStatus.zh).toContain("本地测试与验收数据不作为客户结果");
    expect(missing.status).toBe(404);
  });
});
