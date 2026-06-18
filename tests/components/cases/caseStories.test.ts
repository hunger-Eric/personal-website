import { describe, expect, it } from "vitest";

import { caseStories } from "@/config/caseStories";

describe("caseStories", () => {
  it("keeps demos away from route-, client-, or internal-brief wording", () => {
    const serialized = JSON.stringify(caseStories);

    expect(serialized).not.toMatch(/Shenzhen|Taiwan|深圳|台湾/);
    expect(serialized).not.toMatch(/客户名称|某客户|具体客户/);
    expect(serialized).not.toMatch(/抽象能力模型|公开版本|不绑定单一业务场景|真实项目经验/);
  });

  it("defines the three flagship capability models and animation assets", () => {
    expect(caseStories["hermes-notebook"].archetype).toBe("knowledge-system");
    expect(caseStories["hermes-notebook"].animationSrc).toBe(
      "/animations/projects/hermes/index.html"
    );

    expect(caseStories["freight-lead-agent"].archetype).toBe("lead-discovery");
    expect(caseStories["freight-lead-agent"].animationSrc).toBe(
      "/animations/projects/freight/index.html"
    );

    expect(caseStories["element-asset-sdk"].archetype).toBe("ui-asset-runtime");
    expect(caseStories["element-asset-sdk"].animationSrc).toBe(
      "/animations/projects/element-sdk/index.html"
    );
  });
});
