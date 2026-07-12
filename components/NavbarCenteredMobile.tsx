"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { LangSwitch } from "@/components/LangSwitch";
import { useLocale } from "@/components/LocaleProvider";

const labels = {
  zh: { menu: "菜单", method: "服务方法", projects: "项目案例", about: "关于", contact: "提交流程问题" },
  en: { menu: "Menu", method: "Method", projects: "Cases", about: "About", contact: "Submit a workflow" },
} as const;

export default function NavbarCenteredMobile() {
  const { locale } = useLocale();
  const copy = labels[locale];
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-surface-paper/95 backdrop-blur sm:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/" onClick={close} className="text-lg font-semibold tracking-[-0.03em] text-foreground">fengc</Link>
        <div className="flex items-center gap-1">
          <LangSwitch variant="ghost" />
          <button type="button" aria-label={copy.menu} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center text-foreground">
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>
      {open ? (
        <div ref={panelRef} className="border-t border-hairline bg-surface-paper px-4 pb-5 pt-3 shadow-overlay">
          <nav aria-label="移动端主导航" className="grid gap-1">
            <Link href="/#method" onClick={close} className="border-b border-hairline px-1 py-3 text-base font-medium text-foreground">{copy.method}</Link>
            <Link href="/projects" onClick={close} className="border-b border-hairline px-1 py-3 text-base font-medium text-foreground">{copy.projects}</Link>
            <Link href="/about" onClick={close} className="border-b border-hairline px-1 py-3 text-base font-medium text-foreground">{copy.about}</Link>
            <Link href="/contact" onClick={close} className="mt-3 bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground">{copy.contact}</Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
