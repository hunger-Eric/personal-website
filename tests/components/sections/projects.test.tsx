// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React, { type AnchorHTMLAttributes, type ReactNode } from "react";

import { getSiteCopy } from "@/config/contentCopy";
import { ProjectsSectionClient, type Project } from "@/components/sections/ProjectsClient";

const localeState = vi.hoisted(() => ({
  current: "zh" as "zh" | "en",
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({ locale: localeState.current }),
}));

vi.mock("@/components/projects/ProjectCard", () => ({
  ProjectCard: ({ project, hideImage }: { project: Project; hideImage?: boolean }) =>
    React.createElement(
      "article",
      {
        "data-testid": "project-card",
        "data-project": project.id,
        "data-hideimage": String(Boolean(hideImage)),
      },
      project.name
    ),
}));

vi.mock("@/components/projects/FeaturedProjectsTicker", () => ({
  FeaturedProjectsCarousel: ({ projects }: { projects: Project[] }) =>
    React.createElement(
      "div",
      { "data-testid": "featured-carousel", "data-count": projects.length },
      "Carousel"
    ),
  FeaturedProjectsTicker: ({ projects }: { projects: Project[] }) =>
    React.createElement(
      "div",
      { "data-testid": "featured-ticker", "data-count": projects.length },
      "Ticker"
    ),
}));

const projectsZh: Project[] = [
  { id: "hermes", name: "Hermes Notebook", summary: "Knowledge system", featured: true },
  { id: "freight", name: "Freight Lead Agent", summary: "Automation system", featured: true },
  { id: "sdk", name: "Element Asset SDK", summary: "Agent runtime", featured: false },
];

const projectsEn: Project[] = [
  { id: "hermes-en", name: "Hermes Notebook EN", summary: "Knowledge system", featured: true },
];

describe("ProjectsSectionClient integration", () => {
  beforeEach(() => {
    localeState.current = "zh";
  });

  it("renders the system archive copy and current locale project records", () => {
    render(
      React.createElement(ProjectsSectionClient, {
        projectsZh,
        projectsEn,
      })
    );

    const copy = getSiteCopy("zh").projects;
    expect(screen.getByText(copy.heading)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: copy.indexTitle })).toBeInTheDocument();
    expect(screen.getAllByText("Hermes Notebook").length).toBeGreaterThan(0);
  });

  it("uses the English project set when the locale changes", () => {
    localeState.current = "en";

    render(
      React.createElement(ProjectsSectionClient, {
        projectsZh,
        projectsEn,
      })
    );

    expect(screen.getAllByText("Hermes Notebook EN").length).toBeGreaterThan(0);
    expect(screen.queryByText("Freight Lead Agent")).not.toBeInTheDocument();
  });

  it("keeps the view-all action on the AI-readable internal project archive", () => {
    render(
      React.createElement(ProjectsSectionClient, {
        projectsZh,
        projectsEn,
      })
    );

    expect(screen.getByRole("link", { name: getSiteCopy("zh").projects.viewAll })).toHaveAttribute(
      "href",
      "/projects"
    );
  });
});

describe("ProjectsSection server wrapper", () => {
  it("returns a server component promise that loads case data", async () => {
    vi.doMock("@/config/cases", () => ({
      loadCases: vi.fn().mockResolvedValue(projectsZh),
    }));

    const { ProjectsSection } = await import("@/components/sections/Projects");

    await expect(ProjectsSection()).resolves.toBeTruthy();
  });
});
