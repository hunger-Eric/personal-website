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
    Handshake: S,
    ArrowUpRight: S,
  };
});

vi.mock("@/components/LangSwitch", () => ({
  LangSwitch: () =>
    React.createElement("div", { "data-testid": "lang-switch" }, "LangSwitch"),
}));

vi.mock("@/components/LocaleProvider", () => ({
  useLocale: () => ({
    locale: "en",
  }),
}));

describe("NavbarCentered", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a header element", async () => {
    const { NavbarCentered } = await import(
      "@/components/NavbarCenteredDesktop"
    );
    const { container } = render(React.createElement(NavbarCentered));
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
  });

  it("has hidden sm:block class (desktop only)", async () => {
    const { NavbarCentered } = await import(
      "@/components/NavbarCenteredDesktop"
    );
    const { container } = render(React.createElement(NavbarCentered));
    const header = container.querySelector("header");
    expect(header?.className).toContain("hidden");
    expect(header?.className).toContain("sm:block");
  });

  it("renders the enterprise decision-path navigation", async () => {
    const { NavbarCentered } = await import(
      "@/components/NavbarCenteredDesktop"
    );
    render(React.createElement(NavbarCentered));

    // Check for each nav item label
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute("href", "/en/services");
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Articles")).toBeInTheDocument();
  });

  it("includes the LangSwitch component", async () => {
    const { NavbarCentered } = await import(
      "@/components/NavbarCenteredDesktop"
    );
    render(React.createElement(NavbarCentered));
    expect(screen.getByTestId("lang-switch")).toBeInTheDocument();
  });

  it("displays the logo label", async () => {
    const { NavbarCentered } = await import(
      "@/components/NavbarCenteredDesktop"
    );
    render(React.createElement(NavbarCentered));
    expect(screen.getByText("SolveReal Systems")).toBeInTheDocument();
    expect(screen.getByText("Enterprise AI system design and delivery")).toBeInTheDocument();
  });

  it("renders the contact CTA", async () => {
    const { NavbarCentered } = await import(
      "@/components/NavbarCenteredDesktop"
    );
    render(React.createElement(NavbarCentered));
    expect(screen.getByRole("link", { name: /Submit a business problem/i })).toHaveAttribute("href", "/en/contact");
  });
});
