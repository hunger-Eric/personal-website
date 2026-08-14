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

import ContactPage from "@/app/contact/page";

describe("contact page", () => {
  it("groups direct email and WeChat beside the inquiry form", () => {
    render(<ContactPage />);

    expect(screen.getByRole("heading", { name: "直接联系" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "itheheda@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:itheheda@gmail.com"
    );
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /查看二维码/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "提交你的业务问题" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "业务问题提交表单" })).toBeInTheDocument();
  });
});
