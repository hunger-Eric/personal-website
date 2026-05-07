// components/NavbarCenteredMobile.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Home } from "lucide-react";
import * as LucideIcons from "lucide-react";

import {
  navbarConfig,
  isExternalHref,
  type NavDropdownItemCfg,
  type NavDropdownFooterCfg,
} from "../config/navbarConfig";
import { siteConfig } from "../config/siteConfig";

type NavItem = {
  key: string;
  id?: string;
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

  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";

  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Build mobile nav from navbarConfig (single source of truth)
  const { items, contactLink, primaryCta, logo } = useMemo(() => {
    const centerItems: NavItem[] = (navbarConfig.centerItems || []).map(
      (it) => {
        const key = it.id || it.href || it.label;
        return {
          key,
          id: it.id,
          label: it.label,
          href: it.href,
          external: Boolean(it.external ?? isExternalHref(it.href)),
          isButton: false,
          children: it.children ?? [],
          // ✅ remove dropdown footer support in mobile
          dropdownFooter: undefined,
        };
      }
    );

    const contact = navbarConfig.cta.contact;
    const primary = navbarConfig.cta.primary;

    const contactLink: NavItem = {
      key: "cta-contact",
      id: "contact",
      label: contact.label,
      href: contact.href,
      external: Boolean(contact.external ?? isExternalHref(contact.href)),
      isButton: true,
      children: [],
      dropdownFooter: undefined,
    };

    const primaryCta: NavItem = {
      key: "cta-primary",
      id: "primary",
      label: primary.label,
      href: primary.href,
      external: Boolean(primary.external ?? isExternalHref(primary.href)),
      isButton: true,
      children: [],
      dropdownFooter: undefined,
    };

    return {
      items: centerItems,
      contactLink,
      primaryCta,
      logo: navbarConfig.logo,
    };
  }, []);

  const menuLinks = useMemo<NavItem[]>(() => {
    if (isHome) return items;
    const homeItem: NavItem = {
      key: "nav-home",
      id: "home",
      label: "Home",
      href: "/",
      external: false,
      isButton: false,
      children: [],
      dropdownFooter: undefined,
    };
    return [homeItem, ...items];
  }, [items, isHome]);

  // Socials for the bottom of the drawer (footer-visible only)
  const socialItems = useMemo(() => {
    return (siteConfig.socialsFor?.footer ?? [])
      .filter((s) => {
        const href = (s.href || "").trim();
        if (!href || href === "null") return false;
        return true;
      })
      .slice(0, 8);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on outside click + meaningful scroll (no instant close).
  // Uses capture-phase click + preventDefault/stopPropagation so the synthesized
  // click on touch doesn't activate links underneath the drawer (was opening
  // pages when tapping outside to close).
  useEffect(() => {
    if (!isOpen) return;

    const openedAt = Date.now();
    const openedY = window.scrollY;

    const onClickCapture = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (panelRef.current?.contains(t) || toggleRef.current?.contains(t))
        return;
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
    };

    const onScroll = () => {
      const dt = Date.now() - openedAt;
      const dy = Math.abs(window.scrollY - openedY);
      if (dt < 250) return;
      if (dy > 12) setIsOpen(false);
    };

    window.addEventListener("click", onClickCapture, true);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setOpenKey(null);
  }, [isOpen]);

  // Lock background scroll while drawer is open.
  // Defensive: also clear on unmount in case the cleanup gets skipped by a
  // stale render in social in-app webviews (TikTok / IG).
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      // Final safety net: never leave the page locked if this component
      // unmounts while the drawer was open.
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, []);

  // Mount-gate so createPortal only runs client-side.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // 100% opaque always — no see-through.
  const headerBg = "bg-background";

  return (
    <header
      className={[
        "sm:hidden",
        "sticky top-0 z-[9999] isolate border-b border-white/10",
        headerBg,
        "transition-colors",
      ].join(" ")}
    >
      {/* Top bar */}
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-3 py-4">
          <Link
            href={logo.href}
            className="group flex flex-1 items-center gap-2 transition active:scale-95"
            onClick={(e) => {
              setIsOpen(false);
              // Already on home → scroll to top instead of being a no-op.
              if (
                typeof window !== "undefined" &&
                window.location.pathname === "/" &&
                logo.href === "/"
              ) {
                e.preventDefault();
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                try {
                  history.replaceState(null, "", "/");
                } catch {
                  // ignore
                }
              }
            }}
          >
            {logo.imageSrc ? (
              <Image
                src={logo.imageSrc}
                alt={logo.imageAlt}
                width={24}
                height={24}
                className="shrink-0 rounded-sm"
              />
            ) : null}
            <span className="text-base font-semibold leading-none tracking-tight text-slate-50">
              {logo.label}
            </span>
          </Link>

          {/* Hamburger */}
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

      {/* Backdrop + drawer are portaled to document.body so they escape the
          sticky <header> ancestor — fixes a known iOS in-app webview bug
          (TikTok / Instagram) where fixed-inside-sticky leaves the blurred
          overlay visible after the drawer closes. */}
      {mounted && createPortal(
        <>
          {/* Backdrop */}
          <div
            aria-hidden
            onClick={() => setIsOpen(false)}
            className={[
              "sm:hidden fixed inset-0 z-[10000] bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200",
              isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
            ].join(" ")}
          />

          {/* Slide-in drawer from the right */}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className={[
              "sm:hidden fixed top-0 right-0 z-[10001] h-[100dvh] w-[85%] max-w-sm",
              "border-l border-white/10 bg-slate-950/95 shadow-xl shadow-slate-950/40",
              "backdrop-blur supports-[backdrop-filter]:backdrop-blur",
              "transition-transform duration-300 ease-out",
              isOpen ? "translate-x-0" : "translate-x-full",
              // Hide entirely when closed so closed-state isn't kept in the
              // composited layer tree on quirky webviews.
              isOpen ? "visible" : "invisible",
            ].join(" ")}
          >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Menu
            </span>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-200 transition hover:bg-white/10"
            >
              <span className="relative block h-5 w-5">
                <span className="absolute left-0 top-2 block h-0.5 w-5 rotate-45 bg-white" />
                <span className="absolute left-0 top-2 block h-0.5 w-5 -rotate-45 bg-white" />
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <nav className="flex min-h-full flex-col gap-1">
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

                      {/* ✅ "View more" + chevron gray (not white) */}
                      <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <span>View more</span>
                        <ChevronDown
                          className={[
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
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
                            {/* mobile: title only */}
                            <span className="block text-[0.98rem] font-semibold text-slate-100">
                              {child.label}
                            </span>
                          </a>
                        ))}

                        {/* ✅ removed dropdown footer entirely */}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Push CTAs to the bottom of the drawer */}
              <div className="flex-1" />

              {/* CTAs — at the very bottom (Email me is mobile-only, hence
                  always rendered here regardless of contact.show) */}
              <div className="mt-6 flex flex-col gap-2">
                <a
                  href={contactLink.href}
                  target={contactLink.external ? "_blank" : undefined}
                  rel={contactLink.external ? "noreferrer noopener" : undefined}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-50 transition hover:border-accent hover:bg-white/10"
                >
                  {(() => {
                    const Icon = (LucideIcons as any).Mail;
                    return Icon ? (
                      <Icon className="h-4 w-4 opacity-80" aria-hidden />
                    ) : null;
                  })()}
                  <span>{contactLink.label}</span>
                </a>

                {navbarConfig.cta.primary.show !== false && (
                  <a
                    href={primaryCta.href}
                    target={primaryCta.external ? "_blank" : undefined}
                    rel={primaryCta.external ? "noreferrer" : undefined}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-accent bg-accent px-4 py-2.5 text-sm font-semibold text-slate-50 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-md"
                  >
                    {(() => {
                      const Icon = (LucideIcons as any).Handshake;
                      return Icon ? (
                        <Icon className="h-4 w-4" aria-hidden />
                      ) : null;
                    })()}
                    <span>{primaryCta.label}</span>
                  </a>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
        </>,
        document.body
      )}
    </header>
  );
}
