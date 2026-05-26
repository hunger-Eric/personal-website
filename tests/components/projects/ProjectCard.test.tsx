// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));

vi.mock("lucide-react", () => ({
  Folder: () => React.createElement("svg", { "data-testid": "folder-icon" }),
  Star: () => React.createElement("svg", { "data-testid": "star-icon" }),
  GitFork: () => React.createElement("svg", { "data-testid": "fork-icon" }),
  Download: () => React.createElement("svg", { "data-testid": "download-icon" }),
}));

vi.mock("@/components/FilledIcons", () => ({
  FilledGithub: (p: any) => React.createElement("svg", { "data-testid": "filled-github" }),
  FilledGlobe: (p: any) => React.createElement("svg", { "data-testid": "filled-globe" }),
  FilledFileText: (p: any) => React.createElement("svg", { "data-testid": "filled-filetext" }),
  FilledDownload: (p: any) => React.createElement("svg", { "data-testid": "filled-download" }),
  FilledPlay: (p: any) => React.createElement("svg", { "data-testid": "filled-play" }),
  FilledArrowUpRight: (p: any) => React.createElement("svg", { "data-testid": "filled-arrow" }),
}));

function makeProject(overrides: Record<string, any> = {}): any {
  return {
    id: "test",
    name: "Test Project",
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ProjectCard", () => {
  // ── Branch: imageUrl + hideImage ──────────────────────────────────────────

  it("renders image when imageUrl is set and hideImage is false", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject({ imageUrl: "/test.jpg" }),
    }));
    expect(container.querySelector("img")).toBeInTheDocument();
  });

  it("renders gradient placeholder when imageUrl is not set", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject(),
    }));
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("hides image when hideImage is true", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject({ imageUrl: "/test.jpg" }),
      hideImage: true,
    }));
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  // ── Branch: featured badge ────────────────────────────────────────────────

  it("renders Featured badge when project.featured is true", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    render(React.createElement(ProjectCard, {
      project: makeProject({ featured: true }),
    }));
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("does not render Featured badge when not featured", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    render(React.createElement(ProjectCard, {
      project: makeProject({ featured: false }),
    }));
    expect(screen.queryByText("Featured")).not.toBeInTheDocument();
  });

  // ── Branch: getProjectBlurb ───────────────────────────────────────────────

  it("uses description[0] when available", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    render(React.createElement(ProjectCard, {
      project: makeProject({ description: ["From description"], summary: "From summary" }),
    }));
    expect(screen.getByText("From description")).toBeInTheDocument();
  });

  it("falls back to summary when no description", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    render(React.createElement(ProjectCard, {
      project: makeProject({ summary: "Only summary" }),
    }));
    expect(screen.getByText("Only summary")).toBeInTheDocument();
  });

  it("falls back to default blurb when neither description nor summary", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    render(React.createElement(ProjectCard, {
      project: makeProject({ description: [], summary: "" }),
    }));
    expect(screen.getByText("A featured project built to solve a real problem.")).toBeInTheDocument();
  });

  // ── Branch: stats ─────────────────────────────────────────────────────────

  it("renders stars when githubStars is set", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject({ githubStars: 100 }),
    }));
    expect(container.querySelector('[data-testid="star-icon"]')).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders forks when githubForks is set", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject({ githubForks: 50 }),
    }));
    expect(container.querySelector('[data-testid="fork-icon"]')).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("renders downloads when downloads is set", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject({ downloads: 1000 }),
    }));
    expect(container.querySelector('[data-testid="download-icon"]')).toBeInTheDocument();
    expect(screen.getByText("1,000")).toBeInTheDocument();
  });

  it("does not render stats when none are set", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject(),
    }));
    expect(container.querySelector('[data-testid="star-icon"]')).not.toBeInTheDocument();
  });

  // ── Branch: technologies ──────────────────────────────────────────────────

  it("renders technologies when available", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    render(React.createElement(ProjectCard, {
      project: makeProject({ technologies: ["React", "TypeScript", "Node"] }),
    }));
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Node")).toBeInTheDocument();
  });

  it("does not render technologies section when empty", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    render(React.createElement(ProjectCard, {
      project: makeProject({ technologies: [] }),
    }));
    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });

  // ── Branch: links ─────────────────────────────────────────────────────────

  it("renders link buttons when links are available", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    render(React.createElement(ProjectCard, {
      project: makeProject({
        links: [{ label: "GitHub", href: "https://github.com", type: "github" }],
      }),
    }));
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("does not render links section when empty", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    render(React.createElement(ProjectCard, {
      project: makeProject({ links: [] }),
    }));
    expect(screen.queryByText("GitHub")).not.toBeInTheDocument();
  });

  // ── Branch: IconWrapper link types ────────────────────────────────────────

  it("renders correct icon for github link type", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject({
        links: [{ label: "GH", href: "#", type: "github" }],
      }),
    }));
    expect(container.querySelector('[data-testid="filled-github"]')).toBeInTheDocument();
  });

  it("renders correct icon for live link type", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject({
        links: [{ label: "Live", href: "#", type: "live" }],
      }),
    }));
    expect(container.querySelector('[data-testid="filled-globe"]')).toBeInTheDocument();
  });

  it("renders correct icon for docs link type", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject({
        links: [{ label: "Docs", href: "#", type: "docs" }],
      }),
    }));
    expect(container.querySelector('[data-testid="filled-filetext"]')).toBeInTheDocument();
  });

  it("renders correct icon for download link type", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject({
        links: [{ label: "DL", href: "#", type: "download" }],
      }),
    }));
    expect(container.querySelector('[data-testid="filled-download"]')).toBeInTheDocument();
  });

  it("renders correct icon for play link type", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject({
        links: [{ label: "Play", href: "#", type: "play" }],
      }),
    }));
    expect(container.querySelector('[data-testid="filled-play"]')).toBeInTheDocument();
  });

  it("renders default arrow icon for unknown link type", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject({
        links: [{ label: "Other", href: "#", type: "unknown" }],
      }),
    }));
    expect(container.querySelector('[data-testid="filled-arrow"]')).toBeInTheDocument();
  });

  // ── Branch: iconFor prop ──────────────────────────────────────────────────

  it("uses iconFor when provided instead of default icon mapping", async () => {
    const customIcon = () => React.createElement("span", { "data-testid": "custom-icon" }, "🔗");
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const { container } = render(React.createElement(ProjectCard, {
      project: makeProject({
        links: [{ label: "Custom", href: "#", type: "github" }],
      }),
      iconFor: customIcon,
    }));
    expect(container.querySelector('[data-testid="custom-icon"]')).toBeInTheDocument();
  });

  // ── Branch: links limit to 3 ──────────────────────────────────────────────

  it("limits links to 3", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const links = Array.from({ length: 5 }, (_, i) => ({
      label: `Link ${i}`,
      href: `#${i}`,
      type: "github",
    }));
    render(React.createElement(ProjectCard, {
      project: makeProject({ links }),
    }));
    expect(screen.getByText("Link 0")).toBeInTheDocument();
    expect(screen.queryByText("Link 4")).not.toBeInTheDocument();
  });

  // ── Branch: name rendering ────────────────────────────────────────────────

  it("renders project name", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    render(React.createElement(ProjectCard, {
      project: makeProject({ name: "My Awesome Project" }),
    }));
    expect(screen.getByText("My Awesome Project")).toBeInTheDocument();
  });

  it("renders technologies limited to 8", async () => {
    const { ProjectCard } = await import("@/components/projects/ProjectCard");
    const techs = Array.from({ length: 12 }, (_, i) => `Tech ${i}`);
    render(React.createElement(ProjectCard, {
      project: makeProject({ technologies: techs }),
    }));
    expect(screen.getByText("Tech 0")).toBeInTheDocument();
    expect(screen.queryByText("Tech 8")).not.toBeInTheDocument();
  });
});
