// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({
  Languages: (props: any) => React.createElement("svg", { ...props, "data-testid": "languages-icon" }),
}));

const mockToggleLocale = vi.fn();
const mockUseLocale = vi.fn(() => ({
  locale: "zh",
  toggleLocale: mockToggleLocale,
}));

vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => mockUseLocale(),
}));

describe("LangSwitch", () => {
  beforeEach(() => {
    mockToggleLocale.mockReset();
    mockUseLocale.mockReset();
    mockUseLocale.mockReturnValue({ locale: "zh", toggleLocale: mockToggleLocale });
  });

  it("renders a button", async () => {
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("displays 'EN' when locale is zh", async () => {
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("displays '中' when locale is en", async () => {
    mockUseLocale.mockReturnValue({ locale: "en", toggleLocale: mockToggleLocale });
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    expect(screen.getByText("中")).toBeInTheDocument();
  });

  it("has correct aria-label for zh locale", async () => {
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Switch to English");
  });

  it("has correct aria-label for en locale", async () => {
    mockUseLocale.mockReturnValue({ locale: "en", toggleLocale: mockToggleLocale });
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "切换到中文");
  });

  it("calls toggleLocale on click", async () => {
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    fireEvent.click(screen.getByRole("button"));
    expect(mockToggleLocale).toHaveBeenCalledTimes(1);
  });

  it("renders Languages icon", async () => {
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    expect(screen.getByTestId("languages-icon")).toBeInTheDocument();
  });
});
