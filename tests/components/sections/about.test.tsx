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
  Link2: () => React.createElement("svg", { "data-testid": "icon-link2" }),
  GitBranch: () => React.createElement("svg", { "data-testid": "icon-git-branch" }),
  Workflow: () => React.createElement("svg", { "data-testid": "icon-workflow" }),
  BrainCircuit: () => React.createElement("svg", { "data-testid": "icon-brain-circuit" }),
  Layers3: () => React.createElement("svg", { "data-testid": "icon-layers" }),
  ArrowUpRight: () => React.createElement("svg", { "data-testid": "icon-arrow-up-right" }),
  Bot: () => React.createElement("svg", { "data-testid": "icon-bot" }),
  FileText: () => React.createElement("svg", { "data-testid": "icon-file-text" }),
  Network: () => React.createElement("svg", { "data-testid": "icon-network" }),
}));

// ── Mock contentCopy ───────────────────────────────────────────────────────

const mockSiteCopy = vi.hoisted(() => ({
  about: {
    heading: "~/关于我",
    socialsButton: "查看全部社交",
    techIntro: "我常设计的系统能力：",
    paragraphs: [
      "我关注的不是 AI 能生成什么，而是如何把 AI 真正组织进长期工作流与产品系统。",
      "我不只是使用 AI 写代码，而是在设计 AI 时代的新型工作方式。",
    ],
    afterTechParagraph: "面向个人和小团队，我更关心能不能快速验证想法。",
  },
}));

vi.mock("@/config/contentCopy", () => ({
  getSiteCopy: (locale: string) => ({
    about: {
      heading: locale === "zh" ? "~/关于我" : "~/About Me",
      socialsButton: locale === "zh" ? "查看全部社交" : "View all socials",
      techIntro: locale === "zh" ? "我常设计的系统能力：" : "Systems I usually design:",
      paragraphs:
        locale === "zh"
          ? [
              "我关注的不是 AI 能生成什么，而是如何把 AI 真正组织进长期工作流与产品系统。",
              "我不只是使用 AI 写代码，而是在设计 AI 时代的新型工作方式。",
            ]
          : [
              "I care less about what AI can generate in isolation.",
              "I design new working patterns where models, automation, content, and business processes can cooperate reliably.",
            ],
      afterTechParagraph:
        locale === "zh"
          ? "面向个人和小团队，我更关心能不能快速验证想法。"
          : "For individuals and small teams, the goal is faster idea validation.",
    },
  }),
}));

// ── Mock siteConfig ────────────────────────────────────────────────────────

const mockSiteConfigState = vi.hoisted(() => ({
  aboutEnabled: true,
}));

vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    get sections() {
      return { about: mockSiteConfigState.aboutEnabled };
    },
  },
}));

// ── Mock aboutConfig ───────────────────────────────────────────────────────

vi.mock("@/config/aboutConfig", () => ({
  aboutConfig: {
    snapshot: {
      cards: [
        {
          title: "AI 自动化工作流系统",
          description: "基于 n8n 与 Docker 的端到端自动化流程，连接多个 API 与数据源。",
          icon: "workflow",
        },
        {
          title: "本地知识库 RAG 系统",
          description: "多源文档检索与知识问答，支持私有数据与业务场景。",
          icon: "brain-circuit",
        },
        {
          title: "AI 辅助内容创作平台",
          description: "结合视觉思维与内容结构，沉淀可重复执行的创意生产流程。",
          icon: "layers",
        },
      ],
    },
  },
}));

// ── Helper ─────────────────────────────────────────────────────────────────

