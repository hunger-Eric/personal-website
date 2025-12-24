// components/NavbarCenteredDesktop.tsx
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
import * as LucideIcons from "lucide-react";

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

export function NavbarCentered() {
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null); // desktop dropdown
  const [scrolled, setScrolled] = useState(false);

  // Desktop dropdown positioning (fixed + centered)
  const [dropdownTop, setDropdownTop] = useState<number>(56); // will be computed
  const headerRef = useRef<HTMLElement | null>(null);

  // Hover-intent timer so dropdown doesn’t instantly close when moving pointer
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

    // Fallback: legacy sections
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

  // Detect Contact / Resume
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

  // Center nav only shows regular links (no contact/resume/buttons)
  const textLinks = visibleItems.filter((i) => {
    if (i.isButton) return false;
    if (i.id === contactLink.id || i.id === resumeLink.id) return false;
    return true;
  });

  // Darken background slightly after scrolling
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
      // tiny breathing room
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

  // ✅ Top of page: looks like part of hero (no blur, no tinted bg, no visible border)
  // ✅ After scroll: restore frosted/tinted style
  const headerBg = scrolled ? "bg-background/92" : "bg-transparent";
  const headerBlur = scrolled
    ? "backdrop-blur supports-[backdrop-filter]:backdrop-blur"
    : "";
  const headerBorder = scrolled ? "border-white/10" : "border-transparent";

  return (
    <header
      ref={headerRef as any}
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
          {/* Left: logo + title */}
          <div className="flex flex-1 items-center">
            <Link
              href="/"
              className="group flex items-center gap-2 transform-gpu transition hover:scale-[0.97] active:scale-95"
              onClick={() => {
                cancelCloseDesktop();
                setOpenDropdownKey(null);
              }}
            >
              <Image
                src="/images/favicon.png"
                alt="kevintrinh.dev logo"
                width={24}
                height={24}
                className="shrink-0 rounded-sm"
              />
              <span className="text-base font-semibold leading-none tracking-tight sm:text-lg">
                KevinTrinh.dev
              </span>
            </Link>
          </div>

          {/* Center: pill nav + mega menus (desktop) */}
          <nav className="flex flex-none items-center justify-center">
            <div className="pointer-events-none relative flex items-center justify-center">
              <div
                className={[
                  "pointer-events-auto flex items-center gap-1 rounded-2xl border px-2 py-1 text-xs md:gap-2 md:px-3 md:py-1.5 md:text-sm",
                  scrolled
                    ? "border-white/15 bg-white/5 text-muted-foreground shadow-sm transition-[background-color,border-color,box-shadow,color] duration-300 ease-out"
                    : "border-white/20 bg-transparent text-slate-200/90 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-[background-color,border-color,box-shadow,color] duration-300 ease-out",
                ].join(" ")}
              >
                {textLinks.map((item) => {
                  const hasDropdown = !!(
                    item.children && item.children.length > 0
                  );
                  const itemKey = item.key;
                  const isDropdownOpen = openDropdownKey === itemKey;

                  if (!hasDropdown) {
                    return (
                      <DesktopNavItemSimple
                        key={item.key}
                        item={item}
                        onHover={() => {
                          cancelCloseDesktop();
                          setOpenDropdownKey(null);
                        }}
                        fontClass="font-semibold"
                      />
                    );
                  }

                  return (
                    <div
                      key={item.key}
                      className="relative"
                      onMouseEnter={() => openDesktop(itemKey)}
                      onFocus={() => openDesktop(itemKey)}
                      onMouseLeave={() => scheduleCloseDesktop(180)}
                    >
                      {item.href ? (
                        <Link
                          href={item.href}
                          className={[
                            "group inline-flex items-center gap-1.5 rounded-md px-2.5 py-1",
                            "font-semibold text-muted-foreground transition",
                            "hover:bg-white/10 hover:text-foreground",
                            "md:px-3 md:py-1.5",
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
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => e.preventDefault()}
                          className={[
                            "group inline-flex items-center gap-1.5 rounded-md px-2.5 py-1",
                            "font-semibold text-muted-foreground transition",
                            "hover:bg-white/10 hover:text-foreground",
                            "md:px-3 md:py-1.5",
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
                      )}

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
                          () => setOpenDropdownKey(null)
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Right: CTAs (desktop) */}
          <div className="flex flex-1 items-center justify-end gap-3">
            <a
              href={contactLink.href}
              target={contactLink.external ? "_blank" : undefined}
              rel={contactLink.external ? "noreferrer" : undefined}
              className={[
                "text-xs md:text-sm",
                "font-semibold text-muted-foreground underline-offset-4",
                "transition hover:text-foreground hover:underline",
              ].join(" ")}
              onMouseEnter={() => {
                cancelCloseDesktop();
                setOpenDropdownKey(null);
              }}
            >
              {contactLink.label}
            </a>

            <a
              href={resumeLink.href}
              target={resumeLink.external ? "_blank" : undefined}
              rel={resumeLink.external ? "noreferrer" : undefined}
              className="rounded-md border border-accent bg-accent px-3.5 py-1.5 text-xs font-semibold text-slate-50 shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-md md:text-sm"
              onMouseEnter={() => {
                cancelCloseDesktop();
                setOpenDropdownKey(null);
              }}
            >
              {resumeLink.label}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function DesktopNavItemSimple({
  item,
  onHover,
  fontClass = "font-medium",
}: {
  item: NavItem;
  onHover?: () => void;
  fontClass?: string;
}) {
  const classes = [
    "rounded-md px-2.5 py-1",
    fontClass,
    "text-muted-foreground transition hover:bg-white/10 hover:text-foreground",
    "md:px-3 md:py-1.5",
  ].join(" ");

  if (!item.href) {
    return (
      <button
        type="button"
        className={classes}
        onMouseEnter={onHover}
        onClick={(e) => e.preventDefault()}
      >
        {item.label}
      </button>
    );
  }

  const isHash = item.href.startsWith("#");
  const isInternalRoute = item.href.startsWith("/") && !item.external;

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className={classes}
        onMouseEnter={onHover}
      >
        {item.label}
      </a>
    );
  }

  if (isInternalRoute) {
    return (
      <Link href={item.href} className={classes} onMouseEnter={onHover}>
        {item.label}
      </Link>
    );
  }

  if (isHash) {
    return (
      <a href={item.href} className={classes} onMouseEnter={onHover}>
        {item.label}
      </a>
    );
  }

  return (
    <a href={item.href} className={classes} onMouseEnter={onHover}>
      {item.label}
    </a>
  );
}

function DesktopDropdownItem({
  item,
  onNavigate,
}: {
  item: NavDropdownItemCfg;
  onNavigate?: () => void;
}) {
  const IconComponent =
    item.icon && (LucideIcons as any)[item.icon]
      ? (LucideIcons as any)[item.icon]
      : null;

  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
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
  footer?: NavDropdownFooterCfg,
  onNavigate?: () => void
) {
  if (!children || children.length === 0) return null;

  const leftItems = children.filter((c) => c.column === "left");
  const rightItems = children.filter((c) => c.column !== "left");

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
              />
            ))}
          </div>
        </div>
      </div>

      {footer && (
        <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{footer.text}</span>
          <a
            href={footer.href}
            target="_blank"
            rel="noreferrer"
            onClick={onNavigate}
            className="font-semibold text-indigo-400 transition hover:text-indigo-300"
          >
            {footer.linkLabel}
          </a>
        </div>
      )}
    </div>
  );
}
