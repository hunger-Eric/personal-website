// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { LocaleProvider } from "@/components/LocaleProvider";

const aboutCopy = vi.hoisted(() => ({
  zh: {
    heading: "~/关于我",
    socialsButton: "查看全部社交",
    techIntro: "我常设计的系统能力：",
    paragraphs: [
      "我关注的不是 AI 能生成什么，而是如何把 AI 真正组织进长期工作流与产品系统。",
      "我不只是使用 AI 写代码，而是在设计 AI 时代的新型工作方式。",
    ],
    afterTechParagraph:
      "面向个人和小团队，我更关心能不能快速验证想法、减少重复劳动。",
    positioningLabel: "核心定位",
    positioningStatement: "我设计 AI 时代的新型工作方式。",
    buildLabel: "我构建什么",
    directionsLabel: "已有方向",
    viewCasesLabel: "查看案例",
    audience: {
      title: "面向初创团队与小团队",
      lead: "帮助个人与小团队快速构建 AI Native 工作流，以更低成本完成自动化、知识管理与产品原型开发。",
      points: [
        "降低重复劳动",
        "快速验证 idea",
        "把 AI 接进业务",
        "整理混乱流程",
        "沉淀长期系统",
      ],
    },
    capabilities: [
      {
        title: "AI 工作流工程",
        description:
          "使用 Codex、Claude Code 与多模型协同，把 AI Native 开发工作流接进原型、产品迭代和内容整理。",
        icon: "gitBranch",
      },
      {
        title: "自动化系统",
        description:
          "基于 Docker、n8n、API 与自动化流程，搭建长期可维护的业务自动化系统。",
        icon: "workflow",
      },
      {
        title: "知识库与 RAG 系统",
        description:
          "构建本地知识库、RAG 与多源检索系统，让 AI 能真正连接业务资料、文档和内容资产。",
        icon: "brainCircuit",
      },
      {
        title: "AI 辅助创作",
        description:
          "结合 AI 与视觉表达，整理素材、生成内容方案，并把创意流程沉淀成可重复执行的系统。",
        icon: "layers",
      },
    ],
  },
  en: {
    heading: "~/About Me",
    socialsButton: "View all socials",
    techIntro: "Systems I usually design:",
    paragraphs: [
      "I care less about what AI can generate in isolation.",
      "I design new working patterns where models, automation, content, and business processes can cooperate reliably.",
    ],
    afterTechParagraph:
      "For individuals and small teams, the goal is faster idea validation.",
    positioningLabel: "Positioning",
    positioningStatement: "I design new working patterns for the AI era.",
    buildLabel: "What I Build",
    directionsLabel: "Existing directions",
    viewCasesLabel: "View cases",
    audience: {
      title: "For Startups & Small Teams",
      lead: "I help individuals and small teams build AI Native workflows for automation, knowledge management, and product prototyping at lower cost.",
      points: [
        "reduce repetitive work",
        "validate ideas faster",
        "connect AI to operations",
        "organize messy workflows",
        "build long-term systems",
      ],
    },
    capabilities: [
      {
        title: "AI Workflow Engineering",
        description:
          "I connect Codex, Claude Code, and multi-model workflows to prototyping, product iteration, and content operations.",
        icon: "gitBranch",
      },
      {
        title: "Automation Systems",
        description:
          "I build maintainable automation systems with Docker, n8n, APIs, and operational workflows.",
        icon: "workflow",
      },
      {
        title: "Knowledge & RAG Systems",
        description:
          "I design local knowledge bases, RAG flows, and multi-source retrieval so AI can work with real business context.",
        icon: "brainCircuit",
      },
      {
        title: "AI-assisted Creative Production",
        description:
          "I connect AI with visual thinking, content structure, and reusable creative production workflows.",
        icon: "layers",
      },
    ],
  },
}));

const aboutCards = vi.hoisted(() => [
  {
    title: "AI 自动化工作流系统",
    description: "基于 n8n 与 Docker 的端到端自动化流程。",
  },
  {
    title: "本地知识库 RAG 系统",
    description: "多源文档检索与知识问答。",
  },
  {
    title: "AI 辅助内容创作平台",
    description: "沉淀可重复执行的创意生产流程。",
  },
]);

const mockSiteConfigState = vi.hoisted(() => ({
  aboutEnabled: true,
}));

vi.mock("next/link", () => ({
  default: (props: React.ComponentProps<"a">) =>
    React.createElement("a", props),
}));

