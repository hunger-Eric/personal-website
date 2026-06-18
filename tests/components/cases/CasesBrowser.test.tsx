// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import type { CaseItem } from "@/config/cases";
import { CasesBrowser } from "@/components/cases/CasesBrowser";

vi.mock("next/link", () => ({
  default: ({ href, children, className, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", { href, className, ...props }, children),
}));

vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({ locale: "zh" }),
}));

vi.mock("lucide-react", () => ({
  ArrowUpRight: () => React.createElement("svg"),
  Filter: () => React.createElement("svg"),
  FolderOpen: () => React.createElement("svg"),
}));

const cases: CaseItem[] = [
  {
    id: "knowledge",
    name: "Knowledge System",
    summary: "RAG case",
    start: "2026-01",
    end: "Now",
    featured: true,
    caseType: "Knowledge/RAG",
    tags: ["Knowledge/RAG"],
    workflows: ["source ingestion"],
    aiStack: ["RAG"],
  },
  {
    id: "agent",
    name: "Agent Runtime",
    summary: "SDK case",
    start: "2026-01",
    end: "Now",
    caseType: "Agent Runtime",
    tags: ["Agent Runtime"],
    workflows: ["asset validation"],
    aiStack: ["SDK"],
  },
];

describe("CasesBrowser", () => {
  it("filters archive cases by capability", () => {
    render(React.createElement(CasesBrowser, { cases }));

    expect(screen.getByText("Knowledge System")).toBeInTheDocument();
    expect(screen.getAllByText("Agent Runtime").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Agent Runtime" }));
    expect(screen.queryByText("Knowledge System")).not.toBeInTheDocument();
    expect(screen.getAllByText("Agent Runtime").length).toBeGreaterThan(0);
  });

  it("does not render the old flagship story-player section copy", () => {
    render(React.createElement(CasesBrowser, { cases }));

    expect(screen.queryByText(/Transferable capability demos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/抽象能力模型/)).not.toBeInTheDocument();
    expect(screen.getByText("案例索引")).toBeInTheDocument();
  });
});
