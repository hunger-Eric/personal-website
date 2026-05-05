// components/Footer.tsx
import Link from "next/link";
import { Github, Linkedin, Instagram, Youtube, Music2 } from "lucide-react";

import { siteConfig } from "../config/siteConfig";

type SocialEntry = {
  key: string;
  label: string;
  href: string;
};

const SOCIAL_ORDER = ["github", "linkedin", "tiktok", "youtube", "instagram"];

function getSocials(): SocialEntry[] {
  const list: any[] = (siteConfig as any).socialsList ?? [];
  const byKey = new Map<string, any>();
  for (const item of list) {
    if (item?.key && item?.href) byKey.set(String(item.key), item);
  }
  return SOCIAL_ORDER.map((key) => byKey.get(key))
    .filter(Boolean)
    .map((item) => ({
      key: String(item.key),
      label: String(item.label || item.key),
      href: String(item.href),
    }));
}

function iconFor(key: string) {
  switch (key) {
    case "github":
      return Github;
    case "linkedin":
      return Linkedin;
    case "tiktok":
      return Music2;
    case "youtube":
      return Youtube;
    case "instagram":
      return Instagram;
    default:
      return Github;
  }
}

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "About", href: "/about" },
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "Articles", href: "/articles" },
  { label: "Connect", href: "/connect" },
];

export function Footer() {
  const year = new Date().getFullYear();
  const socials = getSocials();
  const name = siteConfig.name || "Kevin Trinh";

  return (
    <footer className="mt-12 border-t border-white/10 bg-transparent">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        {/* Top row: brand on the left, socials on the right */}
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div>
            <p className="text-base font-semibold text-foreground">{name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              CS @ University of Houston · Houston, TX
            </p>
          </div>

          {socials.length ? (
            <div className="flex items-center gap-1">
              {socials.map(({ key, label, href }) => {
                const Icon = iconFor(key);
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-white/5" />

        {/* Bottom row: copyright + nav links */}
        <div className="mt-6 flex flex-col items-center gap-4 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left sm:text-sm">
          <p>
            © {year} {name}. All rights reserved.
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
