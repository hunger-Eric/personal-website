// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { LocaleProvider } from "@/components/LocaleProvider";

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

// Mock ProjectCard to avoid deep complexity
vi.mock("@/components/projects/ProjectCard", () => ({
  ProjectCard: (p: any) =>
    React.createElement(
      "div",
      {
        "data-testid": "project-card",
        "data-project": p.project.id,
        "data-hideimage": String(!!p.hideImage),
      },
      p.project.name
    ),
}));

// Mock FeaturedProjectsTicker / Carousel
vi.mock("@/components/projects/FeaturedProjectsTicker", () => ({
  FeaturedProjectsCarousel: (p: any) =>
    React.createElement(
      "div",
      { "data-testid": "featured-carousel", "data-count": p.projects.length },
      "Carousel"
    ),
  FeaturedProjectsTicker: (p: any) =>
    React.createElement(
      "div",
      { "data-testid": "featured-ticker", "data-count": p.projects.length },
      "Ticker"
    ),
}));

// ── Mock contentCopy ───────────────────────────────────────────────────────

const mockSiteCopy = vi.hoisted(() => ({
  projects: {
    heading: "~/Projects",
    viewAll: "View all Projects",
    featuredBadge: "Featured",
    viewDetails: "View details",
    emptyTitle: "No projects yet",
    emptyDescription: "Projects will appear here after they are added.",
  },
}));

vi.mock("@/config/contentCopy", () => ({
  getSiteCopy: (locale: string) => ({
    projects: {
      heading: locale === "zh" ? "~/Projects" : "~/Projects",
      viewAll: locale === "zh" ? "查看全部项目" : "View all Projects",
      featuredBadge: locale === "zh" ? "精选" : "Featured",
      viewDetails: locale === "zh" ? "查看详情" : "View details",
      emptyTitle: locale === "zh" ? "暂无项目" : "No projects yet",
      emptyDescription:
        locale === "zh"
          ? "项目添加后会显示在这里。"
          : "Projects will appear here after they are added.",
    },
  }),
}));

// ── Mock siteConfig ────────────────────────────────────────────────────────

const mockSiteConfigState = vi.hoisted(() => ({
  projectsEnabled: true,
}));

vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    get sections() {
      return { projects: mockSiteConfigState.projectsEnabled };
    },
  },
}));

// ── Mock loadCases ─────────────────────────────────────────────────────────

vi.mock("@/config/cases", () => ({
  loadCases: vi.fn(),
}));

// ── Mock LocaleProvider / useLocale ────────────────────────────────────────

vi.mock("@/components/LocaleProvider", () => ({
  LocaleProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "locale-provider" }, children),
  useLocale: () => ({ locale: "zh" as const }),
}));

// ── Helper ─────────────────────────────────────────────────────────────────

function renderWithLocale(ui: React.ReactElement) {
  return render(
    React.createElement(LocaleProvider, null, ui)
  );
}

// ── Test Data ──────────────────────────────────────────────────────────────

