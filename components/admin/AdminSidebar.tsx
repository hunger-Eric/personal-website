// components/admin/AdminSidebar.tsx
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
    section: "通用",
    items: [
      { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
      { href: "/admin/site", label: "站点设置", icon: Settings },
      { href: "/admin/navbar", label: "导航栏", icon: Menu },
      { href: "/admin/about", label: "关于我", icon: User },
      { href: "/admin/theme", label: "主题配色", icon: Palette },
    ],
  },
  {
    section: "内容",
    items: [
      { href: "/admin/photography", label: "摄影作品", icon: ImageIcon },
      { href: "/admin/pages", label: "自定义页面", icon: FilePlus },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo area */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-white"
        >
          F
        </Link>
        <div className="flex-1">
          <div className="text-sm font-semibold">fengc</div>
          <div className="text-[11px] text-muted-foreground">管理后台</div>
        </div>
        <Link
          href="/"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="返回网站"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      {/* Navigation */}
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
                      ? "bg-amber-50 font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
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

      {/* Footer */}
      <div className="border-t border-border p-3 text-center text-[11px] text-muted-foreground">
        保存后自动推送到 GitHub
      </div>
    </aside>
  );
}