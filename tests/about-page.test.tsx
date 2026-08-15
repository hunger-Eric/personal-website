// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AboutPage from "@/app/about/page";
import { LangSwitch } from "@/components/LangSwitch";
import { LocaleProvider } from "@/components/LocaleProvider";

function renderAboutPage() {
  return render(
    <LocaleProvider initialLocale="zh">
      <LangSwitch />
      <AboutPage />
    </LocaleProvider>
  );
}

describe("AboutPage", () => {
  it("explains who owns the project and how a customer starts working together", () => {
    renderAboutPage();

    expect(screen.getByRole("heading", { name: "谁来负责项目" })).toBeInTheDocument();
    expect(screen.getByText(/由同一负责人推进/)).toBeInTheDocument();
    expect(screen.getByText(/不需要先准备一份完整需求书/)).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "合作从哪里开始" })).toBeInTheDocument();
    expect(screen.getByText(/先确认问题是否值得做/)).toBeInTheDocument();
    expect(screen.getByText(/再划分系统与人工的职责/)).toBeInTheDocument();
    expect(screen.getByText(/最后用真实数据验证/)).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /查看项目案例/ })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: /提交一个业务问题/ })).toHaveAttribute("href", "/contact");
    expect(screen.queryByText("公开身份说明")).not.toBeInTheDocument();
    expect(screen.queryByText("公开证据原则")).not.toBeInTheDocument();
  });

  it("switches the full page copy from Chinese to English", () => {
    renderAboutPage();

    expect(screen.getByRole("heading", { name: "谁来负责项目" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "切换到 English" }));

    expect(screen.getByRole("heading", { name: "Who leads the project" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How collaboration starts" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Submit a business problem/ })).toHaveLength(2);
    for (const link of screen.getAllByRole("link", { name: /Submit a business problem/ })) {
      expect(link).toHaveAttribute("href", "/contact");
    }
    expect(screen.queryByRole("heading", { name: "谁来负责项目" })).not.toBeInTheDocument();
  });
});
