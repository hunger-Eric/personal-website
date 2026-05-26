// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));
vi.mock("next/link", () => ({
  default: (p: any) => React.createElement("a", p),
}));

// lucide-react — forward all
vi.mock("lucide-react", async (importOriginal) => {
  const actual: any = await (importOriginal as any)();
  return actual;
});

vi.mock("@/components/FilledIcons", () => ({
  FilledGithub: (p: any) => React.createElement("svg", { "data-testid": "filled-github" }),
  FilledGlobe: (p: any) => React.createElement("svg", { "data-testid": "filled-globe" }),
  FilledFileText: (p: any) => React.createElement("svg", { "data-testid": "filled-filetext" }),
  FilledDownload: (p: any) => React.createElement("svg", { "data-testid": "filled-download" }),
  FilledPlay: (p: any) => React.createElement("svg", { "data-testid": "filled-play" }),
  FilledArrowUpRight: (p: any) => React.createElement("svg", { "data-testid": "filled-arrow" }),
}));

// Mock ProjectCard
vi.mock("@/components/projects/ProjectCard", () => ({
  ProjectCard: (p: any) =>
    React.createElement("div", {
      "data-testid": "project-card",
      "data-project": p.project.id,
      "data-hideimage": String(!!p.hideImage),
    }, p.project.name),
}));

// Mock FeaturedProjectsTicker
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

// Mock contentCopy
const mockSiteCopyZh = {
  hero: { line: "test", description: "test" },
  about: { heading: "test", socialsButton: "test", techIntro: "test", paragraphs: [], afterTechParagraph: "" },
  cases: { heading: "test", viewAll: "test", featuredBadge: "test", viewDetails: "test", emptyTitle: "test", emptyDescription: "test" },
  projects: {
    heading: "~/Projects",
    viewAll: "查看全部项目",
    featuredBadge: "精选",
    viewDetails: "查看详情",
    emptyTitle: "暂无项目",
    emptyDescription: "项目添加后会显示在这里。",
  },
  articles: { heading: "文章", description: "test", viewAll: "test", emptyTitle: "test", emptyDescription: "test", categoryFallback: "未分类", articlesCountSuffix: "篇", readTimeSuffix: "阅读" },
  photography: { heading: "test", description: "test", ongoing: "test", completed: "test", private: "test", photosSuffix: "test", emptyTitle: "test", emptyDescription: "test" },
};

vi.mock("@/config/contentCopy", () => ({
  getSiteCopy: () => mockSiteCopyZh,
}));

vi.mock("@/config/siteConfig", () => ({
  siteConfig: { name: "Test Author" },
}));

