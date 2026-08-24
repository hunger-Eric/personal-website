// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("lucide-react", () => ({
  Languages: (props: any) => React.createElement("svg", { ...props, "data-testid": "languages-icon" }),
}));

const mockSetLocale = vi.fn();
const mockUseLocale = vi.fn(() => ({
  locale: "zh" as "zh" | "en",
  setLocale: mockSetLocale,
}));

vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => mockUseLocale(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/services",
}));

describe("LangSwitch", () => {
  beforeEach(() => {
    mockSetLocale.mockReset();
    mockUseLocale.mockReset();
    mockUseLocale.mockReturnValue({ locale: "zh", setLocale: mockSetLocale });
  });

  it("renders a real English URL link", async () => {
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    expect(screen.getByRole("link")).toHaveAttribute("href", "/en/services");
  });

  it("displays 'EN' when locale is zh", async () => {
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("displays '中' when locale is en", async () => {
    mockUseLocale.mockReturnValue({ locale: "en", setLocale: mockSetLocale });
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    expect(screen.getByText("中")).toBeInTheDocument();
  });

  it("has correct aria-label for zh locale", async () => {
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    expect(screen.getByRole("link")).toHaveAttribute("aria-label", "切换到 English");
  });

  it("has correct aria-label for en locale", async () => {
    mockUseLocale.mockReturnValue({ locale: "en", setLocale: mockSetLocale });
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    expect(screen.getByRole("link")).toHaveAttribute("aria-label", "Switch to 中文");
  });

  it("persists the target locale on click", async () => {
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    fireEvent.click(screen.getByRole("link"));
    expect(mockSetLocale).toHaveBeenCalledWith("en");
  });

  it("renders Languages icon", async () => {
    const { LangSwitch } = await import("@/components/LangSwitch");
    render(React.createElement(LangSwitch));
    expect(screen.getByTestId("languages-icon")).toBeInTheDocument();
  });
});
