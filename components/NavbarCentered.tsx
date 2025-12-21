// components/NavbarCentered.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  siteConfig,
  type NavItemCfg,
  type NavDropdownItemCfg,
  type NavDropdownFooterCfg,
} from "../config/siteConfig";
import { Menu, X } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null); // desktop dropdown

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

          const external = it.external ?? href.startsWith("http");
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
        { id: "blog", label: "Blogs" },
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

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4 py-4">
          {/* Left: logo + title */}
          <div className="flex flex-1 items-center">
            <Link
              href="/"
              className="group flex items-center gap-2 transform-gpu transition hover:scale-[0.97] active:scale-95"
            >
              <Image
                src="/images/favicon.png"
                alt="kevintrinh.dev logo"
                width={24}
                height={24}
                className="shrink-0 rounded-sm"
              />
              <span className="text-base font-semibold leading-none tracking-tight sm:text-lg">
                kevintrinh.dev
              </span>
            </Link>
          </div>

          <nav className="hidden flex-none items-center justify-center sm:flex">
            <div className="pointer-events-none relative flex items-center justify-center">
              <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-muted-foreground shadow-sm md:gap-2 md:px-3 md:py-1.5 md:text-sm">
                {textLinks.map((item) => {
                  const hasDropdown = item.children && item.children.length > 0;
                  const isOpen = openDropdownId === item.id;

                  // No dropdown at all → also close any open dropdown on hover
                  if (!hasDropdown) {
                    return (
                      <DesktopNavItemSimple
                        key={item.key}
                        item={item}
                        onHover={() => setOpenDropdownId(null)}
                      />
                    );
                  }

                  // With dropdown + href (e.g. Projects)
                  if (item.href) {
                    return (
                      <div key={item.key}>
                        <Link
                          href={item.href}
                          onMouseEnter={() => setOpenDropdownId(item.id)}
                          onFocus={() => setOpenDropdownId(item.id)}
                          className="inline-flex items-center rounded-md px-2.5 py-1 font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground md:px-3 md:py-1.5"
                        >
                          {item.label}
                        </Link>

                        {/* Centered dropdown, Solvia-style (anchored to outer relative container) */}
                        <div
                          onMouseEnter={() => setOpenDropdownId(item.id)}
                          onMouseLeave={() => setOpenDropdownId(null)}
                          className={`absolute left-1/2 top-full z-30 mt-2 w-[min(800px,95vw)] -translate-x-1/2 origin-top rounded-2xl border border-white/15 bg-slate-950 p-4 text-xs shadow-2xl shadow-slate-950/60 transition-all duration-150 ease-out md:text-sm ${
                            isOpen
                              ? "pointer-events-auto translate-y-1 opacity-100"
                              : "pointer-events-none translate-y-0 opacity-0"
                          }`}
                        >
                          {renderMegaMenuFromChildren(
                            item.children || [],
                            item.dropdownFooter
                          )}
                        </div>
                      </div>
                    );
                  }

                  // With dropdown but NO href
                  return (
                    <div key={item.key}>
                      <button
                        type="button"
                        onMouseEnter={() => setOpenDropdownId(item.id)}
                        onFocus={() => setOpenDropdownId(item.id)}
                        onClick={(e) => e.preventDefault()}
                        className="inline-flex items-center rounded-md px-2.5 py-1 font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground md:px-3 md:py-1.5"
                      >
                        {item.label}
                      </button>

                      <div
                        onMouseEnter={() => setOpenDropdownId(item.id)}
                        onMouseLeave={() => setOpenDropdownId(null)}
                        className={`absolute left-1/2 top-full z-30 mt-2 w-[min(850px,95vw)] -translate-x-1/2 origin-top rounded-2xl border border-white/15 bg-slate-950 p-4 text-xs shadow-2xl shadow-slate-950/60 transition-all duration-150 ease-out md:text-sm ${
                          isOpen
                            ? "pointer-events-auto translate-y-1 opacity-100"
                            : "pointer-events-none translate-y-0 opacity-0"
                        }`}
                      >
                        {renderMegaMenuFromChildren(
                          item.children || [],
                          item.dropdownFooter
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Right: CTAs (desktop) */}
          <div className="hidden flex-1 items-center justify-end gap-2 sm:flex">
            <a
              href={contactLink.href}
              target={contactLink.external ? "_blank" : undefined}
              rel={contactLink.external ? "noreferrer" : undefined}
              className="rounded-lg border border-white/25 px-3.5 py-1.5 text-xs font-medium text-slate-50 underline-offset-2 transition hover:border-accent hover:bg-white/10 hover:text-slate-50 md:text-sm"
            >
              {contactLink.label}
            </a>

            <a
              href={resumeLink.href}
              target={resumeLink.external ? "_blank" : undefined}
              rel={resumeLink.external ? "noreferrer" : undefined}
              className="rounded-lg border border-accent bg-accent px-3.5 py-1.5 text-xs font-medium text-slate-50 shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-md md:text-sm"
            >
              {resumeLink.label}
            </a>
          </div>

          {/* Mobile toggle (mobile nav stays simple for now) */}
          <button
            type="button"
            className="ml-auto inline-flex items-center justify-center rounded-md border border-white/15 p-1.5 text-muted-foreground hover:border-accent hover:text-foreground sm:hidden"
            onClick={() => setIsOpen((o) => !o)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu (unchanged, simple list + children) */}
        {isOpen && (
          <div className="pb-4 sm:hidden">
            <nav className="flex flex-col gap-1 text-sm text-muted-foreground">
              {textLinks.map((item) => (
                <div key={item.key} className="flex flex-col">
                  <a
                    href={item.href || undefined}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    onClick={() => setIsOpen(false)}
                    className="rounded-md px-3 py-2 font-medium transition hover:bg-white/5 hover:text-foreground"
                  >
                    {item.label}
                  </a>

                  {item.children && item.children.length > 0 && (
                    <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-white/10 pl-3 text-xs text-muted-foreground">
                      {item.children.map((child) => (
                        <a
                          key={child.id || child.href}
                          href={child.href}
                          target={child.external ? "_blank" : undefined}
                          rel={child.external ? "noreferrer" : undefined}
                          onClick={() => setIsOpen(false)}
                          className="rounded-md px-2 py-1 font-medium transition hover:bg-white/5 hover:text-foreground"
                        >
                          <span className="block">{child.label}</span>
                          {child.description && (
                            <span className="block text-[0.7rem] text-muted-foreground/80">
                              {child.description}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-1 h-px bg-white/5" />

              <a
                href={contactLink.href}
                target={contactLink.external ? "_blank" : undefined}
                rel={contactLink.external ? "noreferrer" : undefined}
                onClick={() => setIsOpen(false)}
                className="mt-1 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-slate-50 underline-offset-2 transition hover:border-accent hover:bg-white/10"
              >
                {contactLink.label}
              </a>

              <a
                href={resumeLink.href}
                target={resumeLink.external ? "_blank" : undefined}
                rel={resumeLink.external ? "noreferrer" : undefined}
                onClick={() => setIsOpen(false)}
                className="mt-1 rounded-lg border border-accent bg-accent px-3 py-2 text-sm font-medium text-slate-50 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-md"
              >
                {resumeLink.label}
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function DesktopNavItemSimple({
  item,
  onHover,
}: {
  item: NavItem;
  onHover?: () => void;
}) {
  const classes =
    "rounded-md px-2.5 py-1 font-medium text-muted-foreground transition hover:bg-white/10 hover:text-foreground md:px-3 md:py-1.5";

  // no href → do nothing on click (for safety)
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

  return (
    <a href={item.href} className={classes} onMouseEnter={onHover}>
      {item.label}
    </a>
  );
}

function DesktopDropdownItem({ item }: { item: NavDropdownItemCfg }) {
  const IconComponent =
    item.icon && (LucideIcons as any)[item.icon]
      ? (LucideIcons as any)[item.icon]
      : null;

  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
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

/**
 * Build a 3-column mega menu from flat children:
 * - left column = children with column === "left"
 * - right area = 2-column grid with the rest
 * - optional footer (text + link) at bottom
 */
function renderMegaMenuFromChildren(
  children: NavDropdownItemCfg[],
  footer?: NavDropdownFooterCfg
) {
  if (!children || children.length === 0) return null;

  const leftItems = children.filter((c) => c.column === "left");
  const rightItems = children.filter((c) => c.column !== "left");

  return (
    <div className="flex flex-col gap-3">
      {/* Top: left (1/3) + right (2/3) */}
      <div className="flex flex-col gap-3 md:flex-row">
        {/* Left column */}
        <div className="w-full md:w-1/3 md:border-r md:border-white/10 md:pr-4">
          <div className="flex flex-col gap-2">
            {leftItems.map((item) => (
              <DesktopDropdownItem key={item.id || item.href} item={item} />
            ))}
          </div>
        </div>

        {/* Right: 2-column grid */}
        <div className="w-full md:w-2/3 md:pl-4">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-2.5">
            {rightItems.map((item) => (
              <DesktopDropdownItem key={item.id || item.href} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer row (optional) */}
      {footer && (
        <div className="mt-1 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{footer.text}</span>
          <a
            href={footer.href}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            {footer.linkLabel}
          </a>
        </div>
      )}
    </div>
  );
}
