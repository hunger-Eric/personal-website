// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "@/components/LocaleProvider";
import { ProjectJourneys } from "@/components/home/ProjectJourneys";

function renderJourneys(locale: "zh" | "en" = "zh") {
  return render(
    <LocaleProvider initialLocale={locale}>
      <ProjectJourneys />
    </LocaleProvider>
  );
}

describe("ProjectJourneys", () => {
  it("starts with Freight Lead Agent and explains the full evidence chain without playback", () => {
    renderJourneys();

    expect(screen.getByRole("tab", { name: /Freight Lead Agent/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("heading", { name: "一眼看懂：原来哪里耗人，系统接走了什么。" })).toBeInTheDocument();
    expect(screen.getByText("改造前")).toBeInTheDocument();
    expect(screen.getByText("系统接管")).toBeInTheDocument();
    expect(screen.getByText("人工保留")).toBeInTheDocument();
    expect(screen.getByText("恢复与边界")).toBeInTheDocument();
    expect(screen.getByText("可验收交付")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /播放|暂停/ })).not.toBeInTheDocument();
    expect(screen.queryByText("当前步骤")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /查看项目证据/ })).toHaveAttribute(
      "href",
      "/projects/freight-lead-agent"
    );
  });

  it("switches the whole evidence story to Hermes Notebook", () => {
    renderJourneys();

    fireEvent.click(screen.getByRole("tab", { name: /Hermes Notebook/ }));

    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText(/企业真正有价值的数据散落/)).toBeInTheDocument();
    expect(within(panel).getByText(/Hermes 导入多种格式的资料/)).toBeInTheDocument();
    expect(within(panel).getByText(/管理员决定哪些文件夹和资料/)).toBeInTheDocument();
    expect(within(panel).getByText(/按业务主题整理的企业知识库/)).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: /查看项目证据/ })).toHaveAttribute(
      "href",
      "/projects/hermes-notebook"
    );
  });

  it("keeps Open GEO as a live product and removes the homepage simulation route", () => {
    renderJourneys();

    fireEvent.click(screen.getByRole("tab", { name: /Open GEO Console/ }));

    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText(/企业很难看见 AI 能否读懂官网/)).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: /进入正式产品/ })).toHaveAttribute(
      "href",
      "https://geo.itheheda.online/zh"
    );
    expect(within(panel).getByRole("link", { name: /查看项目证据/ })).toHaveAttribute(
      "href",
      "/projects/open-geo-console"
    );
    expect(screen.queryByRole("link", { name: /模拟演示/ })).not.toBeInTheDocument();
  });

  it("renders the evidence structure in English", () => {
    renderJourneys("en");

    expect(
      screen.getByRole("heading", {
        name: "See where work was draining time—and what the system took over.",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("System takeover")).toBeInTheDocument();
    expect(screen.getByText("Human control")).toBeInTheDocument();
    expect(screen.getByText("Verifiable deliverables")).toBeInTheDocument();
  });
});
