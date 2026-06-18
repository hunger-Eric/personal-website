// @vitest-environment jsdom
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React, { type AnchorHTMLAttributes, type ReactNode } from "react";

import { getSiteCopy } from "@/config/contentCopy";
import { ProjectsSectionClient } from "@/components/sections/ProjectsClient";
import type { Project } from "@/components/sections/ProjectsClient";

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
  ProjectCard: ({
    project,
    hideImage,
  }: {
    project: Pick<Project, "id" | "name">;
    hideImage?: boolean;
  }) =>
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
  { id: "zh-1", name: "中文项目一", summary: "First zh project", featured: true },
  { id: "zh-2", name: "中文项目二", summary: "Second zh project", featured: false },
  { id: "zh-3", name: "中文项目三", summary: "Third zh project", featured: true },
  { id: "zh-4", name: "中文项目四", summary: "Fourth zh project", featured: false },
  { id: "zh-5", name: "中文项目五", summary: "Fifth zh project", featured: false },
  { id: "zh-6", name: "中文项目六", summary: "Sixth zh project", featured: true },
  { id: "zh-7", name: "中文项目七", summary: "Seventh zh project" },
];

const projectsEn: Project[] = [
  { id: "en-1", name: "English Project One", summary: "First en project", featured: true },
  { id: "en-2", name: "English Project Two", summary: "Second en project", featured: false },
];

function renderProjects(props?: Partial<{ projectsZh: Project[]; projectsEn: Project[] }>) {
  return render(
    React.createElement(ProjectsSectionClient, {
      projectsZh: props?.projectsZh ?? projectsZh,
      projectsEn: props?.projectsEn ?? projectsEn,
    })
  );
}

describe("ProjectsSectionClient", () => {
  beforeEach(() => {
    localeState.current = "zh";
  });

  it("renders nothing when the active locale has no projects", () => {
    const { container } = renderProjects({ projectsZh: [] });

    expect(container.innerHTML).toBe("");
  });

  it("renders copy-driven archive heading and a site-internal projects action", () => {
    renderProjects();

    const copy = getSiteCopy("zh").projects;
    expect(screen.getByText(copy.heading)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: copy.indexTitle })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: copy.viewAll })).toHaveAttribute("href", "/projects");
  });

  it("selects the project list from the active locale without leaf copy branches", () => {
    localeState.current = "en";
    renderProjects();

    expect(screen.getAllByText("English Project One").length).toBeGreaterThan(0);
    expect(screen.queryByText("中文项目一")).not.toBeInTheDocument();
  });

  it("passes featured projects to the desktop carousel and mobile ticker", () => {
    const { container } = renderProjects();

    expect(container.querySelector('[data-testid="featured-carousel"]')).toHaveAttribute(
      "data-count",
      "3"
    );
    expect(container.querySelector('[data-testid="featured-ticker"]')).toHaveAttribute(
      "data-count",
      "3"
    );
  });

  it("falls back to the first eight projects when none are featured", () => {
    const nonFeatured = Array.from({ length: 10 }, (_, index) => ({
      id: `p-${index}`,
      name: `Project ${index}`,
      featured: false,
    }));

    const { container } = renderProjects({ projectsZh: nonFeatured });

    expect(container.querySelector('[data-testid="featured-carousel"]')).toHaveAttribute(
      "data-count",
      "8"
    );
  });

  it("caps repeated project cards for mobile and desktop layouts", () => {
    const { container } = renderProjects();
    const cards = Array.from(container.querySelectorAll('[data-testid="project-card"]'));
    const mobileCards = cards.filter((card) => card.getAttribute("data-hideimage") === "false");
    const desktopCards = cards.filter((card) => card.getAttribute("data-hideimage") === "true");

    expect(mobileCards).toHaveLength(6);
    expect(desktopCards).toHaveLength(3);
  });

  it("does not reintroduce old template residue in the section shell", () => {
    const { container } = renderProjects();

    expect(container.innerHTML).not.toContain(["bg", "card"].join("-"));
    expect(container.innerHTML).not.toContain("rounded-md");
    expect(container.innerHTML).not.toContain("github.com/hunger-Eric");
  });
});
