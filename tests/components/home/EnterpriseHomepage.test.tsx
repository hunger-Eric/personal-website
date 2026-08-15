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
    expect(screen.getByRole("heading", { name: "Hermes Notebook" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Freight Lead Agent" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Codex Feishu Bridge" })).toBeInTheDocument();
    expect(screen.queryByText("企业内容增长系统")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "四个系统方向，对应四类企业能力" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /提交你的业务问题/ })[0]).toHaveAttribute("href", "/contact");
    expect(
      screen.getByRole("heading", { name: "不是看功能列表，而是看任务怎样被完成。" })
    ).toBeInTheDocument();
  });

  it("offers the live Open GEO product and keeps its simulation on the project detail page", () => {
    renderHomepage();

    expect(screen.getByRole("link", { name: "先体验 Open GEO" })).toHaveAttribute(
      "href",
      "/projects/open-geo-console"
    );
    expect(screen.getByRole("link", { name: /进入正式产品/ })).toHaveAttribute(
      "href",
      "https://geo.itheheda.online"
    );
    expect(screen.getByRole("link", { name: "模拟演示" })).toHaveAttribute(
      "href",
      "/projects/open-geo-console#open-geo-demo"
    );
    expect(screen.queryByTestId("open-geo-demo")).not.toBeInTheDocument();
  });
});
