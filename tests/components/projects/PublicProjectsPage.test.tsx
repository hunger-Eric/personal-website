// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "@/components/LocaleProvider";
import { PublicProjectsPage } from "@/components/projects/PublicProjectsPage";

describe("PublicProjectsPage", () => {
  it("explains the customer workflow, system response, and concrete reason to buy", () => {
    render(
      <LocaleProvider initialLocale="zh">
        <PublicProjectsPage />
      </LocaleProvider>
    );

    expect(
      screen.getByRole("heading", { name: "每个项目解决什么，为什么值得买" })
    ).toBeInTheDocument();
    expect(screen.getAllByText("客户原来怎么做")).toHaveLength(2);
    expect(screen.getAllByText("系统怎么完成")).toHaveLength(2);
    expect(screen.getAllByText("购买后得到什么")).toHaveLength(2);
    expect(screen.queryByText("证据边界")).not.toBeInTheDocument();
    expect(screen.getByText(/可以持续执行的 GEO 优化方案/)).toBeInTheDocument();
    expect(screen.getByText(/官网需要修改的位置、对应的修改建议/)).toBeInTheDocument();
    expect(screen.getByText(/持续监测和迭代的方向/)).toBeInTheDocument();

    expect(screen.getByText("Google 地图获客与定制营销系统")).toBeInTheDocument();
    expect(screen.getByText(/从 Google 地图批量发现目标企业/)).toBeInTheDocument();
    expect(screen.getByText(/结合每家公司的网站内容生成定制邮件/)).toBeInTheDocument();
    expect(screen.getByText(/避免所有潜在客户收到同一套通用话术/)).toBeInTheDocument();

    expect(screen.queryByText(/601/)).not.toBeInTheDocument();
    expect(screen.queryByText(/521/)).not.toBeInTheDocument();
  });
});
