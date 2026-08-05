// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children }: React.PropsWithChildren<{ href: string }>) => <a href={href}>{children}</a>,
}));
vi.mock("@/components/LocaleProvider", () => ({ useLocale: () => ({ locale: "en" }) }));

import { Footer } from "@/components/Footer";

describe("Footer English copy", () => {
  it("renders the enterprise routes in English", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: "Articles" })).toHaveAttribute("href", "/articles");
    expect(screen.getByRole("link", { name: "WeChat" })).toHaveAttribute("href", "/articles#wechat");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });
});
