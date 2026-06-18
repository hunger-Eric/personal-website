// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React, { type AnchorHTMLAttributes, type ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminCopy } from "@/config/copy/admin";

const mockUsePathname = vi.fn();

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock("lucide-react", () => {
  const Icon = ({ className }: { className?: string }) =>
    React.createElement("svg", { className });
  return {
    LayoutDashboard: Icon,
    Settings: Icon,
    Menu: Icon,
    User: Icon,
    Image: Icon,
    Palette: Icon,
    FilePlus: Icon,
    ArrowLeft: Icon,
  };
});

const navGroups = [
  {
    section: adminCopy.sidebar.general,
    items: [
      { href: "/admin", label: adminCopy.sidebar.dashboard },
      { href: "/admin/site", label: adminCopy.sidebar.site },
      { href: "/admin/navbar", label: adminCopy.sidebar.navbar },
      { href: "/admin/about", label: adminCopy.sidebar.about },
      { href: "/admin/theme", label: adminCopy.sidebar.theme },
    ],
  },
  {
    section: adminCopy.sidebar.content,
    items: [
      { href: "/admin/photography", label: adminCopy.sidebar.photography },
      { href: "/admin/pages", label: adminCopy.sidebar.pages },
    ],
  },
];

function getNavLinkByLabel(label: string): HTMLAnchorElement {
  const link = screen.getByText(label).closest("a");
  if (!link) throw new Error(`No anchor found for ${label}`);
  return link;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUsePathname.mockReturnValue("/admin");
});

describe("AdminSidebar", () => {
  it("renders copy-driven section headings and nav item hrefs", () => {
    render(<AdminSidebar />);

    for (const group of navGroups) {
      expect(screen.getByText(group.section)).toBeInTheDocument();
      for (const item of group.items) {
        expect(getNavLinkByLabel(item.label)).toHaveAttribute("href", item.href);
      }
    }
  });

  it("highlights dashboard only for the exact admin index", () => {
    mockUsePathname.mockReturnValue("/admin");
    render(<AdminSidebar />);

    const link = getNavLinkByLabel(adminCopy.sidebar.dashboard);
    expect(link.className).toContain("bg-accent/10");
    expect(link.className).toContain("text-accent");
  });

  it("supports prefix matching on non-dashboard sections", () => {
    mockUsePathname.mockReturnValue("/admin/site/extra");
    render(<AdminSidebar />);

    expect(getNavLinkByLabel(adminCopy.sidebar.site).className).toContain("bg-accent/10");
    expect(getNavLinkByLabel(adminCopy.sidebar.dashboard).className).not.toContain(
      "bg-accent/10"
    );
  });

  it("shows admin workbench identity and copy-driven footer text", () => {
    render(<AdminSidebar />);

    expect(screen.getByText(adminCopy.common.brand)).toBeInTheDocument();
    expect(screen.getByText(adminCopy.common.product)).toBeInTheDocument();
    expect(screen.getByText(adminCopy.sidebar.autoSaveHint)).toBeInTheDocument();
  });

  it("renders accessible back-to-site links", () => {
    render(<AdminSidebar />);

    const links = screen.getAllByLabelText(adminCopy.common.backToSite);
    expect(links).toHaveLength(2);
    links.forEach((link) => expect(link).toHaveAttribute("href", "/"));
  });

  it("does not reintroduce template radius or raw accent color classes", () => {
    const { container } = render(<AdminSidebar />);

    expect(container.innerHTML).not.toContain(["rounded", "lg"].join("-"));
    expect(container.innerHTML).not.toContain("var(--accent-light)");
    expect(container.innerHTML).not.toContain("var(--accent-hover)");
  });
});
