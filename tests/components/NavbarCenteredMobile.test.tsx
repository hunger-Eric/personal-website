// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

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
  default: ({ children, href }: any) =>
    React.createElement("a", { href }, children),
}));

vi.mock("next/image", () => ({
  default: (props: any) => React.createElement("img", props),
}));

vi.mock("lucide-react", () => {
  const S = () => React.createElement("svg");
  return {
    ChevronDown: S,
    Home: S,
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
    t: { nav: { connect: "Connect" } },
  }),
}));

// Mock navbar config
const mockNavbarConfig = {
  logo: { label: "FengC", href: "/", imageSrc: "", imageAlt: "Logo" },
  centerItems: [
    { id: "about", label: "About", href: "/#about", external: false },
    { id: "projects", label: "Projects", href: "/projects", external: false },
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
  navbarConfig: mockNavbarConfig,
  isExternalHref: (href: string) =>
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:"),
}));

vi.mock("@/config/siteConfig", () => ({
  siteConfig: {
    socialsFor: {
      footer: [
        { href: "https://github.com/test", label: "GitHub" },
        { href: "https://twitter.com/test", label: "Twitter" },
      ],
    },
  },
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

    const hamburger = screen.getByLabelText("Toggle navigation menu");
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
    expect(screen.getByText("FengC")).toBeInTheDocument();
  });

  it("renders desktop children hidden on mobile (sticky header)", async () => {
    const defaultExport = await import("@/components/NavbarCenteredMobile");
    const NavbarCenteredMobile = defaultExport.default;
    const { container } = render(React.createElement(NavbarCenteredMobile));
    const header = container.querySelector("header");
    expect(header?.className).toContain("sticky");
    expect(header?.className).toContain("top-0");
  });
});
