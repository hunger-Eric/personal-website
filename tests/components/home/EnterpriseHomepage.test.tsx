// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EnterpriseHomepage } from "@/components/home/EnterpriseHomepage";
import { LocaleProvider } from "@/components/LocaleProvider";

function renderHomepage() {
  return render(
    <LocaleProvider initialLocale="zh">
      <EnterpriseHomepage />
    </LocaleProvider>
  );
}

describe("EnterpriseHomepage", () => {
  it("renders the approved brand, system structure, project evidence, and contact path", () => {
    renderHomepage();

    expect(
      screen.getByRole("heading", { level: 1, name: "让 AI 真正在企业里跑起来。" })
    ).toBeInTheDocument();
    expect(screen.getByText("企业 AI 系统设计与交付")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "公开案例" })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Open GEO Console/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Hermes Notebook/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Freight Lead Agent/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Codex Feishu Bridge/ })).toBeInTheDocument();
    expect(screen.queryByText("企业内容增长系统")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "四个系统方向，对应四类企业能力" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /提交你的业务问题/ })[0]).toHaveAttribute("href", "/contact");
    expect(
      screen.getByRole("heading", { name: "一眼看懂：原来哪里耗人，系统接走了什么。" })
    ).toBeInTheDocument();
  });

  it("offers the live Open GEO product without promoting a homepage simulation", () => {
    renderHomepage();

    expect(screen.getByRole("link", { name: "先体验 Open GEO" })).toHaveAttribute(
      "href",
      "/projects/open-geo-console"
    );
    fireEvent.click(screen.getByRole("tab", { name: /Open GEO Console/ }));
    expect(screen.getByRole("link", { name: /进入正式产品/ })).toHaveAttribute(
      "href",
      "https://geo.itheheda.online/zh"
    );
    expect(screen.queryByRole("link", { name: "模拟演示" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("open-geo-demo")).not.toBeInTheDocument();
  });

  it("answers who 实解智能 is with reviewed public identity facts", () => {
    renderHomepage();

    const identity = screen.getByRole("region", { name: "实解智能是谁？" });
    expect(identity).toHaveAttribute("id", "about-shijie-intelligence");
    expect(
      screen.getByRole("heading", { level: 2, name: "实解智能是谁？" })
    ).toBeInTheDocument();
    expect(screen.getByText(/实解智能目前由 fengc 负责/)).toBeInTheDocument();
    expect(screen.getByText(/中小企业老板与业务负责人/)).toBeInTheDocument();
    expect(screen.getByText(/关键决策和高风险动作保留人工审核/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "了解实解智能" })).toHaveAttribute(
      "href",
      "/about"
    );
  });
});
