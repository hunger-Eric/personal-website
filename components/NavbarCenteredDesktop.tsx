"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { LangSwitch } from "@/components/LangSwitch";
import { useLocale } from "@/components/LocaleProvider";

const labels = {
  zh: { method: "服务方法", projects: "项目案例", about: "关于", contact: "提交流程问题" },
  en: { method: "Method", projects: "Cases", about: "About", contact: "Submit a workflow" },
} as const;

export function NavbarCentered() {
  const { locale } = useLocale();
  const copy = labels[locale];

  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-hairline bg-surface-paper/95 backdrop-blur sm:block">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-baseline gap-2 text-foreground">
          <span className="text-lg font-semibold tracking-[-0.03em]">fengc</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">AI systems</span>
        </Link>
        <nav aria-label="主导航" className="flex items-center gap-1">
          <Link href="/#method" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{copy.method}</Link>
          <Link href="/projects" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{copy.projects}</Link>
          <Link href="/about" className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{copy.about}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitch variant="ghost" />
          <Link href="/contact" className="inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover">
            {copy.contact}<ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
