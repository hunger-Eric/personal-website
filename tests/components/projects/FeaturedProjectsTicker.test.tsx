// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({
  ChevronLeft: () => React.createElement("svg"),
  ChevronRight: () => React.createElement("svg"),
}));
vi.mock("@/components/FilledIcons", () => ({
  FilledGithub: () => React.createElement("svg"),
  FilledGlobe: () => React.createElement("svg"),
  FilledFileText: () => React.createElement("svg"),
  FilledDownload: () => React.createElement("svg"),
  FilledPlay: () => React.createElement("svg"),
  FilledArrowUpRight: () => React.createElement("svg"),
}));

describe("FeaturedProjectsTicker", () => {
  it("renders nothing when empty", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const { container } = render(React.createElement(FeaturedProjectsTicker, { projects: [] }));
    expect(container.innerHTML).toBe("");
  });

  it("renders with projects", async () => {
    const { FeaturedProjectsTicker } = await import("@/components/projects/FeaturedProjectsTicker");
    const projects = [
      {
        id: "proj-1",
        name: "Project One",
        summary: "First project",
        start: "2025-01",
        end: "2025-03",
        technologies: ["React"],
        links: [{ label: "Live", href: "https://example.com", type: "live" }],
      },
    ];
    const { container } = render(React.createElement(FeaturedProjectsTicker, { projects }));
    expect(container).toBeTruthy();
  });
});
