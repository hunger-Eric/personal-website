// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next/image", () => ({
  default: (p: any) => React.createElement("img", p),
}));

vi.mock("next/link", () => ({
  default: (p: any) => React.createElement("a", { href: p.href, "aria-label": p["aria-label"] }, p.children),
}));

vi.mock("lucide-react", () => ({
  ArrowUpRight: () => React.createElement("svg", { "data-testid": "arrow-up-right" }),
  Bot: () => React.createElement("svg", { "data-testid": "bot" }),
  BrainCircuit: () => React.createElement("svg", { "data-testid": "brain-circuit" }),
  FileText: () => React.createElement("svg", { "data-testid": "file-text" }),
  GitBranch: () => React.createElement("svg", { "data-testid": "git-branch" }),
  Layers3: () => React.createElement("svg", { "data-testid": "layers3" }),
  Link2: () => React.createElement("svg", { "data-testid": "link2" }),
  Network: () => React.createElement("svg", { "data-testid": "network" }),
  Workflow: () => React.createElement("svg", { "data-testid": "workflow" }),
}));

const mockSiteCopyZh = {
  hero: { line: "test", description: "test" },
  about: {
    heading: "~/关于我",
    socialsButton: "查看全部社交",
    techIntro: "我常设计的系统能力：",
    paragraphs: [
      "我关注的不是 AI 能生成什么，而是如何把 AI 真正组织进长期工作流与产品系统。",
      "我不只是使用 AI 写代码，而是在设计 AI 时代的新型工作方式：让模型、自动化、内容和业务流程能稳定协同。",
    ],
    afterTechParagraph: "面向个人和小团队，我更关心能不能快速验证想法、减少重复劳动，并把系统做成以后还能继续扩展的样子。",
  },
  cases: { heading: "test", viewAll: "test", featuredBadge: "test", viewDetails: "test", emptyTitle: "test", emptyDescription: "test" },
  projects: { heading: "test", viewAll: "test", featuredBadge: "test", viewDetails: "test", emptyTitle: "test", emptyDescription: "test" },
  articles: {
    heading: "文章", description: "test", viewAll: "查看全部文章",
    emptyTitle: "还没有文章", emptyDescription: "发布后会显示在这里。",
    categoryFallback: "未分类", articlesCountSuffix: "篇", readTimeSuffix: "阅读",
  },
  photography: { heading: "test", description: "test", ongoing: "test", completed: "test", private: "test", photosSuffix: "test", emptyTitle: "test", emptyDescription: "test" },
};

const mockSiteCopyEn = {
  hero: { line: "test", description: "test" },
  about: {
    heading: "~/About Me",
    socialsButton: "View all socials",
    techIntro: "Systems I usually design:",
    paragraphs: [
      "I care less about what AI can generate in isolation, and more about how AI can be organized into long-term workflows and product systems.",
      "I do not only use AI to write code. I design new working patterns where models, automation, content, and business processes can cooperate reliably.",
    ],
    afterTechParagraph: "For individuals and small teams, the goal is faster idea validation, less repetitive work, and systems that can keep scaling after the first version ships.",
  },
  cases: { heading: "test", viewAll: "test", featuredBadge: "test", viewDetails: "test", emptyTitle: "test", emptyDescription: "test" },
  projects: { heading: "test", viewAll: "test", featuredBadge: "test", viewDetails: "test", emptyTitle: "test", emptyDescription: "test" },
  articles: {
    heading: "Articles", description: "test", viewAll: "View all articles",
    emptyTitle: "No articles yet", emptyDescription: "New posts will show up here after publishing.",
    categoryFallback: "Uncategorized", articlesCountSuffix: "posts", readTimeSuffix: "read",
  },
  photography: { heading: "test", description: "test", ongoing: "test", completed: "test", private: "test", photosSuffix: "test", emptyTitle: "test", emptyDescription: "test" },
};

