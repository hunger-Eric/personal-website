// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// ── Mock next/navigation ────────────────────────────────────────────────────
const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// ── Navigation config matching the component's NAV_ITEMS ────────────────────
const NAV_GROUPS: { section: string; items: { href: string; label: string }[] }[] = [
  {
    section: "通用",
    items: [
      { href: "/admin", label: "仪表盘" },
      { href: "/admin/site", label: "站点设置" },
      { href: "/admin/navbar", label: "导航栏" },
      { href: "/admin/about", label: "关于我" },
      { href: "/admin/theme", label: "主题配色" },
    ],
  },
  {
    section: "内容",
    items: [
      { href: "/admin/photography", label: "摄影作品" },
      { href: "/admin/pages", label: "自定义页面" },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function getAllNavLinks(): HTMLAnchorElement[] {
  return screen.getAllByRole("link");
}

function getNavLinkByLabel(label: string): HTMLAnchorElement {
  const link = screen.getByText(label);
  const anchor = link.closest("a");
  if (!anchor) throw new Error(`No anchor found for label "${label}"`);
  return anchor;
}

/** Check if a link has the active nav item class (exact match, not substring) */
function isActiveLink(link: HTMLAnchorElement): boolean {
  const cls = link.className;
  // Active nav links have bg-amber-50 as a WORD in the className (not bg-amber-500)
  return cls.includes("bg-amber-50 ") || cls.includes("bg-amber-50 dark");
}

// ── Before each ──────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  // Default pathname — most tests don't care
  mockUsePathname.mockReturnValue("/admin");
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe("AdminSidebar", () => {
  // ──────── 1. Renders all nav items ────────
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

    it("renders the correct total number of navigable links", () => {
      render(<AdminSidebar />);

      // 7 nav links + 2 links in the logo area (the "F" logo + back arrow)
      // The logo "F" is wrapped in a Link, "fengc" / "管理后台" are plain text
      // Back arrow is also a Link
      const totalNavItems = NAV_GROUPS.reduce((sum, g) => sum + g.items.length, 0);
      // Logo link + back-to-site link = 2 extra
      const links = getAllNavLinks();
      expect(links).toHaveLength(totalNavItems + 2);
    });
  });

  // ──────── 2. Active state highlighting ────────
  describe("active state highlighting", () => {
    it("highlights dashboard when pathname is /admin", () => {
      mockUsePathname.mockReturnValue("/admin");
      render(<AdminSidebar />);

      const link = getNavLinkByLabel("仪表盘");
      expect(isActiveLink(link)).toBe(true);
      expect(link.className).toContain("font-medium");
      expect(link.className).toContain("text-amber-700");
    });

    it("highlights site settings when pathname is /admin/site", () => {
      mockUsePathname.mockReturnValue("/admin/site");
      render(<AdminSidebar />);

      const link = getNavLinkByLabel("站点设置");
      expect(isActiveLink(link)).toBe(true);
    });

    it("highlights photography when pathname is /admin/photography", () => {
      mockUsePathname.mockReturnValue("/admin/photography");
      render(<AdminSidebar />);

      const link = getNavLinkByLabel("摄影作品");
      expect(isActiveLink(link)).toBe(true);
    });

    it("does NOT highlight dashboard when on a sub-route like /admin/site", () => {
      mockUsePathname.mockReturnValue("/admin/site");
      render(<AdminSidebar />);

      const link = getNavLinkByLabel("仪表盘");
      expect(isActiveLink(link)).toBe(false);
      expect(link.className).toContain("text-muted-foreground");
    });

    it("does NOT highlight other items when dashboard is active", () => {
      mockUsePathname.mockReturnValue("/admin");
      render(<AdminSidebar />);

      for (const group of NAV_GROUPS) {
        for (const item of group.items) {
          if (item.href === "/admin") continue;
          const link = getNavLinkByLabel(item.label);
          expect(isActiveLink(link)).toBe(false);
          expect(link.className).toContain("text-muted-foreground");
        }
      }
    });

    it("applies prefix matching — /admin/site/extra still highlights 站点设置", () => {
      mockUsePathname.mockReturnValue("/admin/site/extra");
      render(<AdminSidebar />);

      const link = getNavLinkByLabel("站点设置");
      expect(isActiveLink(link)).toBe(true);
    });

    it("does NOT apply prefix matching to dashboard (exact match only)", () => {
      mockUsePathname.mockReturnValue("/admin/foo");
      render(<AdminSidebar />);

      const link = getNavLinkByLabel("仪表盘");
      expect(isActiveLink(link)).toBe(false);
    });

    it("only one item is active at a time", () => {
      mockUsePathname.mockReturnValue("/admin/theme");
      render(<AdminSidebar />);

      const links = getAllNavLinks();
      const activeLinks = links.filter((l) => isActiveLink(l));
      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveTextContent("主题配色");
    });

    it("highlights nothing when on a non-admin route", () => {
      mockUsePathname.mockReturnValue("/some-other-page");
      render(<AdminSidebar />);

      const links = getAllNavLinks();
      const activeLinks = links.filter((l) => isActiveLink(l));
      expect(activeLinks).toHaveLength(0);
    });
  });

  // ──────── 3. Logo and branding display ────────
  describe("logo and branding", () => {
    beforeEach(() => {
      render(<AdminSidebar />);
    });

    it("displays the 'F' logo letter", () => {
      expect(screen.getByText("F")).toBeInTheDocument();
    });

    it("wraps the logo in a link to '/'", () => {
      const logoLink = screen.getByText("F").closest("a");
      expect(logoLink).toHaveAttribute("href", "/");
    });

    it("displays the site nickname 'fengc'", () => {
      expect(screen.getByText("fengc")).toBeInTheDocument();
    });

    it("displays the subtitle '管理后台'", () => {
      expect(screen.getByText("管理后台")).toBeInTheDocument();
    });
  });

  // ──────── 4. Footer text ────────
  describe("footer", () => {
    it("renders the GitHub auto-push hint text", () => {
      render(<AdminSidebar />);
      expect(screen.getByText("保存后自动推送到 GitHub")).toBeInTheDocument();
    });

    it("positions footer at the bottom of the sidebar", () => {
      const { container } = render(<AdminSidebar />);
      // The footer is the last child of the <aside>
      const aside = container.querySelector("aside");
      const footerDiv = aside?.querySelector(".border-t");
      expect(footerDiv).toBeInTheDocument();
      expect(footerDiv?.textContent).toBe("保存后自动推送到 GitHub");
    });
  });

  // ──────── 5. Back to site link ────────
  describe("back to site link", () => {
    beforeEach(() => {
      render(<AdminSidebar />);
    });

    it("renders a link with title '返回网站'", () => {
      const backLink = screen.getByTitle("返回网站");
      expect(backLink).toBeInTheDocument();
    });

    it("links to '/'", () => {
      const backLink = screen.getByTitle("返回网站");
      expect(backLink).toHaveAttribute("href", "/");
    });

    it("has an ArrowLeft icon inside the back link", () => {
      const backLink = screen.getByTitle("返回网站");
      // lucide-react's ArrowLeft renders as an <svg> with class containing "lucide-arrow-left"
      const svg = backLink.querySelector("svg.lucide-arrow-left");
      expect(svg).toBeInTheDocument();
    });
  });

  // ──────── Edge cases ────────
  describe("edge cases", () => {
    it("renders successfully with an empty pathname", () => {
      mockUsePathname.mockReturnValue("");
      render(<AdminSidebar />);

      // Should not crash; dashboard should not be active (exact match only)
      const link = getNavLinkByLabel("仪表盘");
      expect(link.className).not.toContain("bg-amber-50");
    });

    it("renders successfully with a deeply nested admin path", () => {
      mockUsePathname.mockReturnValue("/admin/site/seo/settings");
      render(<AdminSidebar />);

      // Prefix matching should highlight 站点设置
      const link = getNavLinkByLabel("站点设置");
      expect(link.className).toContain("bg-amber-50");
    });
  });
});
