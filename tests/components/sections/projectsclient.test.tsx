// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));

vi.mock("next/link", () => ({
  default: (p: any) => React.createElement("a", p),
}));

vi.mock("lucide-react", () => ({
  ArrowRight: () => React.createElement("svg", { "data-testid": "icon-arrow-right" }),
  Folder: () => React.createElement("svg", { "data-testid": "icon-folder" }),
  Star: () => React.createElement("svg", { "data-testid": "icon-star" }),
  GitFork: () => React.createElement("svg", { "data-testid": "icon-fork" }),
  Download: () => React.createElement("svg", { "data-testid": "icon-download" }),
  ChevronLeft: () => React.createElement("svg", { "data-testid": "icon-chevron-left" }),
  ChevronRight: () => React.createElement("svg", { "data-testid": "icon-chevron-right" }),
}));

vi.mock("@/components/FilledIcons", () => ({
  FilledGithub: (p: any) => React.createElement("svg", { "data-testid": "filled-github", className: p.className }),
  FilledGlobe: (p: any) => React.createElement("svg", { "data-testid": "filled-globe", className: p.className }),
  FilledFileText: (p: any) => React.createElement("svg", { "data-testid": "filled-filetext", className: p.className }),
  FilledDownload: (p: any) => React.createElement("svg", { "data-testid": "filled-download", className: p.className }),
  FilledPlay: (p: any) => React.createElement("svg", { "data-testid": "filled-play", className: p.className }),
  FilledArrowUpRight: (p: any) => React.createElement("svg", { "data-testid": "filled-arrow", className: p.className }),
}));

// Mock the ProjectCard and FeaturedProjectsCarousel to avoid deep complexity
vi.mock("@/components/projects/ProjectCard", () => ({
  ProjectCard: (p: any) =>
    React.createElement("div", {
      "data-testid": "project-card",
      "data-project": p.project.id,
      "data-hideimage": String(!!p.hideImage),
    }, p.project.name),
}));

vi.mock("@/components/projects/FeaturedProjectsTicker", () => ({
  FeaturedProjectsCarousel: (p: any) =>
    React.createElement("div", {
      "data-testid": "featured-carousel",
      "data-count": p.projects.length,
    }, "Carousel"),
  FeaturedProjectsTicker: (p: any) =>
    React.createElement("div", {
      "data-testid": "featured-ticker",
      "data-count": p.projects.length,
    }, "Ticker"),
}));

// ── Test Data ──────────────────────────────────────────────────────────────

