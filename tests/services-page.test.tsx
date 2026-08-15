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
    expect(screen.getByRole("link", { name: /Submit a business problem/ })).toHaveAttribute(
      "href",
      "/contact"
    );
    expect(
      screen.queryByRole("heading", { name: "企业 AI 工作流系统设计与交付" })
    ).not.toBeInTheDocument();
  });
});
