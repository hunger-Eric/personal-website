"use client";

import Link from "next/link";

import { useLocale } from "@/components/LocaleProvider";

export function Footer() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  return (
    <footer className="border-t border-hairline bg-surface-paper text-surface-paper-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-lg font-semibold tracking-tight text-foreground">fengc · AI systems</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {zh ? "从真实业务流程出发，设计并交付可运行、可审核、可恢复的 AI 自动化系统。" : "Designing and delivering working, reviewable, recoverable AI automation systems from real business workflows."}
          </p>
        </div>
        <nav aria-label={zh ? "页脚导航" : "Footer navigation"} className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground">{zh ? "项目案例" : "Cases"}</Link>
          <Link href="/about" className="hover:text-foreground">{zh ? "关于" : "About"}</Link>
          <Link href="/contact" className="hover:text-foreground">{zh ? "联系" : "Contact"}</Link>
        </nav>
      </div>
      <div className="border-t border-hairline px-4 py-4 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        © {new Date().getFullYear()} fengc · {zh ? "企业 AI 自动化系统设计与交付" : "Enterprise AI automation systems"}
      </div>
    </footer>
  );
}
