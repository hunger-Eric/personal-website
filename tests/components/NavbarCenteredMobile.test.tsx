// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

type MockLinkProps = React.PropsWithChildren<{ href: string }>;

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: MockLinkProps) =>
    React.createElement("a", { href }, children),
}));

vi.mock("lucide-react", () => {
  const S = () => React.createElement("svg");
  return {
    ChevronDown: S,
    Menu: S,
    X: S,
    Mail: S,
    Handshake: S,
  };
});

vi.mock("@/components/LangSwitch", () => ({
  default: () =>
    React.createElement("div", { "data-testid": "lang-switch-mobile" }, "LS"),
  LangSwitch: () =>
    React.createElement("div", { "data-testid": "lang-switch-mobile" }, "LS"),
}));

vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({
    locale: "en",
  }),
}));

describe("NavbarCenteredMobile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a header element (default export)", async () => {
    const defaultExport = await import("@/components/NavbarCenteredMobile");
    const NavbarCenteredMobile = defaultExport.default;
    const { container } = render(React.createElement(NavbarCenteredMobile));
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
  });

  it("has sm:hidden class (mobile only)", async () => {
    const defaultExport = await import("@/components/NavbarCenteredMobile");
    const NavbarCenteredMobile = defaultExport.default;
    const { container } = render(React.createElement(NavbarCenteredMobile));
    const header = container.querySelector("header");
    expect(header?.className).toContain("sm:hidden");
  });

  it("renders a hamburger menu button with aria-label", async () => {
    const defaultExport = await import("@/components/NavbarCenteredMobile");
    const NavbarCenteredMobile = defaultExport.default;
    render(React.createElement(NavbarCenteredMobile));

    const hamburger = screen.getByLabelText("Menu");
    expect(hamburger).toBeInTheDocument();
    expect(hamburger.tagName).toBe("BUTTON");
  });

  it("includes the LangSwitch component", async () => {
    const defaultExport = await import("@/components/NavbarCenteredMobile");
    const NavbarCenteredMobile = defaultExport.default;
    render(React.createElement(NavbarCenteredMobile));
    expect(screen.getByTestId("lang-switch-mobile")).toBeInTheDocument();
  });

  it("displays the logo label", async () => {
    const defaultExport = await import("@/components/NavbarCenteredMobile");
    const NavbarCenteredMobile = defaultExport.default;
    render(React.createElement(NavbarCenteredMobile));
    expect(screen.getByText("实解智能")).toBeInTheDocument();
  });

  it("keeps the mobile header fixed and visible", async () => {
    const defaultExport = await import("@/components/NavbarCenteredMobile");
    const NavbarCenteredMobile = defaultExport.default;
    const { container } = render(React.createElement(NavbarCenteredMobile));
    const header = container.querySelector("header");
    expect(header?.className).toContain("fixed");
    expect(header?.className).toContain("top-0");
  });
});
