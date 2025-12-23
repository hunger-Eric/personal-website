// components/NavbarCenteredMobile.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  siteConfig,
  type NavItemCfg,
  type NavDropdownItemCfg,
  type NavDropdownFooterCfg,
} from "../config/siteConfig";
import { ChevronDown } from "lucide-react";

type NavItem = {
  key: string;
  id: string;
  label: string;
  href: string;
  external: boolean;
  isButton: boolean;
  children?: NavDropdownItemCfg[];
  dropdownFooter?: NavDropdownFooterCfg;
};

export default function NavbarCenteredMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  const navCfg = (siteConfig as any).nav as
    | { items?: NavItemCfg[] }
    | undefined;

  const visibleItems: NavItem[] = useMemo(() => {
    if (Array.isArray(navCfg?.items) && navCfg!.items.length > 0) {
      return navCfg!.items
        .filter((it) => it?.show !== false)
        .map((it) => {
          const id = it.id ?? "";
          const label =
            it.label ??
            (id ? id.charAt(0).toUpperCase() + id.slice(1) : "Link");

          const href =
            typeof it.href === "string" ? it.href : id ? `#${id}` : "";

          const external =
            it.external ??
            (href.startsWith("http") ||
              href.startsWith("mailto:") ||
              href.startsWith("tel:"));
          const isButton = !!it.isButton;

          return {
            key: id || href || label,
            id,
            label,
            href,
            external,
            isButton,
            children: it.children ?? [],
            dropdownFooter: it.dropdownFooter,
          };
        });
    }

    const defaults: { id: keyof typeof siteConfig.sections; label: string }[] =
      [
        { id: "about", label: "About" },
        { id: "education", label: "Education" },
        { id: "experience", label: "Experience" },
        { id: "projects", label: "Projects" },
        { id: "blog", label: "Articles" },
        { id: "youtube", label: "YouTube" },
        { id: "certifications", label: "Certifications" },
      ];

    const items: NavItem[] = defaults
      .filter((d) => siteConfig.sections[d.id])
      .map((d) => ({
        key: d.id,
        id: d.id,
        label: d.label,
        href: `#${d.id}`,
        external: false,
        isButton: false,
        children: [],
        dropdownFooter: undefined,
      }));

    if (siteConfig.sections.resume) {
      items.push({
        key: "resume",
        id: "resume",
        label: "My Resume",
        href: "/resume",
        external: true,
        isButton: true,
        children: [],
        dropdownFooter: undefined,
      });
    }

    return items;
  }, [navCfg]);

  const contactItem = visibleItems.find((i) => {
    const label = i.label.toLowerCase();
    return (
      i.id === "contact" ||
      label === "contact" ||
      label === "contact me" ||
      i.href === "#contact"
    );
  });

  const resumeItem = visibleItems.find(
    (i) =>
      i.id === "resume" ||
      i.label.toLowerCase().includes("resume") ||
      i.href === "/resume"
  );

  const contactLink: NavItem = contactItem ?? {
    key: "contact",
    id: "contact",
    label: "Contact Me",
    href: "#contact",
    external: false,
    isButton: true,
    children: [],
    dropdownFooter: undefined,
  };

  const resumeLink: NavItem = resumeItem ?? {
    key: "resume",
    id: "resume",
    label: "My Resume",
    href: "/resume",
    external: true,
    isButton: true,
    children: [],
    dropdownFooter: undefined,
  };

  const menuLinks = visibleItems.filter((i) => {
    if (i.isButton) return false;
    if (i.id === contactLink.id || i.id === resumeLink.id) return false;
    return true;
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on outside click + meaningful scroll (no “insta close”)
  useEffect(() => {
    if (!isOpen) return;

    const openedAt = Date.now();
    const openedY = window.scrollY;

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;

      if (panelRef.current?.contains(t) || toggleRef.current?.contains(t))
        return;
      setIsOpen(false);
    };

    const onScroll = () => {
      const dt = Date.now() - openedAt;
      const dy = Math.abs(window.scrollY - openedY);
      if (dt < 250) return;
      if (dy > 12) setIsOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setOpenKey(null);
  }, [isOpen]);

  const headerBg = scrolled ? "bg-background/92" : "bg-background/80";

  return (
    <header
      className={[
        "sm:hidden",
        "sticky top-0 z-[9999] isolate border-b border-white/10",
        headerBg,
        "backdrop-blur supports-[backdrop-filter]:backdrop-blur",
        "transition-colors",
      ].join(" ")}
    >
      {/* Top bar */}
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-3 py-4">
          <Link
            href="/"
            className="group flex flex-1 items-center gap-2 transition active:scale-95"
            onClick={() => setIsOpen(false)}
          >
            <Image
              src="/images/favicon.png"
              alt="kevintrinh.dev logo"
              width={24}
              height={24}
              className="shrink-0 rounded-sm"
            />
            <span className="text-base font-semibold leading-none tracking-tight text-slate-50">
              kevintrinh.dev
            </span>
          </Link>

          {/* Hamburger (no outline box) */}
          <button
            ref={toggleRef}
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((v) => !v)}
            className="relative inline-flex h-10 w-10 items-center justify-center text-white"
          >
            <span className="relative block h-5 w-6">
              <span
                className={[
                  "absolute left-0 top-0 block h-0.5 w-6 rounded bg-white transition-all duration-200",
                  isOpen ? "translate-y-2 rotate-45" : "translate-y-0 rotate-0",
                ].join(" ")}
              />
              <span
                className={[
                  "absolute left-0 top-2 block h-0.5 w-6 rounded bg-white transition-all duration-200",
                  isOpen ? "opacity-0" : "opacity-100",
                ].join(" ")}
              />
              <span
                className={[
                  "absolute left-0 top-4 block h-0.5 w-6 rounded bg-white transition-all duration-200",
                  isOpen
                    ? "-translate-y-2 -rotate-45"
                    : "translate-y-0 rotate-0",
                ].join(" ")}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Slide-down menu (NOT inside a separate rounded “card” container) */}
      <div
        className={[
          "sm:hidden overflow-hidden transition-all duration-200 ease-out",
          isOpen ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div
          ref={panelRef}
          className={[
            "border-t border-white/10",
            "bg-slate-950/95",
            "shadow-lg shadow-slate-950/30",
            "backdrop-blur supports-[backdrop-filter]:backdrop-blur",
          ].join(" ")}
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-3">
            <nav className="flex flex-col gap-1">
              {menuLinks.map((item) => {
                const hasChildren = !!(
                  item.children && item.children.length > 0
                );
                const isItemOpen = openKey === item.key;

                if (!hasChildren) {
                  return (
                    <a
                      key={item.key}
                      href={item.href || undefined}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                      onClick={() => setIsOpen(false)}
                      className="rounded-md px-3 py-2 text-[1rem] font-semibold text-slate-100 transition hover:bg-white/5 hover:text-white"
                    >
                      {item.label}
                    </a>
                  );
                }

                return (
                  <div key={item.key} className="rounded-md">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenKey((k) => (k === item.key ? null : item.key))
                      }
                      aria-expanded={isItemOpen}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-[1rem] font-semibold text-slate-100 transition hover:bg-white/5 hover:text-white"
                    >
                      <span className="min-w-0 truncate">{item.label}</span>

                      <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-200/90">
                        <span>View more</span>
                        <ChevronDown
                          className={[
                            "h-4 w-4 transition-transform duration-200",
                            isItemOpen ? "rotate-180" : "rotate-0",
                          ].join(" ")}
                        />
                      </span>
                    </button>

                    {isItemOpen && (
                      <div className="mt-1 flex flex-col gap-1 border-l border-white/10 pl-3">
                        {item.children!.map((child) => (
                          <a
                            key={child.id || child.href}
                            href={child.href}
                            target={child.external ? "_blank" : undefined}
                            rel={child.external ? "noreferrer" : undefined}
                            onClick={() => setIsOpen(false)}
                            className="rounded-md px-3 py-2 transition hover:bg-white/5"
                          >
                            <span className="block text-[0.98rem] font-semibold text-slate-100">
                              {child.label}
                            </span>
                            {child.description && (
                              <span className="mt-0.5 block text-xs text-muted-foreground/80">
                                {child.description}
                              </span>
                            )}
                          </a>
                        ))}

                        {item.dropdownFooter && (
                          <a
                            href={item.dropdownFooter.href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setIsOpen(false)}
                            className="mt-1 rounded-md px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-white/5 hover:text-indigo-200"
                          >
                            {item.dropdownFooter.linkLabel}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mt-2 h-px bg-white/10" />

              {/* CTAs (mobile): side-by-side buttons */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <a
                  href={contactLink.href}
                  target={contactLink.external ? "_blank" : undefined}
                  rel={contactLink.external ? "noreferrer" : undefined}
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-white/25 px-3 py-2 text-center text-sm font-semibold text-slate-50 transition hover:border-accent hover:bg-white/10"
                >
                  {contactLink.label}
                </a>

                <a
                  href={resumeLink.href}
                  target={resumeLink.external ? "_blank" : undefined}
                  rel={resumeLink.external ? "noreferrer" : undefined}
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-accent bg-accent px-3 py-2 text-center text-sm font-semibold text-slate-50 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-md"
                >
                  {resumeLink.label}
                </a>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
