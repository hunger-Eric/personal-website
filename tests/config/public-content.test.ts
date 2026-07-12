import { describe, expect, it } from "vitest";

import {
  getLocalizedPublicContent,
  publicContent,
} from "@/config/public-content";

describe("public content contract", () => {
  it("uses one reviewed project collection for human and AI surfaces", () => {
    expect(publicContent.projects.map((project) => project.id)).toEqual([
      "freight-lead-agent",
    ]);
    expect(publicContent.projects.every((project) => project.review.approvedForPublic)).toBe(
      true
    );
  });

  it("positions the service as custom workflow diagnosis rather than a fixed vertical", () => {
    const content = getLocalizedPublicContent("zh");

    expect(content.identity.positioning).toContain("人工衔接");
    expect(content.service.boundaries.join(" ")).toContain("不销售固定行业模板");
    expect(content.cta.primary.href).toBe("/contact");
  });

  it("keeps the English structure aligned with the Chinese structure", () => {
    const zh = getLocalizedPublicContent("zh");
    const en = getLocalizedPublicContent("en");

    expect(en.service.problemSignals).toHaveLength(zh.service.problemSignals.length);
    expect(en.service.method).toHaveLength(zh.service.method.length);
    expect(en.projects.map((project) => project.id)).toEqual(
      zh.projects.map((project) => project.id)
    );
  });
});
