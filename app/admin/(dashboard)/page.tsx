// app/admin/page.tsx
"use client";

import Link from "next/link";
import {
  Settings,
  Menu,
  User,
  Image as ImageIcon,
  Palette,
  FilePlus,
  Camera,
  ExternalLink,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const CARDS = [
  {
    href: "/admin/site",
    label: "站点设置",
    desc: "修改站点名称、标题、简介、社交链接",
    icon: Settings,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    href: "/admin/navbar",
    label: "导航栏",
    desc: "编辑导航菜单项、下拉菜单、CTA按钮",
    icon: Menu,
    color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    href: "/admin/about",
    label: "关于我",
    desc: "编辑个人简介、技术栈、个人故事",
    icon: User,
    color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    href: "/admin/theme",
    label: "主题配色",
    desc: "切换配色方案、明暗模式设置",
    icon: Palette,
    color: "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  },
  {
    href: "/admin/photography",
    label: "摄影作品",
    desc: "管理摄影项目、上传照片、设置公开/私密",
    icon: ImageIcon,
    color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    href: "/admin/pages",
    label: "自定义页面",
    desc: "创建和管理自定义页面，自由排版",
    icon: FilePlus,
    color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-bold">管理后台</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理你的个人网站 · 编辑后自动保存到 GitHub 并部署
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">{card.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
            </Link>
          ))}
        </div>

        {/* Quick stats */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-semibold">快捷链接</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/photography"
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Camera className="h-4 w-4" />
              摄影主页
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              网站首页
              <ExternalLink className="h-3 w-3" />
            </Link>
            <a
              href="https://github.com/hunger-Eric/personal-website"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              GitHub 仓库
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}