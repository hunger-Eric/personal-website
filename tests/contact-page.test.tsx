// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({ locale: "zh" }),
}));

import ContactPage from "@/app/(site-zh)/contact/page";
import EnglishContactPage from "@/app/(site-en)/en/contact/page";

describe("contact page", () => {
  it("groups direct email and WeChat beside the inquiry form", () => {
    render(<ContactPage />);

    expect(screen.getByRole("heading", { name: "直接联系" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "support@itheheda.online" })).toHaveAttribute(
      "href",
      "mailto:support@itheheda.online"
    );
    expect(screen.getByRole("link", { name: "发送邮件" })).toHaveAttribute("href", "mailto:support@itheheda.online");
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /查看二维码/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "提交你的业务问题" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "业务问题提交表单" })).toBeInTheDocument();
  });

  it("uses the support mailbox for both English direct-contact links", () => {
    render(<EnglishContactPage />);

    expect(screen.getByRole("link", { name: "support@itheheda.online" })).toHaveAttribute("href", "mailto:support@itheheda.online");
    expect(screen.getByRole("link", { name: "Send email" })).toHaveAttribute("href", "mailto:support@itheheda.online");
  });
});
