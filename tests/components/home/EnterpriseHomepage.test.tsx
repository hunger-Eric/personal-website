// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EnterpriseHomepage } from "@/components/home/EnterpriseHomepage";
import { LocaleProvider } from "@/components/LocaleProvider";

function renderHomepage() {
  return render(
    <LocaleProvider initialLocale="zh">
      <EnterpriseHomepage />
    </LocaleProvider>
  );
}

describe("EnterpriseHomepage", () => {
  it("renders the approved problem, method, evidence, and contact path", () => {
    renderHomepage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /把重复、易错的人工流程/,
      })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "提交你的流程问题" })[0]
    ).toHaveAttribute("href", "/contact");
    expect(screen.getByText(/601 行/)).toBeInTheDocument();
    expect(screen.getByText("诊断现状")).toBeInTheDocument();
  });

  it("lets visitors switch the problem signal and case-theatre chapter", () => {
    renderHomepage();

    const systemSignal = screen.getByRole("button", { name: /多系统无法衔接/ });
    fireEvent.click(systemSignal);
    expect(systemSignal).toHaveAttribute("aria-pressed", "true");

    const outputTab = screen.getByRole("tab", { name: /最终交付什么/ });
    fireEvent.click(outputTab);
    expect(outputTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("企业结果表与多条公开联系方式补充表")).toBeInTheDocument();
  });
});
