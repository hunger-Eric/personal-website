// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({ default: ({ href, children }: React.PropsWithChildren<{ href: string }>) => <a href={href}>{children}</a> }));
vi.mock("@/components/LocaleProvider", () => ({ useLocale: () => ({ locale: "zh" }) }));

import { Footer } from "@/components/Footer";

describe("Footer", () => {
  it("keeps only enterprise public navigation", () => {
    render(<Footer />);
    expect(screen.getByText("实解智能")).toBeInTheDocument();
    expect(screen.getByText("企业 AI 系统设计与交付")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "项目库" })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: "文章" })).toHaveAttribute("href", "/articles");
    expect(screen.getByRole("link", { name: "公众号" })).toHaveAttribute("href", "/articles#wechat");
    expect(screen.getByRole("link", { name: "联系" })).toHaveAttribute("href", "/contact");
    expect(screen.queryByLabelText(/instagram/i)).not.toBeInTheDocument();
  });

  it("renders the current year", () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
  });
});
