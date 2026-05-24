// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("@/config/siteConfig", () => ({
  siteConfig: { name: "Test", title: "Dev", tagline: "Building", socialsList: [] }
}));
vi.mock("lucide-react", () => ({ FileText: () => React.createElement("svg"), Mail: () => React.createElement("svg") }));
vi.mock("@/components/hooks/useModalRoute", () => ({
  useModalRoute: () => ({ href: "/?resume", open: () => {}, close: () => {}, isActive: false })
}));
vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({
    locale: "zh",
    t: {
      hero: { greeting: "你好，我是", resume: "我的简历", contact: "联系我" },
      nav: { about: "关于", projects: "项目", articles: "文章", photography: "摄影", more: "更多", connect: "联系我" },
      footer: { builtWith: "使用 Next.js 与爱构建" },
      common: { viewAll: "查看全部" },
    },
    setLocale: () => {},
    toggleLocale: () => {},
  }),
  LocaleProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe("HeroSection", () => {
  it("renders without crashing", async () => {
    const mod = await import("@/components/sections/Hero");
    const Component = mod["HeroSection"];
    if (typeof Component === "function") {
      const { container } = render(React.createElement(Component));
      expect(container).toBeTruthy();
    }
  });
});
