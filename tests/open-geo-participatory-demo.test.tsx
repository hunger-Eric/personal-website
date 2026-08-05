// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import OpenGeoParticipatoryDemo from "@/components/projects/OpenGeoParticipatoryDemo";

describe("OpenGeoParticipatoryDemo", () => {
  it("requires project, scenario, and an explicit start before step one", async () => {
    const user = userEvent.setup({ document: window.document });
    render(<OpenGeoParticipatoryDemo />);
    expect(screen.getByText(/全部为模拟数据/)).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Open GEO Console/ }));
    await user.click(screen.getByRole("button", { name: /企业服务表达是否容易被 AI 理解/ }));
    expect(screen.getByRole("button", { name: /点击开始/ })).toBeInTheDocument();
    expect(screen.queryByText(/步骤 1 \/ 3/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /点击开始/ }));
    expect(screen.getByRole("status")).toHaveTextContent("步骤 1 / 3");
  });

  it("advances only through clicks and carries allowlisted context", async () => {
    const user = userEvent.setup({ document: window.document });
    render(<OpenGeoParticipatoryDemo />);
    await user.click(screen.getByRole("button", { name: /Open GEO Console/ }));
    await user.click(screen.getByRole("button", { name: /企业服务表达是否容易被 AI 理解/ }));
    await user.click(screen.getByRole("button", { name: /点击开始/ }));
    await user.click(screen.getByRole("button", { name: "下一步" }));
    await user.click(screen.getByRole("button", { name: "下一步" }));
    await user.click(screen.getByRole("button", { name: /查看模拟交付物/ }));
    expect(screen.getByRole("article", { name: "模拟交付物" })).toHaveTextContent("不代表客户结果");
    expect(screen.getByRole("link", { name: /携带此项目上下文联系/ })).toHaveAttribute("href", "/contact?project=open-geo-console&scenario=service-clarity&artifact=diagnostic-summary");
  });
});