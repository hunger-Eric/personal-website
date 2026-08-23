// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ServicesPage from "@/app/services/page";
import { LangSwitch } from "@/components/LangSwitch";
import { LocaleProvider } from "@/components/LocaleProvider";

function renderServicesPage() {
  return render(
    <LocaleProvider initialLocale="zh">
      <LangSwitch />
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

    const schemas = Array.from(
      container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
    ).map((node) => JSON.parse(node.textContent || "{}"));
    expect(schemas.some((schema) => schema["@type"] === "FAQPage")).toBe(true);
  });

  it("switches the full page copy from Chinese to English", () => {
    renderServicesPage();

    expect(
      screen.getByRole("heading", { name: "企业 AI 工作流系统设计与交付" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "切换到 English" }));

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
      "/contact"
    );
    expect(
      screen.queryByRole("heading", { name: "企业 AI 工作流系统设计与交付" })
    ).not.toBeInTheDocument();
  });
});
