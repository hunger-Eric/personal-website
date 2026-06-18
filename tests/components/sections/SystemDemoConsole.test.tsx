// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import type { CaseItem } from "@/config/cases";
import { SystemDemoConsole } from "@/components/sections/SystemDemoConsole";

vi.mock("next/link", () => ({
  default: ({ href, children, className, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", { href, className, ...props }, children),
}));

vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({ locale: "zh" }),
}));

vi.mock("@/components/cases/DemoTimeline", () => ({
  DemoTimeline: ({ demo }: { demo: { title: string } }) =>
    React.createElement("div", { "data-testid": "demo-timeline" }, demo.title),
}));

vi.mock("lucide-react", () => ({
  ArrowUpRight: () => React.createElement("svg"),
  Cpu: () => React.createElement("svg"),
  Database: () => React.createElement("svg"),
  Network: () => React.createElement("svg"),
  SearchCode: () => React.createElement("svg"),
}));

const demo = {
  type: "knowledge-flow" as const,
  title: "Hermes flow",
  description: "demo",
  steps: [
    {
      title: "Source ingest",
      status: "extracting",
      input: "source",
      output: "normalized",
      logs: ["ok"],
    },
  ],
  result: {
    label: "artifact",
    cta: "open",
  },
};

const cases: CaseItem[] = [
  {
    id: "hermes-notebook",
    name: "Hermes Notebook",
    summary: "RAG case",
    start: "2026-01",
    end: "Now",
    caseType: "Knowledge/RAG",
    tags: ["Knowledge/RAG"],
    demo,
  },
  {
    id: "freight-lead-agent",
    name: "Freight Lead Agent",
    summary: "Lead case",
    start: "2026-01",
    end: "Now",
    caseType: "Automation",
    tags: ["Automation"],
    demo: { ...demo, type: "lead-flow", title: "Lead flow" },
  },
  {
    id: "element-asset-sdk",
    name: "Element Asset SDK",
    summary: "SDK case",
    start: "2026-01",
    end: "Now",
    caseType: "Agent Runtime",
    tags: ["Agent Runtime"],
    demo: { ...demo, type: "asset-flow", title: "Asset flow" },
  },
];

describe("SystemDemoConsole", () => {
  it("renders project cards as links to case detail pages", () => {
    render(React.createElement(SystemDemoConsole, { cases }));

    expect(screen.getByRole("link", { name: /Hermes Notebook/ })).toHaveAttribute(
      "href",
      "/projects/hermes-notebook"
    );
    expect(screen.getByRole("link", { name: /Freight Lead Agent/ })).toHaveAttribute(
      "href",
      "/projects/freight-lead-agent"
    );
    expect(screen.getByRole("link", { name: /Element Asset SDK/ })).toHaveAttribute(
      "href",
      "/projects/element-asset-sdk"
    );
  });

  it("keeps demo preview controls separate from case navigation", () => {
    render(React.createElement(SystemDemoConsole, { cases }));

    expect(screen.getByTestId("demo-timeline")).toHaveTextContent("Hermes flow");

    fireEvent.click(screen.getByRole("button", { name: "Preview Freight Lead Agent demo" }));
    expect(screen.getByTestId("demo-timeline")).toHaveTextContent("Lead flow");
  });
});