vi.mock("lucide-react", () => {
  const Icon = ({ "data-testid": testId }: { "data-testid": string }) =>
    React.createElement("svg", { "data-testid": testId });

  return {
    ArrowUpRight: () =>
      React.createElement(Icon, { "data-testid": "icon-arrow-up-right" }),
    Bot: () => React.createElement(Icon, { "data-testid": "icon-bot" }),
    BrainCircuit: () =>
      React.createElement(Icon, { "data-testid": "icon-brain-circuit" }),
    GitBranch: () =>
      React.createElement(Icon, { "data-testid": "icon-git-branch" }),
    Layers3: () => React.createElement(Icon, { "data-testid": "icon-layers" }),
    Link2: () => React.createElement(Icon, { "data-testid": "icon-link2" }),
    Network: () => React.createElement(Icon, { "data-testid": "icon-network" }),
    Workflow: () =>
      React.createElement(Icon, { "data-testid": "icon-workflow" }),
  };
});

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
      locale = "zh",
    }: {
      children: React.ReactNode;
      locale?: Locale;
    }) =>
      React.createElement(
        LocaleContext.Provider,
        {
          value: {
            locale,
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
    about: aboutCopy[locale],
  }),
}));

vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    get sections() {
      return { about: mockSiteConfigState.aboutEnabled };
    },
  },
}));

vi.mock("@/config/aboutConfig", () => ({
  getAboutConfig: () => ({
    snapshot: {
      cards: aboutCards,
    },
  }),
}));

function renderWithLocale(ui: React.ReactElement, locale: "zh" | "en" = "zh") {
  return render(React.createElement(LocaleProvider, { locale }, ui));
}

describe("AboutSection", () => {
  it("renders nothing when the section is disabled", async () => {
    mockSiteConfigState.aboutEnabled = false;
    const { AboutSection } = await import("@/components/sections/About");

    const { container } = renderWithLocale(React.createElement(AboutSection));

    expect(container.innerHTML).toBe("");
  });

  it("renders positioning and paragraph copy from contentCopy", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");

    renderWithLocale(React.createElement(AboutSection));

    expect(screen.getByText(aboutCopy.zh.heading)).toBeTruthy();
    expect(screen.getByText(aboutCopy.zh.positioningLabel)).toBeTruthy();
    expect(screen.getByText(aboutCopy.zh.positioningStatement)).toBeTruthy();
    for (const paragraph of aboutCopy.zh.paragraphs) {
      expect(screen.getByText(paragraph)).toBeTruthy();
    }
  });

  it("renders capabilities from the shared copy contract", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");

    renderWithLocale(React.createElement(AboutSection));

    expect(screen.getByText(aboutCopy.zh.buildLabel)).toBeTruthy();
    for (const capability of aboutCopy.zh.capabilities) {
      expect(screen.getByText(capability.title)).toBeTruthy();
      expect(screen.getByText(capability.description)).toBeTruthy();
    }
  });

  it("renders audience panel and point tags from contentCopy", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");

    renderWithLocale(React.createElement(AboutSection));

    expect(screen.getByText(aboutCopy.zh.audience.title)).toBeTruthy();
    expect(screen.getByText(aboutCopy.zh.audience.lead)).toBeTruthy();
    for (const point of aboutCopy.zh.audience.points) {
      expect(screen.getByText(point)).toBeTruthy();
    }
  });

  it("renders the first two case directions from aboutConfig", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");

    renderWithLocale(React.createElement(AboutSection));

    expect(screen.getByText(aboutCopy.zh.directionsLabel)).toBeTruthy();
    expect(screen.getByText(aboutCards[0].title)).toBeTruthy();
    expect(screen.getByText(aboutCards[1].title)).toBeTruthy();
    expect(screen.queryByText(aboutCards[2].title)).toBeFalsy();
  });

  it("renders project and links actions", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");

    const { container } = renderWithLocale(React.createElement(AboutSection));

    expect(
      container.querySelector(`a[aria-label="${aboutCopy.zh.viewCasesLabel}"]`)
    ).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: aboutCopy.zh.socialsButton }))
      .toHaveAttribute("href", "/links");
  });

  it("renders all section and capability icons", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");

    const { container } = renderWithLocale(React.createElement(AboutSection));

    for (const testId of [
      "icon-bot",
      "icon-network",
      "icon-workflow",
      "icon-layers",
      "icon-git-branch",
      "icon-brain-circuit",
      "icon-arrow-up-right",
      "icon-link2",
    ]) {
      expect(container.querySelector(`[data-testid="${testId}"]`)).toBeTruthy();
    }
  });

  it("renders English copy from the same contract", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");

    renderWithLocale(React.createElement(AboutSection), "en");

    expect(screen.getByText(aboutCopy.en.heading)).toBeTruthy();
    expect(screen.getByText(aboutCopy.en.positioningStatement)).toBeTruthy();
    expect(screen.getByText(aboutCopy.en.audience.title)).toBeTruthy();
    expect(screen.getByText("AI Workflow Engineering")).toBeTruthy();
    expect(screen.getByRole("link", { name: aboutCopy.en.socialsButton }))
      .toHaveAttribute("href", "/links");
  });
});