// Mock LocaleProvider
vi.mock("@/components/LocaleProvider", () => {
  const LocaleContext = React.createContext({ locale: "zh" as const, t: {}, setLocale: vi.fn(), toggleLocale: vi.fn() });
  return {
    LocaleProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(LocaleContext.Provider, { value: { locale: "zh", t: {}, setLocale: vi.fn(), toggleLocale: vi.fn() } }, children),
    useLocale: () => React.useContext(LocaleContext),
    LocaleScript: () => null,
  };
});
vi.mock("@/config/locale", () => ({ LOCALE_STORAGE_KEY: "devfoliox-locale", getTranslations: () => ({}) }));

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
  it("renders nothing when projects array is empty", async () => {
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    const { container } = render(React.createElement(ProjectsSectionClient, { projects: [] }));
    expect(container.innerHTML).toBe("");
  });

  it("renders section heading", async () => {
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    render(React.createElement(ProjectsSectionClient, { projects: [baseProjects[0]] }));
    expect(screen.getByText("~/Projects")).toBeTruthy();
  });

  it("renders '查看全部项目' link", async () => {
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    const { container } = render(React.createElement(ProjectsSectionClient, { projects: [baseProjects[0]] }));
    const viewAll = container.querySelector('a[href="https://github.com/KevinTrinhDev"]');
    expect(viewAll).toBeTruthy();
    expect(viewAll?.textContent).toContain("查看全部项目");
  });

  it("renders featured carousel when featured projects exist", async () => {
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    const { container } = render(React.createElement(ProjectsSectionClient, { projects: baseProjects }));
    const carousels = container.querySelectorAll('[data-testid="featured-carousel"]');
    expect(carousels.length).toBe(1);
    expect(carousels[0].getAttribute("data-count")).toBe("3");
  });

  it("does not render carousel when no projects", async () => {
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    const { container } = render(React.createElement(ProjectsSectionClient, { projects: [] }));
    expect(container.innerHTML).toBe("");
  });

  it("falls back to first 8 projects for carousel when none are featured", async () => {
    const nonFeatured = baseProjects.map((p) => ({ ...p, featured: false }));
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    const { container } = render(React.createElement(ProjectsSectionClient, { projects: nonFeatured }));
    const carousels = container.querySelectorAll('[data-testid="featured-carousel"]');
    expect(carousels.length).toBe(1);
    expect(carousels[0].getAttribute("data-count")).toBe("7");
  });

  it("renders mobile project cards (up to 6)", async () => {
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    const { container } = render(React.createElement(ProjectsSectionClient, { projects: baseProjects }));
    const cards = container.querySelectorAll('[data-testid="project-card"]');
    expect(cards.length).toBe(9); // 6 mobile + 3 desktop
  });

  it("renders desktop compact grid (3 cards with hideImage)", async () => {
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    const { container } = render(React.createElement(ProjectsSectionClient, { projects: baseProjects }));
    const allCards = container.querySelectorAll('[data-testid="project-card"]');
    expect(allCards.length).toBe(9); // 6 mobile + 3 desktop
  });

  it("handles fewer than 3 projects for visible projects", async () => {
    const two = baseProjects.slice(0, 2);
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    const { container } = render(React.createElement(ProjectsSectionClient, { projects: two }));
    const cards = container.querySelectorAll('[data-testid="project-card"]');
    expect(cards.length).toBe(4); // 2 mobile + 2 desktop
  });

  it("handles fewer than 6 projects for mobile", async () => {
    const five = baseProjects.slice(0, 5);
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    const { container } = render(React.createElement(ProjectsSectionClient, { projects: five }));
    const cards = container.querySelectorAll('[data-testid="project-card"]');
    expect(cards.length).toBe(8); // 5 mobile + 3 desktop
  });

  it("carousel caps at 8 featured projects", async () => {
    const manyFeatured = Array.from({ length: 12 }, (_, i) => ({
      id: `p${i}`, name: `Project ${i}`, summary: `Project ${i}`, featured: true,
    }));
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    const { container } = render(React.createElement(ProjectsSectionClient, { projects: manyFeatured }));
    const carousels = container.querySelectorAll('[data-testid="featured-carousel"]');
    expect(carousels[0].getAttribute("data-count")).toBe("8");
  });

  it("renders ProjectCard with hideImage=true for desktop grid", async () => {
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    const { container } = render(React.createElement(ProjectsSectionClient, { projects: baseProjects }));
    const cards = container.querySelectorAll('[data-testid="project-card"]');
    const mobileCards = Array.from(cards).slice(0, 6);
    const desktopCards = Array.from(cards).slice(6, 9);
    mobileCards.forEach((c) => expect(c.getAttribute("data-hideimage")).toBe("false"));
    desktopCards.forEach((c) => expect(c.getAttribute("data-hideimage")).toBe("true"));
  });

  it("renders ArrowRight icon on View all button", async () => {
    const { ProjectsSectionClient } = await import("@/components/sections/ProjectsClient");
    const { container } = render(React.createElement(ProjectsSectionClient, { projects: [baseProjects[0]] }));
    // lucide-react icons are forwarded, so ArrowRight renders as an actual SVG
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });
});
