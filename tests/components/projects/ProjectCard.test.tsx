// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({
  Folder: () => React.createElement("svg"),
  Star: () => React.createElement("svg"),
  GitFork: () => React.createElement("svg"),
  Download: () => React.createElement("svg"),
}));

describe("ProjectCard", () => {
  it("renders with basic project", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const project = {
      id: "test-proj",
      name: "Test Project",
      summary: "A test project",
      start: "2025-01",
      end: "2025-03",
      technologies: ["React", "TypeScript"],
      links: [{ label: "GitHub", href: "https://github.com/test/test", type: "github" }],
    };
    const { container } = render(React.createElement(ProjectCard, {
      project,
      iconFor: () => React.createElement("svg"),
    }));
    expect(container).toBeTruthy();
  });

  it("renders with stats", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const project = {
      id: "stats-proj",
      name: "Stats Project",
      summary: "Has stats",
      start: "2025-01",
      end: "2025-03",
      githubStars: 42,
      githubForks: 10,
      downloads: 100,
    };
    const { container } = render(React.createElement(ProjectCard, {
      project,
      iconFor: () => React.createElement("svg"),
    }));
    expect(container).toBeTruthy();
  });
});
