"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LangSwitch } from "@/components/LangSwitch";
import { useLocale } from "@/components/LocaleProvider";
import { localizePublicPath } from "@/config/locale";
import { publicIdentity } from "@/config/public-identity";

const labels = {
  zh: { subtitle: "企业 AI 系统设计与交付", nav: "主导航", services: "服务", projects: "项目库", articles: "文章", about: "关于", contact: "提交业务问题" },
  en: { subtitle: "Enterprise AI system design and delivery", nav: "Main navigation", services: "Services", projects: "Projects", articles: "Articles", about: "About", contact: "Submit a business problem" },
} as const;

export function NavbarCentered() {
  const { locale } = useLocale();
  const copy = labels[locale];
  const path = (value: string) => localizePublicPath(value, locale);
  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-hairline bg-surface-paper/95 backdrop-blur sm:block">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4">
        <Link href={path("/")} className="flex items-baseline gap-2 text-foreground"><span className="text-lg font-semibold tracking-[-0.03em]">{publicIdentity.names[locale]}</span><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{copy.subtitle}</span></Link>
        <nav aria-label={copy.nav} className="flex items-center gap-1">
          <Link href={path("/services")} className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{copy.services}</Link>
          <Link href={path("/projects")} className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{copy.projects}</Link>
          <Link href={path("/articles")} className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{copy.articles}</Link>
          <Link href={path("/about")} className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{copy.about}</Link>
        </nav>
        <div className="flex items-center gap-3"><LangSwitch variant="ghost" /><Link href={path("/contact")} className="inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover">{copy.contact}<ArrowUpRight className="h-4 w-4" aria-hidden /></Link></div>
      </div>
    </header>
  );
}
