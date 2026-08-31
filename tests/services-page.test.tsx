// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ServicesPage from "@/app/(site-zh)/services/page";
import { LocaleProvider } from "@/components/LocaleProvider";

function renderServicesPage(locale: "zh" | "en" = "zh") {
  return render(
    <LocaleProvider initialLocale={locale}>
      <ServicesPage />
    </LocaleProvider>
  );
}

describe("ServicesPage", () => {
  it("shows delivery, data-boundary, and buyer FAQ facts from the public service contract", () => {
    const { container } = renderServicesPage();

    expect(
      screen.getByRole("heading", { name: "标准交付物与验收依据" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "数据、权限与运行边界" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "采购前常见问题" })).toBeInTheDocument();
    expect(screen.getByText("异常与恢复路径")).toBeInTheDocument();
    expect(screen.getByText(/外部发送、付款、发布或其他高风险动作/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "按具体业务问题查看可交付系统" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Google 地图获客与定制营销系统/ })).toHaveAttribute(
      "href",
      "/projects/freight-lead-agent"
    );
    expect(screen.getByRole("link", { name: /企业数据整理与 AI 应用引擎/ })).toHaveAttribute(
      "href",
      "/projects/hermes-notebook"
    );
    expect(screen.getByRole("link", { name: /企业 AI 办公协作系统/ })).toHaveAttribute(
      "href",
      "/projects/codex-feishu-bridge"
    );

    const schemas = Array.from(
      container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
    ).map((node) => JSON.parse(node.textContent || "{}"));
    expect(schemas.some((schema) => schema["@type"] === "FAQPage")).toBe(true);
  });

  it("renders the full English page from the English route locale", () => {
    renderServicesPage("en");

    expect(
      screen.getByRole("heading", { name: "Enterprise AI Workflow System Design and Delivery" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What we need before starting" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Clear boundaries" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Standard deliverables and acceptance evidence" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Data, permission, and operating boundaries" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Submit a business problem/ })).toHaveAttribute(
      "href",
      "/en/contact"
    );
    expect(
      screen.queryByRole("heading", { name: "企业 AI 工作流系统设计与交付" })
    ).not.toBeInTheDocument();
  });
});
