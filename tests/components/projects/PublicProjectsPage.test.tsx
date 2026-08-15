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
    expect(screen.getAllByText("客户原来怎么做")).toHaveLength(4);
    expect(screen.getAllByText("系统怎么完成")).toHaveLength(4);
    expect(screen.getAllByText("购买后得到什么")).toHaveLength(4);
    expect(screen.queryByText("证据边界")).not.toBeInTheDocument();
    expect(screen.getByText(/可以持续执行的 GEO 优化方案/)).toBeInTheDocument();
    expect(screen.getByText(/官网需要修改的位置、对应的修改建议/)).toBeInTheDocument();
    expect(screen.getByText(/持续监测和迭代的方向/)).toBeInTheDocument();

    expect(screen.getByText("企业数据整理与 AI 应用引擎")).toBeInTheDocument();
    expect(screen.getByText(/散落在 PDF、Word、Excel、PPT/)).toBeInTheDocument();
    expect(screen.getByText(/建立可追溯的知识节点和检索索引/)).toBeInTheDocument();
    expect(screen.getByText(/客服机器人、内部问答和后续业务助手/)).toBeInTheDocument();
    expect(screen.getByText(/不必为每个 AI 应用重新清洗和导入资料/)).toBeInTheDocument();

    expect(screen.getByText("Google 地图获客与定制营销系统")).toBeInTheDocument();
    expect(screen.getByText(/从 Google 地图批量发现目标企业/)).toBeInTheDocument();
    expect(screen.getByText(/结合每家公司的网站内容生成定制邮件/)).toBeInTheDocument();
    expect(screen.getByText(/避免所有潜在客户收到同一套通用话术/)).toBeInTheDocument();

    expect(screen.getByText("企业 AI 办公协作系统")).toBeInTheDocument();
    expect(screen.getByText(/把 Codex 接入企业飞书/)).toBeInTheDocument();
    expect(screen.getByText(/成员用电脑或手机即可提交问题/)).toBeInTheDocument();
    expect(screen.getByText(/公司里保持在线的工作电脑继续执行/)).toBeInTheDocument();
    expect(screen.getByText(/同一话题的授权成员可以继续补充/)).toBeInTheDocument();
    expect(screen.getByText(/回家或离开工位后/)).toBeInTheDocument();
    expect(screen.getByText(/反复验证有效的工作流程整理成可复用 Skill/)).toBeInTheDocument();
    expect(screen.getByText(/减少对个别熟练员工的依赖/)).toBeInTheDocument();

    expect(screen.queryByText(/601/)).not.toBeInTheDocument();
    expect(screen.queryByText(/521/)).not.toBeInTheDocument();
  });
});
