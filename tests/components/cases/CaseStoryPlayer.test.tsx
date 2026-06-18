// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import type { CustomerStory } from "@/config/cases";
import { CaseStoryPlayer } from "@/components/cases/CaseStoryPlayer";
import { getSiteCopy } from "@/config/contentCopy";

vi.mock("next/link", () => ({
  default: ({ href, children, className, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", { href, className, ...props }, children),
}));

vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({ locale: "zh" }),
}));

vi.mock("lucide-react", () => ({
  ArrowRight: () => React.createElement("svg"),
  CheckCircle2: () => React.createElement("svg"),
  FileOutput: () => React.createElement("svg"),
  Pause: () => React.createElement("svg"),
  Play: () => React.createElement("svg"),
  RotateCcw: () => React.createElement("svg"),
  StepForward: () => React.createElement("svg"),
}));

const story: CustomerStory = {
  archetype: "lead-discovery",
  headline: "把公开信息变成可审计线索批次",
  publicScenario: "B2B 团队需要从公开信息发现潜在客户。",
  exampleInput: "目标市场、客户画像、关键词、地区",
  transferableValue: "适用于 B2B 销售和市场调研。",
  artifactLabel: "可审计线索表",
  proofPoints: ["每条线索都带来源证据"],
  steps: [
    {
      title: "公开来源发现",
      customerAction: "输入目标市场",
      systemAction: "收集公开候选",
      visibleOutput: "候选公司带来源证据",
      artifactPreview: "Candidate batch",
      metric: "320 candidates",
      proof: "原始来源可回查",
    },
    {
      title: "线索分级",
      customerAction: "设定优先级规则",
      systemAction: "去重、评分、标记证据强弱",
      visibleOutput: "客户看到 A/B/C 线索批次",
      artifactPreview: "Lead table",
      metric: "72 reachable leads",
      proof: "评分依据可见",
    },
  ],
};

const copy = getSiteCopy("zh").cases;

describe("CaseStoryPlayer", () => {
  it("renders the abstract scenario and advances between steps", () => {
    render(
      React.createElement(CaseStoryPlayer, {
        story,
        caseHref: "/projects/freight-lead-agent",
      })
    );

    expect(screen.getByText("目标市场、客户画像、关键词、地区")).toBeInTheDocument();
    expect(screen.getByText("Candidate batch")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(copy.nextStoryStep));
    expect(screen.getByText("Lead table")).toBeInTheDocument();
    expect(screen.getAllByText("72 reachable leads").length).toBeGreaterThan(0);
  });

  it("links to the full case when a href is provided", () => {
    render(
      React.createElement(CaseStoryPlayer, {
        story,
        caseHref: "/projects/freight-lead-agent",
      })
    );

    expect(screen.getByRole("link", { name: /完整案例/ })).toHaveAttribute(
      "href",
      "/projects/freight-lead-agent"
    );
  });
});
