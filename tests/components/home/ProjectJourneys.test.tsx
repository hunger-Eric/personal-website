// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
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
  it("starts with Codex Feishu Bridge and exposes controllable story steps", () => {
    renderJourneys();

    expect(screen.getByRole("tab", { name: /Codex Feishu Bridge/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("heading", { name: "手机飞书提交任务" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "暂停流程动画" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /查看 Codex Feishu Bridge 项目详情/ })).toHaveAttribute(
      "href",
      "/projects/codex-feishu-bridge"
    );

    fireEvent.click(screen.getByRole("button", { name: "查看步骤 4：结果回到原话题" }));
    expect(screen.getByRole("status")).toHaveTextContent("当前步骤 4 / 4");
    expect(screen.getByText(/沉淀为 Skill/)).toBeInTheDocument();
  });

  it("switches the animated story to another project", () => {
    renderJourneys();

    fireEvent.click(screen.getByRole("tab", { name: /Hermes Notebook/ }));

    expect(screen.getByRole("heading", { name: "导入分散资料" })).toBeInTheDocument();
    expect(screen.getByText(/客服机器人、内部知识问答和业务助手/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /查看 Hermes Notebook 项目详情/ })).toHaveAttribute(
      "href",
      "/projects/hermes-notebook"
    );
  });

  it("provides a distinct demo path for every project", () => {
    renderJourneys();

    fireEvent.click(screen.getByRole("tab", { name: /Freight Lead Agent/ }));
    expect(screen.getByRole("heading", { name: "Google 地图发现企业" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /查看 Freight Lead Agent 项目详情/ })).toHaveAttribute(
      "href",
      "/projects/freight-lead-agent"
    );

    fireEvent.click(screen.getByRole("tab", { name: /Open GEO Console/ }));
    expect(screen.getByRole("heading", { name: "用真实官网完成一次 AI 搜索可见性诊断" })).toBeInTheDocument();
    expect(screen.queryByTestId("remotion-project-journey")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /进入正式产品/ })).toHaveAttribute(
      "href",
      "https://geo.itheheda.online"
    );
    expect(screen.getByRole("link", { name: /模拟演示/ })).toHaveAttribute(
      "href",
      "/projects/open-geo-console#open-geo-demo"
    );
  });

  it("renders the full experience in English", () => {
    renderJourneys("en");

    expect(
      screen.getByRole("heading", { name: "See how work gets completed, not a feature list." })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open live product/ })).toHaveAttribute(
      "href",
      "https://geo.itheheda.online"
    );
    expect(screen.getByRole("heading", { name: "Submit a task from Feishu mobile" })).toBeInTheDocument();
  });
});
