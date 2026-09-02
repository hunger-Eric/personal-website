// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
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

function renderEnglishHomepage() {
  return render(
    <LocaleProvider initialLocale="en">
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
    expect(screen.getByRole("heading", { name: "公众号「独立系统」" })).toBeInTheDocument();
  });

  it("omits the Chinese WeChat channel section from the English homepage", () => {
    renderEnglishHomepage();

    expect(screen.queryByText("WeChat channel: Independent System")).not.toBeInTheDocument();
    expect(document.querySelector("#wechat")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "How AI becomes a working system" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Have a repetitive, fragile workflow?" })
    ).toBeInTheDocument();
  });

  it("offers the live Open GEO product without promoting a homepage simulation", () => {
    renderHomepage();

    expect(screen.getByRole("link", { name: "体验企业官网 GEO 诊断" })).toHaveAttribute(
      "href",
      "/projects/open-geo-console"
    );
    expect(
      screen.getByRole("link", { name: /查看企业 AI 自动化服务与交付方式/ })
    ).toHaveAttribute("href", "/services");
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
    expect(
      within(identity).getByText(/实解智能（英文品牌名：SolveReal Systems）目前由 fengc 负责/)
    ).toBeInTheDocument();
    expect(screen.getByText(/中小企业老板与业务负责人/)).toBeInTheDocument();
    expect(screen.getByText(/关键决策和高风险动作保留人工审核/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "了解实解智能" })).toHaveAttribute(
      "href",
      "/about"
    );
  });

  it("binds the English brand name to the Chinese brand on the English homepage", () => {
    renderEnglishHomepage();

    const identity = screen.getByRole("region", { name: "What is SolveReal Systems?" });
    expect(
      within(identity).getByText(/SolveReal Systems, also known in Chinese as 实解智能/)
    ).toBeInTheDocument();
  });
});