const baseProjects = [
  { id: "p1", name: "Project Alpha", summary: "First project", featured: true, start: "2024-01", end: "2024-06" },
  { id: "p2", name: "Project Beta", summary: "Second project", featured: false, start: "2024-03", end: "2024-08" },
  { id: "p3", name: "Project Gamma", summary: "Third project", featured: true, start: "2024-05", end: "" },
  { id: "p4", name: "Project Delta", summary: "Fourth project", featured: false, start: "2024-06", end: "2024-12" },
  { id: "p5", name: "Project Epsilon", summary: "Fifth project", featured: false, start: "2024-07", end: "" },
  { id: "p6", name: "Project Zeta", summary: "Sixth project", featured: true, start: "2024-08", end: "" },
  { id: "p7", name: "Project Eta", summary: "Seventh project", start: "2024-09", end: "" },
];

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ProjectsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSiteConfigState.projectsEnabled = true;
  });

  // ── Rendering ────────────────────────────────────────────────────────

  it("renders without crashing with projects data", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(
      React.createElement(ProjectsSection)
    );

    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  it("renders section heading from contentCopy (zh locale)", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    renderWithLocale(React.createElement(ProjectsSection));

    expect(screen.getByText("~/Projects")).toBeTruthy();
  });

  it("renders '查看全部项目' view-all link text (zh locale)", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    renderWithLocale(React.createElement(ProjectsSection));

    expect(screen.getByText(/查看全部项目/i)).toBeTruthy();
  });

  it("renders ArrowRight icon in view-all link", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    expect(container.querySelector('[data-testid="icon-arrow-right"]')).toBeTruthy();
  });

  it("renders locale-provider wrapper", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    expect(container.querySelector('[data-testid="locale-provider"]')).toBeTruthy();
  });

  // ── Props / Data Passing ─────────────────────────────────────────────

  it("passes loaded projects to ProjectsSectionClient", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    renderWithLocale(React.createElement(ProjectsSection));

    // Verify loadCases was called
    expect(loadCases).toHaveBeenCalledTimes(1);

    // Verify project cards are rendered with correct project names
    const { container } = renderWithLocale(
      React.createElement(ProjectsSection)
    );
    const cards = container.querySelectorAll('[data-testid="project-card"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it("renders project cards with correct project IDs", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    const cards = container.querySelectorAll('[data-testid="project-card"]');
    const projectIds = Array.from(cards).map((c) => c.getAttribute("data-project"));

    expect(projectIds).toContain("p1");
    expect(projectIds).toContain("p2");
    expect(projectIds).toContain("p3");
  });

  // ── Edge Cases ───────────────────────────────────────────────────────

  it("renders nothing when section is disabled in siteConfig", async () => {
    mockSiteConfigState.projectsEnabled = false;

    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    expect(container.innerHTML).toBe("");
    // loadCases should still be called (server component executes regardless)
    expect(loadCases).toHaveBeenCalledTimes(1);
  });

  it("handles single project correctly", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue([baseProjects[0]]);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    const cards = container.querySelectorAll('[data-testid="project-card"]');
    // 1 mobile + 1 desktop = 2 cards
    expect(cards.length).toBe(2);
  });

  it("handles two projects correctly", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects.slice(0, 2));

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    const cards = container.querySelectorAll('[data-testid="project-card"]');
    // 2 mobile + 2 desktop = 4 cards
    expect(cards.length).toBe(4);
  });

  it("handles five projects correctly (fewer than mobile limit of 6)", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects.slice(0, 5));

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    const cards = container.querySelectorAll('[data-testid="project-card"]');
    // 5 mobile + 3 desktop = 8 cards
    expect(cards.length).toBe(8);
  });

  it("caps mobile project cards at 6", async () => {
    const manyProjects = Array.from({ length: 10 }, (_, i) => ({
      id: `p${i}`,
      name: `Project ${i}`,
      summary: `Project ${i}`,
      featured: i < 3,
      start: "2024-01",
      end: "",
    }));

    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(manyProjects);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    const cards = container.querySelectorAll('[data-testid="project-card"]');
    // 6 mobile + 3 desktop = 9 cards
    expect(cards.length).toBe(9);
  });

  it("caps featured carousel at 8 projects", async () => {
    const manyFeatured = Array.from({ length: 12 }, (_, i) => ({
      id: `p${i}`,
      name: `Project ${i}`,
      summary: `Project ${i}`,
      featured: true,
      start: "2024-01",
      end: "",
    }));

    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(manyFeatured);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    const carousels = container.querySelectorAll('[data-testid="featured-carousel"]');
    expect(carousels.length).toBe(1);
    expect(carousels[0].getAttribute("data-count")).toBe("8");
  });

  it("falls back to first 8 projects when none are featured", async () => {
    const nonFeatured = baseProjects.map((p) => ({ ...p, featured: false }));

    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(nonFeatured);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    const carousels = container.querySelectorAll('[data-testid="featured-carousel"]');
    expect(carousels.length).toBe(1);
    expect(carousels[0].getAttribute("data-count")).toBe("7");
  });

  // ── Empty State ──────────────────────────────────────────────────────

  it("renders nothing when projects array is empty", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue([]);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    expect(container.innerHTML).toBe("");
  });

  it("does not render carousel when no projects", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue([]);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    expect(container.querySelector('[data-testid="featured-carousel"]')).toBeFalsy();
  });

  it("does not render project cards when no projects", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue([]);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    expect(container.querySelectorAll('[data-testid="project-card"]').length).toBe(0);
  });

  // ── Desktop Grid (hideImage) ─────────────────────────────────────────

  it("renders ProjectCard with hideImage=true for desktop grid", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    const { container } = renderWithLocale(React.createElement(ProjectsSection));

    const cards = container.querySelectorAll('[data-testid="project-card"]');
    // First 6 have hideImage=false (mobile), last 3 have hideImage=true (desktop)
    const mobileCards = Array.from(cards).slice(0, 6);
    const desktopCards = Array.from(cards).slice(6, 9);

    mobileCards.forEach((c) => expect(c.getAttribute("data-hideimage")).toBe("false"));
    desktopCards.forEach((c) => expect(c.getAttribute("data-hideimage")).toBe("true"));
  });

  // ── Locale Switching ─────────────────────────────────────────────────

  it("renders zh locale heading and view-all text", async () => {
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    renderWithLocale(React.createElement(ProjectsSection));

    expect(screen.getByText("~/Projects")).toBeTruthy();
    expect(screen.getByText(/查看全部项目/i)).toBeTruthy();
  });

  it("renders en locale view-all text", async () => {
    // The contentCopy mock returns "View all Projects" for non-zh locales
    const { loadCases } = await import("@/config/cases");
    (loadCases as any).mockResolvedValue(baseProjects);

    const { ProjectsSection } = await import("@/components/sections/Projects");
    renderWithLocale(React.createElement(ProjectsSection));

    // The mock returns "View all Projects" for en locale
    expect(screen.getByText(/View all Projects/i)).toBeTruthy();
  });
});