const baseProjects = [
  { id: "p1", name: "Project Alpha", summary: "First project", featured: true },
  { id: "p2", name: "Project Beta", summary: "Second project", featured: false },
  { id: "p3", name: "Project Gamma", summary: "Third project", featured: true },
  { id: "p4", name: "Project Delta", summary: "Fourth project", featured: false },
  { id: "p5", name: "Project Epsilon", summary: "Fifth project", featured: false },
  { id: "p6", name: "Project Zeta", summary: "Sixth project", featured: true },
  { id: "p7", name: "Project Eta", summary: "Seventh project" },
];

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ProjectsSectionClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("renders nothing when projects array is empty", async () => {
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    const { container } = render(
      React.createElement(ProjectsSectionClient, { projects: [] })
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders section heading", async () => {
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    render(
      React.createElement(ProjectsSectionClient, { projects: [baseProjects[0]] })
    );
    expect(screen.getByText("~/Projects")).toBeTruthy();
  });

  it("renders 'View all Projects' link", async () => {
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    const { container } = render(
      React.createElement(ProjectsSectionClient, { projects: [baseProjects[0]] })
    );
    const viewAll = container.querySelector('a[href="https://github.com/KevinTrinhDev"]');
    expect(viewAll).toBeTruthy();
    expect(viewAll?.textContent).toContain("View all Projects");
  });

  it("renders featured carousel on desktop when featured projects exist", async () => {
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    const { container } = render(
      React.createElement(ProjectsSectionClient, { projects: baseProjects })
    );
    // Featured carousel (desktop, hidden md:block)
    const carousels = container.querySelectorAll('[data-testid="featured-carousel"]');
    expect(carousels.length).toBe(1);
    expect(carousels[0].getAttribute("data-count")).toBe("3"); // 3 featured projects
  });

  it("does not render carousel when no projects", async () => {
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    const { container } = render(
      React.createElement(ProjectsSectionClient, { projects: [] })
    );
    expect(container.innerHTML).toBe("");
  });

  it("falls back to first 8 projects for carousel when none are featured", async () => {
    const nonFeatured = baseProjects.map((p) => ({ ...p, featured: false }));
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    const { container } = render(
      React.createElement(ProjectsSectionClient, { projects: nonFeatured })
    );
    const carousels = container.querySelectorAll('[data-testid="featured-carousel"]');
    expect(carousels.length).toBe(1);
    expect(carousels[0].getAttribute("data-count")).toBe("7"); // all 7 (capped at 8)
  });

  it("renders mobile project cards (up to 6)", async () => {
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    const { container } = render(
      React.createElement(ProjectsSectionClient, { projects: baseProjects })
    );
    // Mobile cards - 6 shown
    const mobileCards = container.querySelectorAll('[data-testid="project-card"]');
    // Note: mobile cards + desktop cards both render ProjectCard
    // The mobile grid shows first 6, desktop shows first 3 with hideImage
    expect(mobileCards.length).toBe(9); // 6 mobile + 3 desktop
  });

  it("renders desktop compact grid (3 cards with hideImage)", async () => {
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    const { container } = render(
      React.createElement(ProjectsSectionClient, { projects: baseProjects })
    );
    // All project cards
    const allCards = container.querySelectorAll('[data-testid="project-card"]');
    expect(allCards.length).toBe(9); // 6 mobile + 3 desktop (visibleProjects === 3)
  });

  it("handles fewer than 3 projects for visible projects", async () => {
    const two = baseProjects.slice(0, 2);
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    const { container } = render(
      React.createElement(ProjectsSectionClient, { projects: two })
    );
    const cards = container.querySelectorAll('[data-testid="project-card"]');
    expect(cards.length).toBe(4); // 2 mobile + 2 desktop
  });

  it("handles fewer than 6 projects for mobile", async () => {
    const five = baseProjects.slice(0, 5);
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    const { container } = render(
      React.createElement(ProjectsSectionClient, { projects: five })
    );
    const cards = container.querySelectorAll('[data-testid="project-card"]');
    expect(cards.length).toBe(8); // 5 mobile + 3 desktop (visibleProjects = min(3, 5))
  });

  it("carousel caps at 8 featured projects", async () => {
    const manyFeatured = Array.from({ length: 12 }, (_, i) => ({
      id: `p${i}`,
      name: `Project ${i}`,
      summary: `Project ${i}`,
      featured: true,
    }));
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    const { container } = render(
      React.createElement(ProjectsSectionClient, { projects: manyFeatured })
    );
    const carousels = container.querySelectorAll('[data-testid="featured-carousel"]');
    expect(carousels[0].getAttribute("data-count")).toBe("8");
  });

  it("renders ProjectCard with hideImage=true for desktop grid", async () => {
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    const { container } = render(
      React.createElement(ProjectsSectionClient, { projects: baseProjects })
    );
    const cards = container.querySelectorAll('[data-testid="project-card"]');
    // First 6 have hideImage=false (mobile), last 3 have hideImage=true (desktop)
    const mobileCards = Array.from(cards).slice(0, 6);
    const desktopCards = Array.from(cards).slice(6, 9);
    mobileCards.forEach((c) => expect(c.getAttribute("data-hideimage")).toBe("false"));
    desktopCards.forEach((c) => expect(c.getAttribute("data-hideimage")).toBe("true"));
  });

  it("renders ArrowRight icon on View all button", async () => {
    const mod = await import("@/components/sections/ProjectsClient");
    const { ProjectsSectionClient } = mod;
    const { container } = render(
      React.createElement(ProjectsSectionClient, { projects: [baseProjects[0]] })
    );
    expect(container.querySelector('[data-testid="icon-arrow-right"]')).toBeTruthy();
  });
});
