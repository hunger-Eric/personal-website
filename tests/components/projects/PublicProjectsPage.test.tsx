// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "@/components/LocaleProvider";
import { PublicProjectsPage } from "@/components/projects/PublicProjectsPage";

describe("PublicProjectsPage", () => {
  it("explains the business problem, system response, and reason to buy without presenting test data as outcomes", () => {
    render(
      <LocaleProvider initialLocale="zh">
        <PublicProjectsPage />
      </LocaleProvider>
    );

    expect(
      screen.getByRole("heading", { name: "项目怎样解决真实业务问题" })
    ).toBeInTheDocument();
    expect(screen.getByText(/本地测试数据只用于验证系统/)).toBeInTheDocument();
    expect(screen.getAllByText("实际要解决")).toHaveLength(2);
    expect(screen.getAllByText("系统怎样做")).toHaveLength(2);
    expect(screen.getAllByText("客户为什么买")).toHaveLength(2);
    expect(screen.getAllByText("证据边界")).toHaveLength(2);

    expect(screen.queryByText(/601/)).not.toBeInTheDocument();
    expect(screen.queryByText(/521/)).not.toBeInTheDocument();
  });
});
