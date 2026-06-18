// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import type { CaseItem, CustomerStory } from "@/config/cases";
import { CaseFilmStage } from "@/components/cases/CaseFilmStage";
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
  ArrowUpRight: () => React.createElement("svg"),
  BookOpen: () => React.createElement("svg"),
  Database: () => React.createElement("svg"),
  FileOutput: () => React.createElement("svg"),
  MousePointer2: () => React.createElement("svg"),
  Pause: () => React.createElement("svg"),
  Play: () => React.createElement("svg"),
  RotateCcw: () => React.createElement("svg"),
  ShieldCheck: () => React.createElement("svg"),
  StepForward: () => React.createElement("svg"),
  Workflow: () => React.createElement("svg"),
}));

function mockMotion(reduced: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reduced : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

const story = (overrides: Partial<CustomerStory> = {}): CustomerStory => ({
  archetype: "knowledge-system",
  headline: "Turn sources into knowledge",
  chapterTitle: "Sources to knowledge",
  shortPromise: "Collect input and ship a traceable artifact.",
  animationSrc: "/animations/projects/hermes/index.html",
  sceneAccent: "#c48a2c",
  publicScenario: "Teams need traceable answers.",
  exampleInput: "PDF, web page, meeting note",
  transferableValue: "Useful for knowledge bases and handoffs.",
  artifactLabel: "Knowledge card",
  proofPoints: ["Citations stay attached"],
  steps: [
    {
      title: "Ingest",
      customerAction: "Choose sources",
      systemAction: "Normalize sources",
      visibleOutput: "Sources enter the flow",
      artifactPreview: "artifact-1",
      metric: "4 sources",
      proof: "Source names stay visible",
    },
    {
      title: "Answer",
      customerAction: "Ask a question",
      systemAction: "Rank evidence",
      visibleOutput: "Answer with citations",
      artifactPreview: "artifact-2",
      metric: "5 citations",
      proof: "Evidence can be reviewed",
    },
  ],
  ...overrides,
});

const cases: CaseItem[] = [
  {
    id: "hermes-notebook",
    name: "Hermes Notebook",
    summary: "Knowledge case",
    start: "2026-01",
    end: "Now",
    customerStory: story(),
  },
  {
    id: "freight-lead-agent",
    name: "Freight Lead Agent",
    summary: "Lead case",
    start: "2026-01",
    end: "Now",
    customerStory: story({
      archetype: "lead-discovery",
      headline: "Turn public signals into leads",
      chapterTitle: "Signals to leads",
      shortPromise: "Build an auditable lead list.",
      animationSrc: "/animations/projects/freight/index.html",
      artifactLabel: "Lead table",
      steps: [
        {
          title: "Discover",
          customerAction: "Choose a market",
          systemAction: "Collect public candidates",
          visibleOutput: "Candidate list appears",
          artifactPreview: "lead-artifact",
          metric: "320 candidates",
          proof: "Source URL is retained",
        },
      ],
    }),
  },
];

describe("CaseFilmStage", () => {
  beforeEach(() => {
    mockMotion(false);
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      value: class IntersectionObserver {
        observe() {}
        disconnect() {}
      },
    });
  });

  it("switches chapters and updates the animation source and artifact", () => {
    render(React.createElement(CaseFilmStage, { cases }));

    expect(screen.getByText("Turn sources into knowledge")).toBeInTheDocument();
    expect(screen.getByText("artifact-1")).toBeInTheDocument();
    expect(screen.getByTitle("Hermes Notebook animated system demo")).toHaveAttribute(
      "src",
      "/animations/projects/hermes/index.html"
    );

    fireEvent.click(screen.getAllByRole("button", { name: /Signals to leads/i })[0]);

    expect(screen.getByText("Turn public signals into leads")).toBeInTheDocument();
    expect(screen.getByText("lead-artifact")).toBeInTheDocument();
    expect(screen.getByTitle("Freight Lead Agent animated system demo")).toHaveAttribute(
      "src",
      "/animations/projects/freight/index.html"
    );
  });

  it("advances and replays the current step", () => {
    const copy = getSiteCopy("zh").cases;
    render(React.createElement(CaseFilmStage, { cases, singleCase: true }));

    expect(screen.getByText("artifact-1")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(copy.nextStep));
    expect(screen.getByText("artifact-2")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(copy.replayFilm));
    expect(screen.getByText("artifact-1")).toBeInTheDocument();
  });

  it("uses the static fallback when reduced motion is preferred", async () => {
    mockMotion(true);
    render(React.createElement(CaseFilmStage, { cases }));

    await waitFor(() => {
      expect(screen.getByTestId("animation-fallback")).toBeInTheDocument();
    });
    expect(screen.queryByTitle("Hermes Notebook animated system demo")).not.toBeInTheDocument();
  });
});
