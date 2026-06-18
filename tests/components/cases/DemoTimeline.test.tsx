// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import type { CaseDemo } from "@/config/cases";
import { DemoTimeline } from "@/components/cases/DemoTimeline";
import { getSiteCopy } from "@/config/contentCopy";

vi.mock("lucide-react", () => ({
  ArrowRight: () => React.createElement("svg"),
  CheckCircle2: () => React.createElement("svg"),
  Pause: () => React.createElement("svg"),
  Play: () => React.createElement("svg"),
  RotateCcw: () => React.createElement("svg"),
  StepForward: () => React.createElement("svg"),
  TerminalSquare: () => React.createElement("svg"),
}));

const demo: CaseDemo = {
  type: "knowledge-flow",
  title: "Demo flow",
  description: "A simulated demo",
  steps: [
    {
      title: "Ingest",
      status: "extracting",
      input: "source.pdf",
      output: "source normalized",
      logs: ["read source"],
    },
    {
      title: "Answer",
      status: "reasoning",
      input: "question",
      output: "cited answer",
      metric: "top-k: 5",
      logs: ["retrieve evidence"],
    },
  ],
  result: { label: "Traceable note", cta: "Open case" },
};
const copy = getSiteCopy("zh").cases;

describe("DemoTimeline", () => {
  it("renders the first step and advances manually", () => {
    render(React.createElement(DemoTimeline, { demo }));

    expect(screen.getByText("source.pdf")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(copy.nextDemoStep));
    expect(screen.getByText("cited answer")).toBeInTheDocument();
    expect(screen.getByText("top-k: 5")).toBeInTheDocument();
  });

  it("replays from the first step", () => {
    render(React.createElement(DemoTimeline, { demo }));

    fireEvent.click(screen.getByLabelText(copy.nextDemoStep));
    fireEvent.click(screen.getByLabelText(copy.replayDemo));
    expect(screen.getByText("source normalized")).toBeInTheDocument();
  });

  it("uses centralized demo chrome copy and system visual tokens", () => {
    const { container } = render(React.createElement(DemoTimeline, { demo }));

    expect(screen.getByText(copy.demoInputLabel)).toBeInTheDocument();
    expect(screen.getByText(copy.demoOutputLabel)).toBeInTheDocument();
    expect(screen.getByText(copy.demoResultLabel)).toBeInTheDocument();
    expect(screen.getByText(copy.demoLiveTrace)).toBeInTheDocument();
    expect(container.querySelector(".bg-surface-graphite")).toBeInTheDocument();
    expect(container.querySelector(".rounded-card")).toBeInTheDocument();
    expect(container.innerHTML).not.toContain(["bg", "card"].join("-"));
    expect(container.innerHTML).not.toContain(["border", "white/10"].join("-"));
    expect(container.innerHTML).not.toContain("rounded-2xl");
  });
});
