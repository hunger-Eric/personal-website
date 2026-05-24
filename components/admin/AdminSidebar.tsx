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

const NAV_ITEMS = [
  {
    section: "General",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/site", label: "Site Settings", icon: Settings },
      { href: "/admin/navbar", label: "Navbar", icon: Menu },
      { href: "/admin/about", label: "About", icon: User },
      { href: "/admin/theme", label: "Theme", icon: Palette },
    ],
  },
  {
    section: "Content",
    items: [
      { href: "/admin/photography", label: "Photography", icon: ImageIcon },
      { href: "/admin/pages", label: "Custom Pages", icon: FilePlus },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-5">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white"
        >
          F
        </Link>
        <div className="flex-1">
          <div className="text-sm font-semibold">fengc</div>
          <div className="text-[11px] text-muted-foreground">Admin Panel</div>
        </div>
        <Link
          href="/"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
          title="Back to site"
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
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-[color:var(--accent-light)]/20 font-medium text-[color:var(--accent-hover)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
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

      <div className="border-t border-white/10 p-3 text-center text-[11px] text-muted-foreground">
        Saving changes pushes to GitHub automatically
      </div>
    </aside>
  );
}
