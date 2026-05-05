// components/Footer.tsx
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

export function Footer() {
  const year = new Date().getFullYear();
  const socials = getSocials();
  const name = siteConfig.name || "Kevin Trinh";

  return (
    <footer className="mt-12 bg-transparent">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center">
        {socials.length ? (
          <div className="flex items-center gap-4">
            {socials.map(({ key, label, href }) => {
              const Icon = iconFor(key);
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  title={label}
                  className="text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              );
            })}
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground sm:text-sm">
          © {year} {name}
        </p>
      </div>
    </footer>
  );
}
