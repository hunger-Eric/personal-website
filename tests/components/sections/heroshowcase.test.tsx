// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "@/components/LocaleProvider";

const heroCopy = vi.hoisted(() => ({
  zh: {
    line: "AI Native 独立开发者",
    description:
      "构建 AI 驱动的系统、工作流与数字产品。从自动化、知识库到 AI 内容创作，让想法快速变成真正可运行的系统。",
    badge: "AI Native 系统构建者",
    primaryCta: "进入案例档案",
    secondaryCta: "查看工作方式",
    rhythmTitle: "工作节奏",
    labSignals: [
      { label: "方向", value: "AI Native Lab" },
      { label: "方法", value: "工作流优先" },
      { label: "输出", value: "可运行系统" },
    ],
    capabilities: [
      {
        title: "AI 工作流工程",
        description: "多模型协同、AI 辅助开发、原型迭代流程。",
        icon: "gitBranch",
      },
      {
        title: "自动化系统",
        description: "Docker、n8n、API、影刀与长期可维护自动化。",
        icon: "workflow",
      },
      {
        title: "知识库与 RAG 系统",
        description: "本地知识库、多源检索、业务资料和内容资产接入。",
        icon: "brainCircuit",
      },
      {
        title: "AI 辅助内容生产",
        description: "AI 内容创作、视觉表达、素材整理和数字叙事。",
        icon: "blocks",
      },
    ],
  },
  en: {
    line: "AI Native Independent Developer",
    description:
      "I build AI-powered systems, workflows, and digital products, from automation pipelines and knowledge systems to AI-assisted creative experiences.",
    badge: "AI Native Lab",
    primaryCta: "Open case archive",
    secondaryCta: "View working method",
    rhythmTitle: "Work Rhythm",
    labSignals: [
      { label: "Mode", value: "AI Native Lab" },
      { label: "Method", value: "workflow first" },
      { label: "Output", value: "runnable systems" },
    ],
    capabilities: [
      {
        title: "AI Workflow Engineering",
        description:
          "multi-model collaboration, AI-assisted development, prototyping loops",
        icon: "gitBranch",
      },
      {
        title: "Automation Systems",
        description: "Docker, n8n, APIs, Yingdao, and maintainable automation",
        icon: "workflow",
      },
      {
        title: "Knowledge & RAG Systems",
        description:
          "local knowledge bases, retrieval, business context, content assets",
        icon: "brainCircuit",
      },
      {
        title: "Creative Production",
        description:
          "AI content production, visual thinking, asset systems, narrative design",
        icon: "blocks",
      },
    ],
  },
}));

vi.mock("next/link", () => ({
  default: (props: React.ComponentProps<"a">) =>
    React.createElement("a", props),
}));

vi.mock("lucide-react", () => {
  const Icon = ({ "data-testid": testId }: { "data-testid": string }) =>
    React.createElement("svg", { "data-testid": testId });

  return {
    ArrowRight: () => React.createElement(Icon, { "data-testid": "icon-arrow-right" }),
    Blocks: () => React.createElement(Icon, { "data-testid": "icon-blocks" }),
    Bot: () => React.createElement(Icon, { "data-testid": "icon-bot" }),
    BrainCircuit: () =>
      React.createElement(Icon, { "data-testid": "icon-brain-circuit" }),
    FileText: () => React.createElement(Icon, { "data-testid": "icon-file-text" }),
    GitBranch: () => React.createElement(Icon, { "data-testid": "icon-git-branch" }),
    Workflow: () => React.createElement(Icon, { "data-testid": "icon-workflow" }),
  };
});

vi.mock("@/components/ContributionGraphCard", () => ({
  ContributionGraphCard: ({ title }: { title: string }) =>
    React.createElement("div", { "data-testid": "contribution-graph" }, title),
}));

