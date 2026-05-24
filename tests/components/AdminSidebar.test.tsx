// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const NAV_GROUPS: { section: string; items: { href: string; label: string }[] }[] = [
  {
    section: "General",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/site", label: "Site Settings" },
      { href: "/admin/navbar", label: "Navbar" },
      { href: "/admin/about", label: "About" },
      { href: "/admin/theme", label: "Theme" },
    ],
  },
  {
    section: "Content",
    items: [
      { href: "/admin/photography", label: "Photography" },
      { href: "/admin/pages", label: "Custom Pages" },
    ],
  },
];

function getAllNavLinks(): HTMLAnchorElement[] {
  return screen.getAllByRole("link");
}

function getNavLinkByLabel(label: string): HTMLAnchorElement {
  const link = screen.getByText(label);
  const anchor = link.closest("a");
  if (!anchor) throw new Error(`No anchor found for label "${label}"`);
  return anchor;
}

function isActiveLink(link: HTMLAnchorElement): boolean {
  const cls = link.className;
  return cls.includes("bg-[color:var(--accent-light)]/20");
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUsePathname.mockReturnValue("/admin");
});

describe("AdminSidebar", () => {
  describe("navigation items", () => {
    it("renders all section headings", () => {
      render(<AdminSidebar />);
      for (const group of NAV_GROUPS) {
        expect(screen.getByText(group.section)).toBeInTheDocument();
      }
    });

    it("renders all nav item labels with correct hrefs", () => {
      render(<AdminSidebar />);
      for (const group of NAV_GROUPS) {
        for (const item of group.items) {
          const anchor = getNavLinkByLabel(item.label);
          expect(anchor).toHaveAttribute("href", item.href);
        }
      }
    });
  });

  describe("active state highlighting", () => {
    it("highlights dashboard when pathname is /admin", () => {
      mockUsePathname.mockReturnValue("/admin");
      render(<AdminSidebar />);
      const link = getNavLinkByLabel("Dashboard");
      expect(isActiveLink(link)).toBe(true);
    });

    it("supports prefix matching on non-dashboard items", () => {
      mockUsePathname.mockReturnValue("/admin/site/extra");
      render(<AdminSidebar />);
      const link = getNavLinkByLabel("Site Settings");
      expect(isActiveLink(link)).toBe(true);
    });
  });

  describe("branding and footer", () => {
    it("shows brand and footer text", () => {
      render(<AdminSidebar />);
      expect(screen.getByText("fengc")).toBeInTheDocument();
      expect(
        screen.getByText("Saving changes pushes to GitHub automatically")
      ).toBeInTheDocument();
    });

    it("renders back link", () => {
      render(<AdminSidebar />);
      const backLink = screen.getByTitle("Back to site");
      expect(backLink).toHaveAttribute("href", "/");
    });
  });
});
