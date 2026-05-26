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

// LocaleProvider mock that supports locale prop for testing
vi.mock("@/components/LocaleProvider", () => {
  type Locale = "zh" | "en";
  const LocaleContext = React.createContext<{ locale: Locale; t: {}; setLocale: () => void; toggleLocale: () => void }>({ locale: "zh", t: {}, setLocale: () => {}, toggleLocale: () => {} });
  return {
    LocaleProvider: ({ children, locale }: { children: React.ReactNode; locale?: Locale }) => {
      const value = { locale: locale || "zh", t: {}, setLocale: () => {}, toggleLocale: () => {} };
      return React.createElement(LocaleContext.Provider, { value }, children);
    },
    useLocale: () => React.useContext(LocaleContext),
    LocaleScript: () => null,
  };
});
vi.mock("@/config/locale", () => ({ LOCALE_STORAGE_KEY: "devfoliox-locale", getTranslations: () => ({}) }));

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
    articles: {
      heading: locale === "zh" ? "文章" : "Articles",
      description: locale === "zh" ? "test" : "test",
      viewAll: locale === "zh" ? "查看全部文章" : "View all articles",
      emptyTitle: locale === "zh" ? "还没有文章" : "No articles yet",
      emptyDescription: locale === "zh" ? "发布后会显示在这里。" : "New posts will show up here after publishing.",
      categoryFallback: locale === "zh" ? "未分类" : "Uncategorized",
      articlesCountSuffix: locale === "zh" ? "篇" : "posts",
      readTimeSuffix: locale === "zh" ? "阅读" : "read",
    },
  }),
}));

// ── Helper ─────────────────────────────────────────────────────────────────

function renderWithLocale(ui: React.ReactElement, locale: "zh" | "en" = "zh") {
  return render(
    React.createElement(LocaleProvider, { locale }, ui)
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

  it("renders lab signals (方向，方法，输出)", async () => {
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

  // ── English locale branch tests ──────────────────────────────────────

  it("renders English badge text", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    const { container } = renderWithLocale(React.createElement(HeroShowcaseSection), "en");
    // Badge appears in the inline-flex container with Bot icon
    const badge = container.querySelector('.inline-flex:has([data-testid="icon-bot"])');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toMatch(/AI Native Lab/i);
  });

  it("renders English CTA for case archive", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    renderWithLocale(React.createElement(HeroShowcaseSection), "en");
    expect(screen.getByText(/Open case archive/i)).toBeTruthy();
  });

  it("renders English CTA for working method", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    renderWithLocale(React.createElement(HeroShowcaseSection), "en");
    expect(screen.getByText(/View working method/i)).toBeTruthy();
  });

  it("renders English lab signals", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    renderWithLocale(React.createElement(HeroShowcaseSection), "en");
    expect(screen.getByText("Mode")).toBeTruthy();
    // AI Native Lab appears twice (badge + lab signal), so check the grid structure
    const labSignalsGrid = screen.getByText("Mode").closest(".grid");
    expect(labSignalsGrid).toHaveTextContent(/AI Native Lab|workflow first|runnable systems/i);
    expect(screen.getByText("Method")).toBeTruthy();
    expect(screen.getByText("workflow first")).toBeTruthy();
    expect(screen.getByText("Output")).toBeTruthy();
    expect(screen.getByText("runnable systems")).toBeTruthy();
  });

  it("renders English capability titles", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    renderWithLocale(React.createElement(HeroShowcaseSection), "en");
    expect(screen.getByText("AI Workflow Engineering")).toBeTruthy();
    expect(screen.getByText("Automation Systems")).toBeTruthy();
    expect(screen.getByText("Knowledge & RAG Systems")).toBeTruthy();
    expect(screen.getByText("Creative Production")).toBeTruthy();
  });

  it("renders English capability descriptions", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    renderWithLocale(React.createElement(HeroShowcaseSection), "en");
    expect(screen.getByText(/multi-model collaboration/i)).toBeTruthy();
    expect(screen.getByText(/Docker, n8n, APIs/i)).toBeTruthy();
    expect(screen.getByText(/local knowledge bases/i)).toBeTruthy();
    expect(screen.getByText(/AI content production/i)).toBeTruthy();
  });

  it("renders English contribution graph title", async () => {
    const { HeroShowcaseSection } = await import("@/components/sections/HeroShowcaseSection");
    renderWithLocale(React.createElement(HeroShowcaseSection), "en");
    expect(screen.getByText("Work Rhythm")).toBeTruthy();
  });
});
