// components/Navbar.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "../config/siteConfig";
import { Menu, X } from "lucide-react";

type NavItemCfg = {
  id?: string; // e.g. "about", "projects", "resume"
  href?: string; // override link (external or internal)
  label?: string; // visible text
  show?: boolean; // toggle visibility
  isButton?: boolean; // render as button (e.g., Resume)
  external?: boolean; // force new tab
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navCfg = (siteConfig as any).nav as
    | { items?: NavItemCfg[] }
    | undefined;

  const visibleItems = useMemo(() => {
    // If nav.items provided, use it exactly (respect show/hide, labels, href, isButton)
    if (Array.isArray(navCfg?.items) && navCfg!.items.length > 0) {
      return navCfg!.items
        .filter((it) => it?.show !== false)
        .map((it) => {
          const id = it.id ?? "";
          const label =
            it.label ??
            (id ? id.charAt(0).toUpperCase() + id.slice(1) : "Link");

          // default href: anchor by id
          const href = it.href ?? (id ? `#${id}` : "#");

          const external = it.external ?? href.startsWith("http");
          const isButton = !!it.isButton; // you’ll mark Resume as true in JSON

          return {
            key: id || href,
            id,
            label,
            href,
            external,
            isButton,
          };
        });
    }

    // Fallback to sections flags (legacy behavior)
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

    const items = defaults
      .filter((d) => siteConfig.sections[d.id])
      .map((d) => ({
        key: d.id,
        id: d.id,
        label: d.label,
        href: `#${d.id}`,
        external: false,
        isButton: false,
      }));

    if (siteConfig.sections.resume) {
      items.push({
        key: "resume",
        id: "resume",
        label: "My Resume",
        href: "/resume",
        external: true,
        isButton: true,
      });
    }

    return items;
  }, [navCfg]);

  const textLinks = visibleItems.filter((i) => !i.isButton);
  const buttonLinks = visibleItems.filter((i) => i.isButton);

  // Show subtitle if there aren’t too many regular items
  const showSubtitle = textLinks.length <= 5;

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/favicon.png"
              alt="kevintrinh.dev logo"
              width={24}
              height={24}
              className="rounded-sm"
            />
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight sm:text-lg">
                kevintrinh.dev
              </span>
              {showSubtitle && (
                <span className="hidden text-[11px] text-muted-foreground lg:inline lg:text-sm">
                  {siteConfig.title}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-4 hidden flex-1 items-center justify-end gap-2 text-xs text-muted-foreground sm:flex md:text-sm">
            {textLinks.map((item) =>
              item.external ? (
                <a
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full px-3 py-1.5 font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                >
                  {item.label}
                </a>
              ) : (
                <a
                  key={item.key}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 font-medium text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                >
                  {item.label}
                </a>
              )
            )}

            {buttonLinks.map((item) => (
              <a
                key={item.key}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-medium text-muted-foreground underline-offset-2 transition hover:border-accent hover:bg-white/5 hover:text-foreground md:text-sm"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            className="ml-2 inline-flex items-center justify-center rounded-md border border-white/15 p-1.5 text-muted-foreground hover:border-accent hover:text-foreground sm:hidden"
            onClick={() => setIsOpen((o) => !o)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="pb-4 sm:hidden">
            <nav className="flex flex-col gap-1 text-sm text-muted-foreground">
              {visibleItems.map((item) => {
                const base =
                  "rounded-full px-3 py-2 font-medium transition hover:bg-white/5 hover:text-foreground";
                if (item.external) {
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setIsOpen(false)}
                      className={base}
                    >
                      {item.label}
                    </a>
                  );
                }
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={base}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
