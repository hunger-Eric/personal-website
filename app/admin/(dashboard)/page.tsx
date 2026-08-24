// app/admin/page.tsx
"use client";

import Link from "next/link";
import {
  FilePenLine,
  Radar,
  ExternalLink,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ActionButton, Surface } from "@/components/system";
import { adminCopy } from "@/config/copy/admin";

const CARDS = [
  {
    href: "/admin/articles",
    label: adminCopy.dashboard.cards.articles.label,
    desc: adminCopy.dashboard.cards.articles.description,
    icon: FilePenLine,
  },
  {
    href: "/admin/crawlers/human",
    label: adminCopy.dashboard.cards.crawlers.label,
    desc: adminCopy.dashboard.cards.crawlers.description,
    icon: Radar,
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background pl-64">
      <AdminSidebar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-bold">{adminCopy.dashboard.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {adminCopy.dashboard.description}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-card border border-border bg-surface-paper p-5 transition-colors hover:bg-muted"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-control border border-border bg-background text-accent">
                <card.icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">{card.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
            </Link>
          ))}
        </div>

        <Surface tone="admin" className="mt-12 p-6">
          <h2 className="mb-4 font-semibold">
            {adminCopy.dashboard.quickLinks.title}
          </h2>
          <div className="flex flex-wrap gap-3">
            <ActionButton
              href="/"
              tone="secondary"
            >
              {adminCopy.dashboard.quickLinks.website}
              <ExternalLink className="h-3 w-3" />
            </ActionButton>
            <a
              href="https://github.com/hunger-Eric/personal-website"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-control border border-border bg-surface-paper px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {adminCopy.dashboard.quickLinks.github}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </Surface>
      </main>
    </div>
  );
}
