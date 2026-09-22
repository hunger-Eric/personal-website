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
  it("groups direct email, WhatsApp, Facebook, and WeChat beside the inquiry form", () => {
    render(<ContactPage />);

    expect(screen.getByRole("heading", { name: "直接联系" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "support@itheheda.online" })).toHaveAttribute(
      "href",
      "mailto:support@itheheda.online"
    );
    expect(screen.getByRole("link", { name: "发送邮件" })).toHaveAttribute("href", "mailto:support@itheheda.online");
    expect(screen.getByRole("link", { name: "通过 WhatsApp 联系：+86 166 0104 7692（在新标签页中打开）" })).toHaveAttribute(
      "href",
      "https://wa.me/8616601047692"
    );
    expect(screen.getByRole("link", { name: "查看 Facebook 主页：Chao Feng（在新标签页中打开）" })).toHaveAttribute(
      "href",
      "https://www.facebook.com/profile.php?id=61593959894033"
    );
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /查看二维码/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "提交你的业务问题" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "业务问题提交表单" })).toBeInTheDocument();
  });

  it("uses the configured direct-contact links on the English page", () => {
    render(<EnglishContactPage />);

    expect(screen.getByRole("link", { name: "support@itheheda.online" })).toHaveAttribute("href", "mailto:support@itheheda.online");
    expect(screen.getByRole("link", { name: "Send email" })).toHaveAttribute("href", "mailto:support@itheheda.online");
    expect(screen.getByRole("link", { name: "Contact via WhatsApp: +86 166 0104 7692 (opens in a new tab)" })).toHaveAttribute(
      "href",
      "https://wa.me/8616601047692"
    );
    expect(screen.getByRole("link", { name: "View Facebook profile: Chao Feng (opens in a new tab)" })).toHaveAttribute(
      "href",
      "https://www.facebook.com/profile.php?id=61593959894033"
    );
    expect(screen.getByRole("button", { name: /View QR code/ })).toBeInTheDocument();
  });
});
