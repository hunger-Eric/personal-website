// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "@/components/LocaleProvider";
import { PublicProjectDetail } from "@/components/projects/PublicProjectDetail";

describe("PublicProjectDetail", () => {
  it("explains the live Open GEO product instead of rendering a simulation", () => {
    const { container } = render(
      <LocaleProvider initialLocale="zh">
        <PublicProjectDetail id="open-geo-console" />
      </LocaleProvider>
    );

    expect(
      screen.getByRole("heading", { name: "Open GEO 到底做什么？" })
    ).toBeInTheDocument();
    const flow = screen.getByRole("list", { name: "真实产品流程" });
    ["输入网站", "执行检查", "标出问题", "形成整改"].forEach((title) => {
      expect(flow).toHaveTextContent(title);
    });
    expect(screen.getByText("证据问题清单")).toBeInTheDocument();
    expect(screen.getByText("整改优先级")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /进入 Open GEO 正式产品/ })
    ).toHaveAttribute("href", "https://geo.itheheda.online/zh");
    expect(
      screen.getByRole("link", { name: /阅读 AI 可见性审计方法/ })
    ).toHaveAttribute("href", "/articles/ai-search-visibility-audit-geo");
    expect(
      screen.getByRole("heading", {
        name: "先看一份完整报告，再判断这套诊断有没有用",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /查看完整中文深度报告/ })
    ).toHaveAttribute("href", "/projects/open-geo-console/report");
    expect(container.querySelector("#open-geo-demo")).not.toBeInTheDocument();
    expect(screen.queryByText(/模拟体验/)).not.toBeInTheDocument();
  });

  it("keeps the Chinese report sample out of the English project page", () => {
    render(
      <LocaleProvider initialLocale="en">
        <PublicProjectDetail id="open-geo-console" />
      </LocaleProvider>
    );

    expect(
      screen.queryByRole("link", { name: /deep report/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/真实产物样例/)).not.toBeInTheDocument();
  });

  it("gives reviewed project facts stable citation anchors", () => {
    const { container } = render(
      <LocaleProvider initialLocale="zh">
        <PublicProjectDetail id="hermes-notebook" />
      </LocaleProvider>
    );

    expect(container.querySelector("#project-overview")).toBeInTheDocument();
    expect(container.querySelector("#customer-problem")).toBeInTheDocument();
    expect(container.querySelector("#system-workflow")).toBeInTheDocument();
    expect(container.querySelector("#human-review")).toBeInTheDocument();
    expect(container.querySelector("#delivered-output")).toBeInTheDocument();
    expect(container.querySelector("#usage-boundary")).toBeInTheDocument();
  });
});
