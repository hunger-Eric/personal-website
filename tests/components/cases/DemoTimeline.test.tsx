// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import type { CaseDemo } from "@/config/cases";
import { DemoTimeline } from "@/components/cases/DemoTimeline";

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

describe("DemoTimeline", () => {
  it("renders the first step and advances manually", () => {
    render(React.createElement(DemoTimeline, { demo }));

    expect(screen.getByText("source.pdf")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Next demo step"));
    expect(screen.getByText("cited answer")).toBeInTheDocument();
    expect(screen.getByText("top-k: 5")).toBeInTheDocument();
  });

  it("replays from the first step", () => {
    render(React.createElement(DemoTimeline, { demo }));

    fireEvent.click(screen.getByLabelText("Next demo step"));
    fireEvent.click(screen.getByLabelText("Replay demo"));
    expect(screen.getByText("source normalized")).toBeInTheDocument();
  });
});
