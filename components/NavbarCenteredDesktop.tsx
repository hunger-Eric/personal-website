"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { ChevronDown, Handshake } from "lucide-react";
import * as LucideIcons from "lucide-react";

import { navbarConfig, isExternalHref } from "@/config/navbarConfig";
import type { NavDropdownItemCfg } from "@/config/navbarConfig";
import { LangSwitch } from "@/components/LangSwitch";
import { useLocale } from "@/components/LocaleProvider";

function PrimaryCtaContent({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Handshake className="h-3.5 w-3.5" />
      <span>{label}</span>
    </span>
  );
}

const PENDING_SECTION_KEY = "__nav_pending_section__";

function extractHashId(href: string) {
  const i = href.indexOf("#");
  if (i === -1) return null;
  const id = href.slice(i + 1).trim();
  return id || null;
}

function jumpToIdWithRetry(id: string) {
  if (!id) return;

  let cancelled = false;
  const maxAttempts = 60; // 60 * 50ms = 3s worst-case

  const attempt = (n: number) => {
    if (cancelled) return;

    const el = document.getElementById(id);
    if (el) {
      // ✅ no smooth scroll
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (n < maxAttempts) {
      window.setTimeout(() => attempt(n + 1), 50);
    }
  };

  requestAnimationFrame(() => attempt(0));

  return () => {
    cancelled = true;
  };
}

function setPendingSection(id: string) {
  try {
    sessionStorage.setItem(PENDING_SECTION_KEY, id);
  } catch {}
}

function popPendingSection() {
  try {
    const v = sessionStorage.getItem(PENDING_SECTION_KEY);
    if (v) sessionStorage.removeItem(PENDING_SECTION_KEY);
    return v || null;
  } catch {
    return null;
  }
}

export function NavbarCentered() {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Desktop dropdown positioning (fixed + centered)
  const [dropdownTop, setDropdownTop] = useState<number>(56);
  const headerRef = useRef<HTMLElement | null>(null);

  // Hover-intent timer
  const closeTimerRef = useRef<number | null>(null);
  const scheduleCloseDesktop = (delayMs = 180) => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setOpenDropdownKey(null);
      closeTimerRef.current = null;
    }, delayMs);
  };
  const cancelCloseDesktop = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const openDesktop = (key: string) => {
    cancelCloseDesktop();
    setOpenDropdownKey(key);
  };

  // ✅ prevent any pending timer from firing after unmount
  useEffect(() => {
    return () => cancelCloseDesktop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * ✅ New behavior (NO smooth scroll):
   * - From NOT-home -> go to HOME at TOP first, then jump to section.
   * - From HOME -> jump to section immediately.
   * - Any normal page navigation should start at the top.
   */
  const navigateToSectionOnHome = (id: string) => {
    if (!id) return;

    const el = document.getElementById(id);

    // If section exists on this page (home), just scroll — don't change the
    // URL hash so refresh always lands at the top.
    if (el) {
      jumpToIdWithRetry(id);
      setOpenDropdownKey(null);
      return;
    }

    // Not on home: store target and go to "/" WITHOUT Next auto-scroll.
    // We'll force top + jump in useLayoutEffect when "/" mounts.
    setPendingSection(id);
    setOpenDropdownKey(null);
    router.push("/", { scroll: false });
  };

  // ✅ Handle pending jump BEFORE paint to prevent "flash to old section".
  // Also: aggressively clear any stale URL hash so refresh always starts at
  // top — previously the hash from a section nav-click persisted and made the
  // browser snap to that section on every refresh.
  useLayoutEffect(() => {
    if (pathname !== "/") return;

    const pending = popPendingSection();
    if (pending) {
      try {
        history.replaceState(null, "", "/");
      } catch {}
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      jumpToIdWithRetry(pending);
      return;
    }

    // Direct load — honor an inbound hash (e.g. bookmark to /#about) once,
    // then strip it from the URL so a refresh after that lands at top.
    const hash = window.location.hash || "";
    if (hash.startsWith("#")) {
      const id = decodeURIComponent(hash.slice(1));
      if (id) jumpToIdWithRetry(id);
      try {
        history.replaceState(null, "", "/");
      } catch {}
    } else {
      // No hash, no pending → force top to defeat any stray scroll restoration.
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname]);

  // If hash changes while staying on home (manual anchor, back/forward), jump
  useEffect(() => {
    const onHash = () => {
      if (window.location.pathname !== "/") return;
      const hash = window.location.hash || "";
      if (!hash.startsWith("#")) return;
      const id = decodeURIComponent(hash.slice(1));
      if (!id) return;
      jumpToIdWithRetry(id);
    };

    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
    };
  }, []);

  // Config
  const logo = navbarConfig.logo;
  const items = navbarConfig.centerItems;
  const contactCta = navbarConfig.cta.contact;
  const primaryCta = navbarConfig.cta.primary;

  const textLinks = useMemo(() => {
    const out: Array<(typeof items)[number]> = [];
    for (const item of items) {
      if (item.id === "more" && item.children?.length) {
        for (const child of item.children) {
          out.push({
            id: child.id,
            label: child.label,
            href: child.href,
            external: child.external,
            show: true,
          } as (typeof items)[number]);
        }
      } else {
        out.push(item);
      }
    }
    return out;
  }, [items]);
  const navLabelById: Record<string, string> = {
    about: t.nav.about,
    projects: t.nav.projects,
    articles: t.nav.articles,
    photography: t.nav.photography,
    more: t.nav.more,
    "more-articles": t.nav.articles,
    "more-photography": t.nav.photography,
  };
  const resolveNavLabel = (id: string | undefined, fallback: string) =>
    (id && navLabelById[id]) || fallback;

  // scroll style after scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateTop = () => {
      const el = headerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setDropdownTop(Math.round(rect.bottom + 1));
    };

    updateTop();
    window.addEventListener("resize", updateTop);
    window.addEventListener("scroll", updateTop, { passive: true });

    return () => {
      window.removeEventListener("resize", updateTop);
      window.removeEventListener("scroll", updateTop);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdownKey) return;
    const onDown = (e: MouseEvent) => {
      const header = headerRef.current;
      if (!header) return;
      const target = e.target as Node | null;
      if (target && header.contains(target)) return;
      setOpenDropdownKey(null);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [openDropdownKey]);

  // 100% opaque always — no see-through.
  const headerBg = "bg-background";
  const headerBlur = "";
  const headerBorder = scrolled ? "border-white/10" : "border-white/5";

  return (
    <header
      ref={headerRef}
      className={[
        "hidden sm:block",
        "sticky top-0 z-[9999] isolate border-b",
        headerBorder,
        headerBg,
        headerBlur,
        "transition-colors",
      ].join(" ")}
      onMouseLeave={() => scheduleCloseDesktop(180)}
      onMouseEnter={() => cancelCloseDesktop()}
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4 py-4">
          {/* Left: logo */}
          <div className="flex flex-1 items-center">
            {isExternalHref(logo.href) ? (
              <a
                href={logo.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center gap-2 transform-gpu transition hover:scale-[0.97] active:scale-95"
                onMouseEnter={() => {
                  cancelCloseDesktop();
                  setOpenDropdownKey(null);
                }}
                onClick={() => setOpenDropdownKey(null)}
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
                <span className="text-base font-semibold leading-none tracking-tight sm:text-lg">
                  {logo.label}
                </span>
              </a>
            ) : (
              <Link
                href={logo.href}
                className="group flex items-center gap-2 transform-gpu transition hover:scale-[0.97] active:scale-95"
                onMouseEnter={() => {
                  cancelCloseDesktop();
                  setOpenDropdownKey(null);
                }}
                onClick={(e) => {
                  setOpenDropdownKey(null);
                  // If we're already on /, the Next link is a no-op — manually
                  // scroll to top so the logo always feels responsive.
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
                <span className="text-base font-semibold leading-none tracking-tight sm:text-lg">
                  {logo.label}
                </span>
              </Link>
            )}
          </div>

          {/* Center nav */}
          <nav className="flex flex-none items-center justify-center">
            <div className="pointer-events-none relative flex items-center justify-center">
              <div
                className={[
                  "pointer-events-auto flex items-center gap-1 rounded-2xl border px-2 py-1 text-xs md:gap-2 md:px-3 md:py-1.5 md:text-sm",
                  scrolled
                    ? "border-white/15 bg-white/5 text-muted-foreground shadow-sm transition-[background-color,border-color,box-shadow,color] duration-300 ease-out"
                    : // ✅ not transparent at all (still subtle + minimal)
                      "border-white/20 bg-slate-950 text-slate-200/90 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-[background-color,border-color,box-shadow,color] duration-300 ease-out",
                ].join(" ")}
              >
                {textLinks.map((item) => {
                  const hasDropdown = !!(item.children && item.children.length);
                  const itemKey = item.id || item.href || item.label;
                  const isDropdownOpen = openDropdownKey === itemKey;

                  const hashId = extractHashId(item.href);

                  if (!hasDropdown) {
                    // Section links -> go home (top) then jump
                    if (hashId && !item.external) {
                      return (
                        <button
                          key={itemKey}
                          type="button"
                          className={[
                            "rounded-md px-2.5 py-1 md:px-3 md:py-1.5",
                            "font-semibold text-muted-foreground transition hover:bg-white/10 hover:text-foreground",
                          ].join(" ")}
                          onMouseEnter={() => {
                            cancelCloseDesktop();
                            setOpenDropdownKey(null);
                          }}
                          onClick={() => navigateToSectionOnHome(hashId)}
                        >
                          {resolveNavLabel(item.id, item.label)}
                        </button>
                      );
                    }

                    // External links
                    if (item.external) {
                      return (
                        <a
                          key={itemKey}
                          href={item.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={[
                            "rounded-md px-2.5 py-1 md:px-3 md:py-1.5",
                            "font-semibold text-muted-foreground transition hover:bg-white/10 hover:text-foreground",
                          ].join(" ")}
                          onMouseEnter={() => {
                            cancelCloseDesktop();
                            setOpenDropdownKey(null);
                          }}
                          onClick={() => setOpenDropdownKey(null)}
                        >
                          {item.label}
                        </a>
                      );
                    }

                    // Normal internal pages: ensure top-of-page always
                    return (
                      <Link
                        key={itemKey}
                        href={item.href}
                        scroll={true}
                        className={[
                          "rounded-md px-2.5 py-1 md:px-3 md:py-1.5",
                          "font-semibold text-muted-foreground transition hover:bg-white/10 hover:text-foreground",
                        ].join(" ")}
                        onMouseEnter={() => {
                          cancelCloseDesktop();
                          setOpenDropdownKey(null);
                        }}
                        onClick={() => setOpenDropdownKey(null)}
                      >
                        {item.label}
                      </Link>
                    );
                  }

                  // Dropdown trigger — minimal stacked menu
                  return (
                    <div
                      key={itemKey}
                      className="relative"
                      onMouseEnter={() => openDesktop(itemKey)}
                      onFocus={() => openDesktop(itemKey)}
                      onMouseLeave={() => scheduleCloseDesktop(180)}
                    >
                      <button
                        type="button"
                        className={[
                          "group inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 md:px-3 md:py-1.5",
                          "font-semibold text-muted-foreground transition",
                          "hover:bg-white/10 hover:text-foreground",
                        ].join(" ")}
                        aria-haspopup="menu"
                        aria-expanded={isDropdownOpen}
                      >
                        <span>{resolveNavLabel(item.id, item.label)}</span>
                        <ChevronDown
                          className={[
                            "h-4 w-4 transition-transform duration-200",
                            isDropdownOpen ? "rotate-180" : "rotate-0",
                            "group-hover:translate-y-[1px]",
                          ].join(" ")}
                        />
                      </button>

                      {/* Minimal stacked dropdown — no icons, no descriptions,
                          just labels in a clean vertical list under the trigger */}
                      <div
                        role="menu"
                        className={[
                          "absolute left-1/2 top-full z-30 mt-2 w-44 -translate-x-1/2 origin-top",
                          "overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 py-1.5 text-sm shadow-xl shadow-slate-950/40",
                          "supports-[backdrop-filter]:backdrop-blur",
                          "transition-all duration-150 ease-out",
                          isDropdownOpen
                            ? "pointer-events-auto translate-y-0 opacity-100"
                            : "pointer-events-none -translate-y-1 opacity-0",
                        ].join(" ")}
                        onMouseEnter={() => {
                          cancelCloseDesktop();
                          setOpenDropdownKey(itemKey);
                        }}
                        onMouseLeave={() => scheduleCloseDesktop(180)}
                      >
        {(item.children || []).map((child) => (
                          <DesktopDropdownItem
                            key={child.id || child.href}
                            item={{
                              ...child,
                              label: resolveNavLabel(child.id, child.label),
                            }}
                            onNavigate={() => setOpenDropdownKey(null)}
                            navigateToSectionOnHome={navigateToSectionOnHome}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Right CTAs */}
          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-3">
            <LangSwitch />
            {/* Contact CTA — opens the user's default mail client (mailto:) */}
            {contactCta.show !== false && (
              <a
                href={contactCta.href}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "text-xs md:text-sm",
                  "font-semibold text-muted-foreground underline-offset-4",
                  "transition hover:text-foreground hover:underline",
                ].join(" ")}
                onMouseEnter={() => {
                  cancelCloseDesktop();
                  setOpenDropdownKey(null);
                }}
                onClick={() => setOpenDropdownKey(null)}
              >
                {t.nav.connect}
              </a>
            )}

            {/* Primary CTA */}
            {primaryCta.show !== false &&
              (primaryCta.external ? (
                <a
                  href={primaryCta.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-md border border-accent bg-accent px-3.5 py-1.5 text-xs font-semibold text-slate-50 shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-md md:text-sm"
                  onMouseEnter={() => {
                    cancelCloseDesktop();
                    setOpenDropdownKey(null);
                  }}
                  onClick={() => setOpenDropdownKey(null)}
                >
                  <PrimaryCtaContent label={t.nav.connect} />
                </a>
              ) : (
                <Link
                  href={primaryCta.href}
                  scroll={true}
                  className="rounded-md border border-accent bg-accent px-3.5 py-1.5 text-xs font-semibold text-slate-50 shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-md md:text-sm"
                  onMouseEnter={() => {
                    cancelCloseDesktop();
                    setOpenDropdownKey(null);
                  }}
                  onClick={() => setOpenDropdownKey(null)}
                >
                  <PrimaryCtaContent label={t.nav.connect} />
                </Link>
              ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function DesktopDropdownItem({
  item,
  onNavigate,
  navigateToSectionOnHome,
}: {
  item: NavDropdownItemCfg;
  onNavigate?: () => void;
  navigateToSectionOnHome: (id: string) => void;
}) {
  const external = !!item.external || isExternalHref(item.href);
  const hashId = extractHashId(item.href);

  const IconComponent =
    item.icon && (LucideIcons as any)[item.icon]
      ? ((LucideIcons as any)[item.icon] as React.ComponentType<{
          className?: string;
        }>)
      : null;

  const baseClass =
    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-white/5 hover:text-white";

  const inner = (
    <>
      {IconComponent ? (
        <IconComponent
          className="h-4 w-4 flex-none text-slate-400 transition-colors group-hover:text-slate-200"
          aria-hidden
        />
      ) : null}
      <span>{item.label}</span>
    </>
  );

  const className = `group ${baseClass}`;

  // In-page anchor (e.g. /#content) — go home top then jump
  if (!external && hashId) {
    return (
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          navigateToSectionOnHome(hashId);
          onNavigate?.();
        }}
        className={className}
      >
        {inner}
      </button>
    );
  }

  if (external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer noopener"
        role="menuitem"
        onClick={onNavigate}
        className={className}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      scroll={true}
      role="menuitem"
      onClick={onNavigate}
      className={className}
    >
      {inner}
    </Link>
  );
}
