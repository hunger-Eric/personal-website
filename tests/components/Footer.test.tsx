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
    expect(screen.getByText(/fengc · AI systems/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "项目案例" })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: "关于" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "联系" })).toHaveAttribute("href", "/contact");
    expect(screen.queryByLabelText(/instagram/i)).not.toBeInTheDocument();
  });

  it("renders the current year", () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
  });
});
