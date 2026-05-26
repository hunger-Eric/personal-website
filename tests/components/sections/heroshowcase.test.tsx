// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
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
  Blocks: () => React.createElement("svg", { "data-testid": "icon-blocks" }),
  Bot: () => React.createElement("svg", { "data-testid": "icon-bot" }),
  BrainCircuit: () => React.createElement("svg", { "data-testid": "icon-brain-circuit" }),
  FileText: () => React.createElement("svg", { "data-testid": "icon-file-text" }),
  GitBranch: () => React.createElement("svg", { "data-testid": "icon-git-branch" }),
  Workflow: () => React.createElement("svg", { "data-testid": "icon-workflow" }),
}));

vi.mock("@/components/ContributionGraphCard", () => ({
  ContributionGraphCard: (props: any) =>
    React.createElement("div", { "data-testid": "contribution-graph" }, props.title || "Graph"),
}));

// ── Mock contentCopy ───────────────────────────────────────────────────────

vi.mock("@/config/contentCopy", () => ({
  getSiteCopy: (locale: string) => ({
    hero: {
      line: locale === "zh" ? "AI Native 独立开发者" : "AI Native Independent Developer",
      description:
        locale === "zh"
          ? "构建 AI 驱动的系统、工作流与数字产品。从自动化、知识库到 AI 内容创作，让想法快速变成真正可运行的系统。"
          : "I build AI-powered systems, workflows, and digital products, from automation pipelines and knowledge systems to AI-assisted creative experiences.",
    },
  }),
}));

// ── Helper ─────────────────────────────────────────────────────────────────

function renderWithLocale(ui: React.ReactElement) {
  return render(
    React.createElement(LocaleProvider, null, ui)
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("HeroShowcaseSection", () => {
  it("renders hero heading from contentCopy (zh locale)", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    renderWithLocale(React.createElement(HeroShowcaseSection));
    expect(screen.getByText("AI Native 独立开发者")).toBeTruthy();
  });

  it("renders hero description from contentCopy (zh locale)", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    renderWithLocale(React.createElement(HeroShowcaseSection));
    expect(
      screen.getByText(/构建 AI 驱动的系统、工作流与数字产品/i)
    ).toBeTruthy();
  });

  it("renders AI Native badge", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = renderWithLocale(React.createElement(HeroShowcaseSection));
    const badge = container.querySelector("span");
    expect(badge?.textContent).toBe("AI Native 系统构建者");
  });

  it("renders Bot icon in badge", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = renderWithLocale(React.createElement(HeroShowcaseSection));
    expect(container.querySelector('[data-testid="icon-bot"]')).toBeTruthy();
  });

  it("renders CTA link to /projects", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = renderWithLocale(React.createElement(HeroShowcaseSection));
    const projectsLink = container.querySelector('a[href="/projects"]');
    expect(projectsLink).toBeTruthy();
    expect(projectsLink?.textContent).toContain("进入案例档案");
  });

  it("renders FileText icon in /projects CTA", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = renderWithLocale(React.createElement(HeroShowcaseSection));
    expect(container.querySelector('[data-testid="icon-file-text"]')).toBeTruthy();
  });

  it("renders ArrowRight icon in /projects CTA", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = renderWithLocale(React.createElement(HeroShowcaseSection));
    expect(container.querySelector('[data-testid="icon-arrow-right"]')).toBeTruthy();
  });

  it("renders CTA link to /#about", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = renderWithLocale(React.createElement(HeroShowcaseSection));
    const aboutLink = container.querySelector('a[href="/#about"]');
    expect(aboutLink).toBeTruthy();
    expect(aboutLink?.textContent).toContain("查看工作方式");
  });

  it("renders lab signals (方向, 方法, 输出)", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    renderWithLocale(React.createElement(HeroShowcaseSection));
    expect(screen.getByText("方向")).toBeTruthy();
    expect(screen.getByText("AI Native Lab")).toBeTruthy();
    expect(screen.getByText("方法")).toBeTruthy();
    expect(screen.getByText("工作流优先")).toBeTruthy();
    expect(screen.getByText("输出")).toBeTruthy();
    expect(screen.getByText("可运行系统")).toBeTruthy();
  });

  it("renders capabilities section with 4 items", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    renderWithLocale(React.createElement(HeroShowcaseSection));
    
    // Capability titles
    expect(screen.getByText("AI 工作流工程")).toBeTruthy();
    expect(screen.getByText("自动化系统")).toBeTruthy();
    expect(screen.getByText("知识库与 RAG 系统")).toBeTruthy();
    expect(screen.getByText("AI 辅助内容生产")).toBeTruthy();
  });

  it("renders capability descriptions", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    renderWithLocale(React.createElement(HeroShowcaseSection));
    
    expect(
      screen.getByText(/多模型协同、AI 辅助开发/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/Docker、n8n、API/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/本地知识库、多源检索/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/AI 内容创作、视觉表达/i)
    ).toBeTruthy();
  });

  it("renders capability icons (GitBranch, Workflow, BrainCircuit, Blocks)", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = renderWithLocale(React.createElement(HeroShowcaseSection));
    
    expect(container.querySelector('[data-testid="icon-git-branch"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="icon-workflow"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="icon-brain-circuit"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="icon-blocks"]')).toBeTruthy();
  });

  it("renders contribution graph", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = renderWithLocale(React.createElement(HeroShowcaseSection));
    expect(container.querySelector('[data-testid="contribution-graph"]')).toBeTruthy();
  });

  it("renders contribution graph title (zh)", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    renderWithLocale(React.createElement(HeroShowcaseSection));
    expect(screen.getByText("工作节奏")).toBeTruthy();
  });
});