let currentLocale: "zh" | "en" = "zh";
let currentSections = { about: true };
let currentSocialsForAbout: any[] = [{ key: "github", href: "https://github.com/test", showIn: { about: true } }];
let currentAboutSnapshotCards: any[] = [
  { title: "Card 1", description: "Desc 1", icon: "Globe" },
  { title: "Card 2", description: "Desc 2", icon: "Bot" },
];

vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    name: "Test Author",
    get sections() { return currentSections; },
    socialsFor: { about: () => currentSocialsForAbout },
  },
}));

vi.mock("@/config/contentCopy", () => ({
  getSiteCopy: (locale: string) => (locale === "en" ? mockSiteCopyEn : mockSiteCopyZh),
}));

vi.mock("@/config/aboutConfig", () => ({
  aboutConfig: {
    snapshot: {
      cards: currentAboutSnapshotCards,
    },
  },
}));

vi.mock("@/components/LocaleProvider", () => {
  const LocaleContext = React.createContext({
    locale: "zh" as const,
    t: {},
    setLocale: vi.fn(),
    toggleLocale: vi.fn(),
  });
  return {
    LocaleProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(LocaleContext.Provider, {
        value: { locale: currentLocale, t: {}, setLocale: vi.fn(), toggleLocale: vi.fn() },
      }, children),
    useLocale: () => React.useContext(LocaleContext),
    LocaleScript: () => null,
  };
});