function renderWithLocale(ui: React.ReactElement) {
  return render(
    React.createElement(LocaleProvider, null, ui)
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("AboutSection", () => {
  it("renders nothing when section is disabled", async () => {
    mockSiteConfigState.aboutEnabled = false;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = renderWithLocale(React.createElement(AboutSection));
    expect(container.innerHTML).toBe("");
  });

  it("renders section heading when enabled (zh locale)", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    renderWithLocale(React.createElement(AboutSection));
    expect(screen.getByText("~/关于我")).toBeTruthy();
  });

  it("renders socials button link", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    renderWithLocale(React.createElement(AboutSection));
    const link = screen.getByRole("link", { name: /查看全部社交/i });
    expect(link).toBeTruthy();
    expect(link.closest("a")).toHaveAttribute("href", "/links");
  });

  it("renders Link2 icon in socials button", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = renderWithLocale(React.createElement(AboutSection));
    expect(container.querySelector('[data-testid="icon-link2"]')).toBeTruthy();
  });

  it("renders positioning text", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    renderWithLocale(React.createElement(AboutSection));
    expect(
      screen.getByText(/我设计 AI 时代的新型工作方式/i)
    ).toBeTruthy();
  });

  it("renders Bot icon in positioning section", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = renderWithLocale(React.createElement(AboutSection));
    expect(container.querySelector('[data-testid="icon-bot"]')).toBeTruthy();
  });

  it("renders paragraphs from contentCopy", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    renderWithLocale(React.createElement(AboutSection));
    expect(
      screen.getByText(/我关注的不是 AI 能生成什么/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/我不只是使用 AI 写代码/i)
    ).toBeTruthy();
  });

  it("renders capabilities grid (4 items)", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    renderWithLocale(React.createElement(AboutSection));

    // Capability titles
    expect(screen.getByText("AI 工作流工程")).toBeTruthy();
    expect(screen.getByText("自动化系统")).toBeTruthy();
    expect(screen.getByText("知识库与 RAG 系统")).toBeTruthy();
    expect(screen.getByText("AI 辅助创作")).toBeTruthy();

    // Capability icons
    const { container } = renderWithLocale(React.createElement(AboutSection));
    expect(container.querySelectorAll('[data-testid="icon-git-branch"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-testid="icon-workflow"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-testid="icon-brain-circuit"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-testid="icon-layers"]').length).toBeGreaterThan(0);
  });

  it("renders Network icon in 'What I Build' section", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = renderWithLocale(React.createElement(AboutSection));
    expect(container.querySelector('[data-testid="icon-network"]')).toBeTruthy();
  });

  it("renders audience panel with title and lead text", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    renderWithLocale(React.createElement(AboutSection));
    expect(screen.getByText("面向初创团队与小团队")).toBeTruthy();
    expect(
      screen.getByText(/帮助个人与小团队快速构建/i)
    ).toBeTruthy();
  });

  it("renders Workflow icon in audience panel", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = renderWithLocale(React.createElement(AboutSection));
    expect(container.querySelector('[data-testid="icon-workflow"]')).toBeTruthy();
  });

  it("renders audience points as tags", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    renderWithLocale(React.createElement(AboutSection));
    expect(screen.getByText("降低重复劳动")).toBeTruthy();
    expect(screen.getByText("快速验证 idea")).toBeTruthy();
    expect(screen.getByText("把 AI 接进业务")).toBeTruthy();
    expect(screen.getByText("整理混乱流程")).toBeTruthy();
    expect(screen.getByText("沉淀长期系统")).toBeTruthy();
  });

  it("renders case studies sidebar from aboutConfig snapshot cards", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    renderWithLocale(React.createElement(AboutSection));

    // Only first 2 cards are rendered (slice(0, 2))
    expect(screen.getByText("AI 自动化工作流系统")).toBeTruthy();
    expect(screen.getByText("本地知识库 RAG 系统")).toBeTruthy();

    // Third card should NOT be rendered
    expect(screen.queryByText("AI 辅助内容创作平台")).toBeFalsy();
  });

  it("renders FileText icon in case studies section", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = renderWithLocale(React.createElement(AboutSection));
    expect(container.querySelector('[data-testid="icon-file-text"]')).toBeTruthy();
  });

  it("renders case formats description text", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    renderWithLocale(React.createElement(AboutSection));
    expect(
      screen.getByText(/案例会以网站、PPT、文档/i)
    ).toBeTruthy();
  });

  it("renders '已有方向' label in case studies section", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    renderWithLocale(React.createElement(AboutSection));
    expect(screen.getByText("已有方向")).toBeTruthy();
  });

  it("renders ArrowUpRight icon in case studies 'view all' link", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = renderWithLocale(React.createElement(AboutSection));
    expect(
      container.querySelector('[data-testid="icon-arrow-up-right"]')
    ).toBeTruthy();
  });

  it("renders Layers3 icon in '已有方向' section", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = renderWithLocale(React.createElement(AboutSection));
    expect(container.querySelector('[data-testid="icon-layers"]')).toBeTruthy();
  });

  it("renders '查看案例' aria-label on case studies link", async () => {
    mockSiteConfigState.aboutEnabled = true;
    const { AboutSection } = await import("@/components/sections/About");
    const { container } = renderWithLocale(React.createElement(AboutSection));
    const link = container.querySelector('a[aria-label="查看案例"]');
    expect(link).toBeTruthy();
  });
});
