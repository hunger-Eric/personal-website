"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Menu,
  User,
  Image as ImageIcon,
  Palette,
  FilePlus,
  ArrowLeft,
} from "lucide-react";
import { adminCopy } from "@/config/copy/admin";

const NAV_ITEMS = [
  {
    section: adminCopy.sidebar.general,
    items: [
      { href: "/admin", label: adminCopy.sidebar.dashboard, icon: LayoutDashboard },
      { href: "/admin/site", label: adminCopy.sidebar.site, icon: Settings },
      { href: "/admin/navbar", label: adminCopy.sidebar.navbar, icon: Menu },
      { href: "/admin/about", label: adminCopy.sidebar.about, icon: User },
      { href: "/admin/theme", label: adminCopy.sidebar.theme, icon: Palette },
    ],
  },
  {
    section: adminCopy.sidebar.content,
    items: [
      { href: "/admin/photography", label: adminCopy.sidebar.photography, icon: ImageIcon },
      { href: "/admin/pages", label: adminCopy.sidebar.pages, icon: FilePlus },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-surface-admin">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-control bg-accent text-sm font-bold text-accent-foreground"
          aria-label={adminCopy.common.backToSite}
        >
          F
        </Link>
        <div className="flex-1">
          <div className="text-sm font-semibold">{adminCopy.common.brand}</div>
          <div className="text-[11px] text-muted-foreground">{adminCopy.common.product}</div>
        </div>
        <Link
          href="/"
          className="rounded-control p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          title={adminCopy.common.backToSite}
          aria-label={adminCopy.common.backToSite}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((group) => (
          <div key={group.section} className="mb-4">
            <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.section}
            </div>
            {group.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-control px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-accent/10 font-medium text-accent"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 flex-none" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3 text-center text-[11px] text-muted-foreground">
        {adminCopy.sidebar.autoSaveHint}
      </div>
    </aside>
  );
}