vi.mock("@/config/locale", () => ({
  LOCALE_STORAGE_KEY: "devfoliox-locale",
  getTranslations: () => ({}),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

async function renderAbout() {
  const { AboutSection } = await import("@/components/sections/About");
  const { LocaleProvider } = await import("@/components/LocaleProvider");
  return render(React.createElement(LocaleProvider, null, React.createElement(AboutSection)));
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("AboutSection", () => {
  beforeEach(async () => {
    currentLocale = "zh";
    currentSections.about = true;
    currentSocialsForAbout = [{ key: "github", href: "https://github.com/test", showIn: { about: true } }];
    currentAboutSnapshotCards.length = 0;
    currentAboutSnapshotCards.push(
      { title: "Card 1", description: "Desc 1", icon: "Globe" },
      { title: "Card 2", description: "Desc 2", icon: "Bot" },
    );
  });

  it("returns null when about section is disabled", async () => {
    currentSections.about = false;
    const { container } = await renderAbout();
    expect(container.firstChild).toBeNull();
  });

  it("renders zh locale content correctly", async () => {
    currentLocale = "zh";
    await renderAbout();
    expect(screen.getByText("~/关于我")).toBeInTheDocument();
    expect(screen.getByText("核心定位")).toBeInTheDocument();
    expect(screen.getByText("我设计 AI 时代的新型工作方式。")).toBeInTheDocument();
    expect(screen.getByText("我构建什么")).toBeInTheDocument();
    expect(screen.getByText("面向初创团队与小团队")).toBeInTheDocument();
    expect(screen.getByText("案例形式")).toBeInTheDocument();
    expect(screen.getByText("已有方向")).toBeInTheDocument();
    expect(screen.getByText("查看全部社交")).toBeInTheDocument();
  });

  it("renders en locale content correctly", async () => {
    currentLocale = "en";
    await renderAbout();
    expect(screen.getByText("~/About Me")).toBeInTheDocument();
    expect(screen.getByText("Positioning")).toBeInTheDocument();
    expect(screen.getByText("I design new working patterns for the AI era.")).toBeInTheDocument();
    expect(screen.getByText("What I Build")).toBeInTheDocument();
    expect(screen.getByText("For Startups & Small Teams")).toBeInTheDocument();
    expect(screen.getByText("Case formats")).toBeInTheDocument();
    expect(screen.getByText("Existing directions")).toBeInTheDocument();
    expect(screen.getByText("View all socials")).toBeInTheDocument();
  });

  it("renders all 4 capability cards in zh", async () => {
    currentLocale = "zh";
    await renderAbout();
    expect(screen.getByText("AI 工作流工程")).toBeInTheDocument();
    expect(screen.getByText("自动化系统")).toBeInTheDocument();
    expect(screen.getByText("知识库与 RAG 系统")).toBeInTheDocument();
    expect(screen.getByText("AI 辅助创作")).toBeInTheDocument();
  });

  it("renders all 4 capability cards in en", async () => {
    currentLocale = "en";
    await renderAbout();
    expect(screen.getByText("AI Workflow Engineering")).toBeInTheDocument();
    expect(screen.getByText("Automation Systems")).toBeInTheDocument();
    expect(screen.getByText("Knowledge & RAG Systems")).toBeInTheDocument();
    expect(screen.getByText("AI-assisted Creative Production")).toBeInTheDocument();
  });

  it("renders all 5 audience points in zh", async () => {
    currentLocale = "zh";
    await renderAbout();
    expect(screen.getByText("降低重复劳动")).toBeInTheDocument();
    expect(screen.getByText("快速验证 idea")).toBeInTheDocument();
    expect(screen.getByText("把 AI 接进业务")).toBeInTheDocument();
    expect(screen.getByText("整理混乱流程")).toBeInTheDocument();
    expect(screen.getByText("沉淀长期系统")).toBeInTheDocument();
  });

  it("renders all 5 audience points in en", async () => {
    currentLocale = "en";
    await renderAbout();
    expect(screen.getByText("reduce repetitive work")).toBeInTheDocument();
    expect(screen.getByText("validate ideas faster")).toBeInTheDocument();
    expect(screen.getByText("connect AI to operations")).toBeInTheDocument();
    expect(screen.getByText("organize messy workflows")).toBeInTheDocument();
    expect(screen.getByText("build long-term systems")).toBeInTheDocument();
  });

  it("renders 2 case study cards", async () => {
    await renderAbout();
    expect(screen.getByText("Card 1")).toBeInTheDocument();
    expect(screen.getByText("Card 2")).toBeInTheDocument();
  });

  it("renders 1 case study card", async () => {
    currentAboutSnapshotCards.length = 0;
    currentAboutSnapshotCards.push({ title: "Single", description: "Only one", icon: "Globe" });
    await renderAbout();
    expect(screen.getByText("Single")).toBeInTheDocument();
    expect(screen.queryByText("Card 2")).not.toBeInTheDocument();
  });

  it("renders no case study cards when empty", async () => {
    currentAboutSnapshotCards.length = 0;
    await renderAbout();
    expect(screen.getByText("已有方向")).toBeInTheDocument();
    expect(screen.queryByText(/Card \d/)).not.toBeInTheDocument();
  });

  it("renders socials button even with empty socials", async () => {
    currentSocialsForAbout = [];
    await renderAbout();
    expect(screen.getByText("查看全部社交")).toBeInTheDocument();
  });

  it("renders zh case format description", async () => {
    currentLocale = "zh";
    await renderAbout();
    expect(screen.getByText(/案例会以网站.*呈现/i)).toBeInTheDocument();
  });

  it("renders en case format description", async () => {
    currentLocale = "en";
    await renderAbout();
    expect(screen.getByText(/Cases can appear as websites/i)).toBeInTheDocument();
  });

  it("renders about paragraphs from contentCopy in zh", async () => {
    currentLocale = "zh";
    await renderAbout();
    expect(screen.getByText("我关注的不是 AI 能生成什么，而是如何把 AI 真正组织进长期工作流与产品系统。")).toBeInTheDocument();
  });

  it("renders link to /projects with aria-label", async () => {
    currentLocale = "zh";
    await renderAbout();
    const projectsLink = screen.getByLabelText("查看案例");
    expect(projectsLink).toHaveAttribute("href", "/projects");
  });

  it("renders link to /links for socials", async () => {
    await renderAbout();
    const socialsLink = screen.getByRole("link", { name: /查看全部社交/i });
    expect(socialsLink).toHaveAttribute("href", "/links");
  });

  it("renders aria-hidden separator", async () => {
    const { container } = await renderAbout();
    const separator = container.querySelector('[aria-hidden]');
    expect(separator).toBeInTheDocument();
  });
});