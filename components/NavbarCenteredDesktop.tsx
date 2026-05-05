"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { ChevronDown } from "lucide-react";
import * as LucideIcons from "lucide-react";

import { Sparkles } from "lucide-react";

import { navbarConfig, isExternalHref } from "@/config/navbarConfig";
import type {
  NavDropdownItemCfg,
  NavDropdownFooterCfg,
} from "@/config/navbarConfig";

function PrimaryCtaContent({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Sparkles className="h-3.5 w-3.5 fill-current" />
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
      el.scrollIntoView({ behavior: "auto", block: "start" });
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

    // If section exists on this page (home), jump now (no routing).
    if (el) {
      try {
        history.replaceState(null, "", `#${encodeURIComponent(id)}`);
      } catch {}
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

  // ✅ Handle pending jump BEFORE paint to prevent "flash to old section"
  useLayoutEffect(() => {
    if (pathname !== "/") return;

    const pending = popPendingSection();
    if (pending) {
      // Ensure we start at true top before paint
      try {
        history.replaceState(null, "", "/");
      } catch {}
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });

      // Now set hash + jump
      try {
        history.replaceState(null, "", `#${encodeURIComponent(pending)}`);
      } catch {}
      jumpToIdWithRetry(pending);
      return;
    }

    // Support direct loads to "/#section"
    const hash = window.location.hash || "";
    if (hash.startsWith("#")) {
      const id = decodeURIComponent(hash.slice(1));
      if (id) jumpToIdWithRetry(id);
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

  const textLinks = useMemo(() => items, [items]);

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
                rel="noreferrer"
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
                          {item.label}
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
                          rel="noreferrer"
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

                  // Dropdown trigger
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
                        <span>{item.label}</span>
                        <ChevronDown
                          className={[
                            "h-4 w-4 transition-transform duration-200",
                            isDropdownOpen ? "rotate-180" : "rotate-0",
                            "group-hover:translate-y-[1px]",
                          ].join(" ")}
                        />
                      </button>

                      {/* Desktop dropdown */}
                      <div
                        className={[
                          "fixed left-1/2 z-30 w-[min(850px,95vw)] -translate-x-1/2 origin-top",
                          "rounded-2xl border border-white/15 bg-slate-950 p-4 text-xs shadow-2xl shadow-slate-950/60",
                          "transition-all duration-200 ease-out md:text-sm",
                          isDropdownOpen
                            ? "pointer-events-auto translate-y-1 opacity-100"
                            : "pointer-events-none translate-y-0 opacity-0",
                        ].join(" ")}
                        style={{ top: dropdownTop }}
                        onMouseEnter={() => {
                          cancelCloseDesktop();
                          setOpenDropdownKey(itemKey);
                        }}
                        onMouseLeave={() => scheduleCloseDesktop(180)}
                      >
                        {renderMegaMenuFromChildren(
                          item.children || [],
                          item.dropdownFooter,
                          () => setOpenDropdownKey(null),
                          navigateToSectionOnHome
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Right CTAs */}
          <div className="flex flex-1 items-center justify-end gap-3">
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
                {contactCta.label}
              </a>
            )}

            {/* Primary CTA */}
            {primaryCta.show !== false &&
              (primaryCta.external ? (
                <a
                  href={primaryCta.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-accent bg-accent px-3.5 py-1.5 text-xs font-semibold text-slate-50 shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-md md:text-sm"
                  onMouseEnter={() => {
                    cancelCloseDesktop();
                    setOpenDropdownKey(null);
                  }}
                  onClick={() => setOpenDropdownKey(null)}
                >
                  <PrimaryCtaContent label={primaryCta.label} />
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
                  <PrimaryCtaContent label={primaryCta.label} />
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
  const IconComponent =
    item.icon && (LucideIcons as any)[item.icon]
      ? (LucideIcons as any)[item.icon]
      : null;

  const external = !!item.external || isExternalHref(item.href);
  const hashId = extractHashId(item.href);

  // Hash item inside dropdown -> home (top) then jump
  if (!external && hashId) {
    return (
      <button
        type="button"
        onClick={() => {
          navigateToSectionOnHome(hashId);
          onNavigate?.();
        }}
        className="group flex w-full min-h-[64px] items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-slate-900 md:text-sm"
      >
        {IconComponent && (
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-slate-900 text-slate-100 transition-transform duration-150 group-hover:scale-110">
            <IconComponent className="h-5 w-5" />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[0.8rem] font-semibold text-foreground md:text-sm">
            {item.label}
          </span>
          {item.description && (
            <span className="mt-0.5 line-clamp-2 text-[0.7rem] text-muted-foreground">
              {item.description}
            </span>
          )}
        </div>
      </button>
    );
  }

  if (external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        onClick={onNavigate}
        className="group flex min-h-[64px] items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-slate-900 md:text-sm"
      >
        {IconComponent && (
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-slate-900 text-slate-100 transition-transform duration-150 group-hover:scale-110">
            <IconComponent className="h-5 w-5" />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[0.8rem] font-semibold text-foreground md:text-sm">
            {item.label}
          </span>
          {item.description && (
            <span className="mt-0.5 line-clamp-2 text-[0.7rem] text-muted-foreground">
              {item.description}
            </span>
          )}
        </div>
      </a>
    );
  }

  // Normal internal page nav -> starts at top
  return (
    <Link
      href={item.href}
      scroll={true}
      onClick={onNavigate}
      className="group flex min-h-[64px] items-center gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-slate-900 md:text-sm"
    >
      {IconComponent && (
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-slate-900 text-slate-100 transition-transform duration-150 group-hover:scale-110">
          <IconComponent className="h-5 w-5" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[0.8rem] font-semibold text-foreground md:text-sm">
          {item.label}
        </span>
        {item.description && (
          <span className="mt-0.5 line-clamp-2 text-[0.7rem] text-muted-foreground">
            {item.description}
          </span>
        )}
      </div>
    </Link>
  );
}

function renderMegaMenuFromChildren(
  children: NavDropdownItemCfg[],
  footer: NavDropdownFooterCfg | undefined,
  onNavigate: () => void,
  navigateToSectionOnHome: (id: string) => void
) {
  if (!children || children.length === 0) return null;

  const leftItems = children.filter((c) => c.column === "left");
  const rightItems = children.filter((c) => c.column !== "left");

  const footerExternal = footer
    ? !!footer.external || isExternalHref(footer.href)
    : false;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="w-full md:w-1/3 md:border-r md:border-white/10 md:pr-4">
          <div className="flex flex-col gap-2">
            {leftItems.map((item) => (
              <DesktopDropdownItem
                key={item.id || item.href}
                item={item}
                onNavigate={onNavigate}
                navigateToSectionOnHome={navigateToSectionOnHome}
              />
            ))}
          </div>
        </div>

        <div className="w-full md:w-2/3 md:pl-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-2.5">
            {rightItems.map((item) => (
              <DesktopDropdownItem
                key={item.id || item.href}
                item={item}
                onNavigate={onNavigate}
                navigateToSectionOnHome={navigateToSectionOnHome}
              />
            ))}
          </div>
        </div>
      </div>

      {footer && (
        <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{footer.text}</span>

          {footerExternal ? (
            <a
              href={footer.href}
              target="_blank"
              rel="noreferrer"
              onClick={onNavigate}
              className="font-semibold text-indigo-400 transition hover:text-indigo-300"
            >
              {footer.linkLabel}
            </a>
          ) : (
            <Link
              href={footer.href}
              scroll={true}
              onClick={onNavigate}
              className="font-semibold text-indigo-400 transition hover:text-indigo-300"
            >
              {footer.linkLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
