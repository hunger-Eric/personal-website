// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

type MockLinkProps = React.PropsWithChildren<{ href: string }>;
type MockImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

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

vi.mock("next/image", () => ({
  default: (props: MockImageProps) => React.createElement("img", props),
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
    t: {
      nav: {
        home: "Home",
        menu: "Menu",
        openMenu: "Toggle navigation menu",
        closeMenu: "Close navigation menu",
        mainMenu: "Main navigation",
        viewMore: "View more",
        about: "About",
        projects: "Projects",
        articles: "Articles",
        photography: "Photography",
        more: "More",
        connect: "Connect",
      },
    },
  }),
}));

// Mock navbar config
const mockNavbarConfig = {
  logo: { label: "FengC", href: "/", imageSrc: "", imageAlt: "Logo" },
  centerItems: [
    { id: "about", label: "About", href: "/#about", external: false },
    { id: "projects", label: "Projects", href: "/projects", external: false },
    { id: "articles", label: "Articles", href: "/articles", external: false },
  ],
  cta: {
    contact: {
      label: "Email me",
      href: "mailto:test@example.com",
      show: true,
      external: true,
    },
    primary: {
      label: "Hire me",
      href: "/contact",
      show: true,
      external: false,
    },
  },
};

vi.mock("@/config/navbarConfig", () => ({
  getNavbarConfig: () => mockNavbarConfig,
  isExternalHref: (href: string) =>
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:"),
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
    expect(screen.getByText("Method")).toBeInTheDocument();
    expect(screen.getByText("Cases")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.queryByText("Articles")).not.toBeInTheDocument();
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
    expect(screen.getByText("fengc")).toBeInTheDocument();
  });

  it("renders the contact CTA", async () => {
    const { NavbarCentered } = await import(
      "@/components/NavbarCenteredDesktop"
    );
    render(React.createElement(NavbarCentered));
    expect(screen.getByRole("link", { name: /Submit a workflow/i })).toHaveAttribute("href", "/contact");
  });
});
