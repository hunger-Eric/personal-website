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
  it("renders the approved brand, system structure, project library, and contact path", () => {
    renderHomepage();

    expect(
      screen.getByRole("heading", { level: 1, name: "让 AI 真正在企业里跑起来。" })
    ).toBeInTheDocument();
    expect(screen.getByText("企业 AI 系统设计与交付")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "公开案例" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open GEO Console" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Freight Lead Agent" })).toBeInTheDocument();
    expect(screen.queryByText("Hermes Notebook")).not.toBeInTheDocument();
    expect(screen.queryByText("企业内容增长系统")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "四个系统方向，对应四类企业能力" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /提交你的业务问题/ })[0]).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("note")).toHaveTextContent("全部为模拟数据");
  });

  it("does not start the Open GEO prototype until the visitor chooses a project and scenario", () => {
    renderHomepage();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Open GEO Console/ }));
    expect(screen.getByRole("group", { name: "示例场景" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "点击开始" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /企业服务表达是否容易被 AI 理解/ }));
    expect(screen.getByRole("button", { name: "点击开始" })).toBeEnabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
