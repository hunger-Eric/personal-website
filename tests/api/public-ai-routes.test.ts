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
  });

  it("publishes only reviewed project summaries", async () => {
    const body = await (await getProjects()).json();

    expect(body.projects.map((project: { id: string }) => project.id)).toEqual([
      "freight-lead-agent",
    ]);
    expect(JSON.stringify(body)).not.toContain("repository");
  });

  it("publishes a complete reviewed project and returns 404 for unknown ids", async () => {
    const found = await getProject(new Request("http://localhost"), {
      params: Promise.resolve({ id: ["freight-lead-agent.json"] }),
    });
    const missing = await getProject(new Request("http://localhost"), {
      params: Promise.resolve({ id: ["missing-case.json"] }),
    });

    expect(found.status).toBe(200);
    expect((await found.json()).project.currentStatus.zh).toContain("601");
    expect(missing.status).toBe(404);
  });
});