vi.mock("@/components/LocaleProvider", () => {
  type Locale = "zh" | "en";
  const LocaleContext = React.createContext<{
    locale: Locale;
    setLocale: () => void;
    t: Record<string, unknown>;
    toggleLocale: () => void;
  }>({
    locale: "zh",
    setLocale: () => {},
    t: {},
    toggleLocale: () => {},
  });

  return {
    LocaleProvider: ({
      children,
      initialLocale = "zh",
    }: {
      children: React.ReactNode;
      initialLocale?: Locale;
    }) =>
      React.createElement(
        LocaleContext.Provider,
        {
          value: {
            locale: initialLocale,
            setLocale: () => {},
            t: {},
            toggleLocale: () => {},
          },
        },
        children
      ),
    LocaleScript: () => null,
    useLocale: () => React.useContext(LocaleContext),
  };
});

vi.mock("@/config/contentCopy", () => ({
  getSiteCopy: (locale: "zh" | "en") => ({
    hero: heroCopy[locale],
  }),
}));

function renderWithLocale(ui: React.ReactElement, locale: "zh" | "en" = "zh") {
  return render(
    React.createElement(LocaleProvider, { children: ui, initialLocale: locale })
  );
}

describe("HeroShowcaseSection", () => {
  it("renders the zh hero archive copy from contentCopy", async () => {
    const { HeroShowcaseSection } = await import(
      "@/components/sections/HeroShowcaseSection"
    );

    renderWithLocale(React.createElement(HeroShowcaseSection));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      heroCopy.zh.line
    );
    expect(screen.getByText(heroCopy.zh.badge)).toBeTruthy();
    expect(screen.getByText(heroCopy.zh.description)).toBeTruthy();
    expect(screen.getByText(heroCopy.zh.rhythmTitle)).toBeTruthy();
  });

  it("renders primary and secondary actions through system buttons", async () => {
    const { HeroShowcaseSection } = await import(
      "@/components/sections/HeroShowcaseSection"
    );

    const { container } = renderWithLocale(
      React.createElement(HeroShowcaseSection)
    );

    expect(container.querySelector('a[href="/projects"]')).toHaveTextContent(
      heroCopy.zh.primaryCta
    );
    expect(container.querySelector('a[href="/#about"]')).toHaveTextContent(
      heroCopy.zh.secondaryCta
    );
    expect(container.querySelector('[data-testid="icon-file-text"]')).toBeTruthy();
    expect(
      container.querySelector('[data-testid="icon-arrow-right"]')
    ).toBeTruthy();
  });

  it("renders lab signals and capability records from copy arrays", async () => {
    const { HeroShowcaseSection } = await import(
      "@/components/sections/HeroShowcaseSection"
    );

    renderWithLocale(React.createElement(HeroShowcaseSection));

    for (const signal of heroCopy.zh.labSignals) {
      expect(screen.getByText(signal.label)).toBeTruthy();
      expect(screen.getByText(signal.value)).toBeTruthy();
    }

    for (const capability of heroCopy.zh.capabilities) {
      expect(screen.getByText(capability.title)).toBeTruthy();
      expect(screen.getByText(capability.description)).toBeTruthy();
    }
  });

  it("renders all capability icons", async () => {
    const { HeroShowcaseSection } = await import(
      "@/components/sections/HeroShowcaseSection"
    );

    const { container } = renderWithLocale(
      React.createElement(HeroShowcaseSection)
    );

    expect(container.querySelector('[data-testid="icon-git-branch"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="icon-workflow"]')).toBeTruthy();
    expect(
      container.querySelector('[data-testid="icon-brain-circuit"]')
    ).toBeTruthy();
    expect(container.querySelector('[data-testid="icon-blocks"]')).toBeTruthy();
  });

  it("renders English hero content from the same copy contract", async () => {
    const { HeroShowcaseSection } = await import(
      "@/components/sections/HeroShowcaseSection"
    );

    renderWithLocale(React.createElement(HeroShowcaseSection), "en");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      heroCopy.en.line
    );
    expect(screen.getAllByText(heroCopy.en.badge).length).toBeGreaterThan(0);
    expect(screen.getByText(heroCopy.en.primaryCta)).toBeTruthy();
    expect(screen.getByText(heroCopy.en.secondaryCta)).toBeTruthy();
    expect(screen.getByText(heroCopy.en.rhythmTitle)).toBeTruthy();
    expect(screen.getByText("workflow first")).toBeTruthy();
    expect(screen.getByText("AI Workflow Engineering")).toBeTruthy();
  });
});
