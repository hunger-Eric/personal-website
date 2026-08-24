"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LangSwitch } from "@/components/LangSwitch";
import { useLocale } from "@/components/LocaleProvider";
import { localizePublicPath } from "@/config/locale";
import { publicIdentity } from "@/config/public-identity";
const labels = { zh: { menu: "菜单", nav: "移动端主导航", services: "服务", projects: "项目库", articles: "文章", about: "关于", contact: "提交业务问题" }, en: { menu: "Menu", nav: "Mobile navigation", services: "Services", projects: "Projects", articles: "Articles", about: "About", contact: "Submit a business problem" } } as const;
export default function NavbarCenteredMobile() {
  const { locale } = useLocale(); const copy = labels[locale]; const [open, setOpen] = useState(false);
  const path = (value: string) => localizePublicPath(value, locale);
  useEffect(() => { if (!open) return; const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, [open]);
  const close = () => setOpen(false);
  return <header className="fixed inset-x-0 top-0 z-50 border-b border-hairline bg-surface-paper/95 backdrop-blur sm:hidden"><div className="flex h-16 items-center justify-between px-4"><Link href={path("/")} onClick={close} className="text-lg font-semibold tracking-[-0.03em] text-foreground">{publicIdentity.names[locale]}</Link><div className="flex items-center gap-1"><LangSwitch variant="ghost" /><button type="button" aria-label={copy.menu} aria-expanded={open} onClick={() => setOpen(v => !v)} className="inline-flex h-11 w-11 items-center justify-center text-foreground">{open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}</button></div></div>{open ? <div className="border-t border-hairline bg-surface-paper px-4 pb-5 pt-3 shadow-overlay"><nav aria-label={copy.nav} className="grid gap-1"><Link href={path("/services")} onClick={close} className="min-h-11 border-b border-hairline px-1 py-3 text-base font-medium text-foreground">{copy.services}</Link><Link href={path("/projects")} onClick={close} className="min-h-11 border-b border-hairline px-1 py-3 text-base font-medium text-foreground">{copy.projects}</Link><Link href={path("/articles")} onClick={close} className="min-h-11 border-b border-hairline px-1 py-3 text-base font-medium text-foreground">{copy.articles}</Link><Link href={path("/about")} onClick={close} className="min-h-11 border-b border-hairline px-1 py-3 text-base font-medium text-foreground">{copy.about}</Link><Link href={path("/contact")} onClick={close} className="mt-3 min-h-11 bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground">{copy.contact}</Link></nav></div> : null}</header>;
}
