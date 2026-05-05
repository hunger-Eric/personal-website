// components/Footer.tsx
import {
  GithubGlyph,
  LinkedInGlyph,
  YoutubeGlyph,
  InstagramGlyph,
  TikTokGlyph,
} from "@/components/BrandGlyphs";

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

function glyphFor(key: string) {
  switch (key) {
    case "github":
      return GithubGlyph;
    case "linkedin":
      return LinkedInGlyph;
    case "tiktok":
      return TikTokGlyph;
    case "youtube":
      return YoutubeGlyph;
    case "instagram":
      return InstagramGlyph;
    default:
      return GithubGlyph;
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
          <div className="flex items-center gap-3">
            {socials.map(({ key, label, href }) => {
              const Glyph = glyphFor(key);
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="group inline-flex items-center justify-center transition-transform duration-150 hover:-translate-y-0.5"
                >
                  <Glyph className="h-7 w-7 transition-transform duration-150 group-hover:scale-110" />
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
