// app/links/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowUpRight,
  Folder,
  Globe,
  Mail,
  Newspaper,
} from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import { ShareButton } from "@/components/ShareButton";
import { JsonLd } from "@/components/JsonLd";
import { FilledMapPin } from "@/components/FilledIcons";
import {
  GithubGlyph,
  LinkedInGlyph,
  YoutubeGlyph,
  InstagramGlyph,
  TikTokGlyph,
} from "@/components/BrandGlyphs";

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://kevintrinh.dev"
).replace(/\/$/, "");

const LINKS_DESCRIPTION = `Where ${siteConfig.name} hangs out online — socials, portfolio, and content in one link.`;

export const metadata: Metadata = {
  title: `Links | ${siteConfig.name}`,
  description: LINKS_DESCRIPTION,
  alternates: { canonical: "/links" },
  openGraph: {
    type: "profile",
    url: "/links",
    title: `${siteConfig.name} · Links`,
    description: LINKS_DESCRIPTION,
    siteName: `${siteConfig.name} Portfolio`,
    images: [
      {
        url: "/images/demo_1.png",
        width: 1864,
        height: 952,
        alt: `${siteConfig.name} — links to socials, projects, and articles`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} · Links`,
    description: LINKS_DESCRIPTION,
    images: ["/images/demo_1.png"],
  },
  robots: { index: true, follow: true },
};

type SocialGlyph = {
  key: string;
  label: string;
  href: string;
  Glyph: (props: { className?: string }) => React.ReactNode;
};

const SOCIAL_ORDER = [
  "github",
  "linkedin",
  "youtube",
  "instagram",
  "tiktok",
] as const;

function glyphForKey(key: string) {
  switch (key) {
    case "github":
      return GithubGlyph;
    case "linkedin":
      return LinkedInGlyph;
    case "youtube":
      return YoutubeGlyph;
    case "instagram":
      return InstagramGlyph;
    case "tiktok":
      return TikTokGlyph;
    default:
      return null;
  }
}

export default function LinksPage() {
  const socialMap = new Map(
    (siteConfig.socialsList ?? []).map((s) => [s.key, s])
  );

  const emailEntry = socialMap.get("email");
  const emailHref =
    typeof emailEntry?.href === "string" && emailEntry.href.startsWith("mailto:")
      ? emailEntry.href
      : "mailto:kevin@kevintrinh.dev";

  const socials: SocialGlyph[] = SOCIAL_ORDER.flatMap((key) => {
    const s = socialMap.get(key);
    const href = (s?.href || "").trim();
    if (!s || !href || href === "null" || href.startsWith("copy:")) return [];
    const Glyph = glyphForKey(key);
    if (!Glyph) return [];
    return [{ key, label: s.label || key, href, Glyph }];
  });

  const bigButtons: Array<{
    key: string;
    label: string;
    description: string;
    href: string;
    Icon: typeof Globe;
    iconBg: string;
    iconColor: string;
  }> = [
    {
      key: "portfolio",
      label: "Portfolio Website",
      description: "My main personal site",
      href: `${BASE_URL}/`,
      Icon: Globe,
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-300",
    },
    {
      key: "projects",
      label: "Projects",
      description: "Builds & open source on GitHub",
      href: "https://github.com/KevinTrinhDev",
      Icon: Folder,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-300",
    },
    {
      key: "articles",
      label: "Articles",
      description: "Writing, deep dives, and dev notes",
      href: `${BASE_URL}/articles`,
      Icon: Newspaper,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-300",
    },
  ];

  // TikTok hub URL (fallback if not in config)
  const tiktokHref =
    socialMap.get("tiktok")?.href || "https://www.tiktok.com/@KevinTrinhDev";

  const year = new Date().getFullYear();

  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${BASE_URL}/links`,
    name: `${siteConfig.name} · Links`,
    description: LINKS_DESCRIPTION,
    mainEntity: {
      "@type": "Person",
      name: siteConfig.name,
      url: BASE_URL,
      jobTitle: siteConfig.title,
      ...(siteConfig.location && {
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.location,
        },
      }),
      sameAs: (siteConfig.socialsList ?? [])
        .filter((s) => s.key !== "handshake")
        .map((s) => s.href)
        .filter(
          (h): h is string => typeof h === "string" && /^https?:\/\//i.test(h)
        ),
      email: emailHref.replace(/^mailto:/i, ""),
    },
  };

  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center px-5 pb-10 pt-16 sm:pt-20">
      <JsonLd data={profileJsonLd} />

      {/* Soft ambient glow behind the avatar */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl"
      />

      {/* Top-left: Email — circle */}
      <a
        href={emailHref}
        aria-label={`Email ${siteConfig.name}`}
        title={`Email ${siteConfig.name}`}
        className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-500/15 text-indigo-200 transition-colors hover:border-indigo-300 hover:bg-indigo-500/25 hover:text-white sm:left-5 sm:top-5"
      >
        <Mail className="h-4 w-4" aria-hidden />
      </a>

      {/* Top-right: Share — circle */}
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-5 sm:top-5">
        <ShareButton
          label="Share"
          showLabel={false}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-colors hover:border-accent hover:bg-white/10 hover:text-white"
        />
      </div>

      {/* Avatar */}
      <div className="relative z-10 mb-5 h-28 w-28 overflow-hidden rounded-full ring-2 ring-indigo-400/30 sm:h-32 sm:w-32">
        <Image
          src="/images/avatar.jpg"
          alt={siteConfig.name}
          fill
          sizes="128px"
          className="object-cover"
          priority
        />
      </div>

      {/* Name */}
      <h1 className="z-10 text-center text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
        {siteConfig.name}
      </h1>

      {/* Location */}
      <div className="z-10 mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <FilledMapPin className="h-4 w-4 text-slate-200/70" />
        <span>{siteConfig.location || "Houston, TX"}</span>
      </div>

      {/* Description — keyword pipes */}
      <p className="z-10 mt-3 max-w-xs text-center text-[13px] font-medium tracking-wide text-slate-200/85 sm:text-sm">
        <span className="text-indigo-300">Full-stack</span>
        <span className="mx-2 text-muted-foreground">|</span>
        <span>ML</span>
        <span className="mx-2 text-muted-foreground">|</span>
        <span>Cloud</span>
        <span className="mx-2 text-muted-foreground">|</span>
        <span>CS @ UH</span>
      </p>

      {/* Social glyphs row — branded tiles, uniform size, no outline wrapper */}
      {socials.length > 0 && (
        <div className="z-10 mt-7 flex flex-wrap items-center justify-center gap-3">
          {socials.map(({ key, label, href, Glyph }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              title={label}
              className="group inline-flex h-7 w-7 items-center justify-center transition-transform duration-150 hover:-translate-y-0.5"
            >
              <Glyph className="h-7 w-7 transition-transform duration-150 group-hover:scale-110" />
            </a>
          ))}
        </div>
      )}

      {/* Big buttons */}
      <div className="z-10 mt-7 flex w-full flex-col gap-3">
        {bigButtons.map(
          ({ key, label, description, href, Icon, iconBg, iconColor }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-slate-50 transition-all duration-150 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-white/[0.08] hover:shadow-[0_4px_24px_-12px_rgba(99,102,241,0.5)]"
            >
              <span className="inline-flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-10 w-10 flex-none items-center justify-center rounded-lg ${iconBg} ${iconColor} transition-colors`}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col text-left">
                  <span className="text-sm font-semibold leading-tight text-slate-50">
                    {label}
                  </span>
                  <span className="text-[12px] font-normal leading-snug text-muted-foreground">
                    {description}
                  </span>
                </span>
              </span>
              <ArrowUpRight
                className="h-4 w-4 flex-none text-muted-foreground transition-all duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                aria-hidden
              />
            </a>
          )
        )}
      </div>

      {/* Latest TikTok — placeholder for now */}
      <a
        href={tiktokHref}
        target="_blank"
        rel="noreferrer noopener"
        className="group z-10 mt-4 block w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-150 hover:-translate-y-0.5 hover:border-fuchsia-500/40 hover:shadow-[0_4px_24px_-12px_rgba(232,121,249,0.45)]"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-fuchsia-600/45 via-pink-600/35 to-cyan-500/35">
          <div className="absolute inset-0 flex items-center justify-center">
            <TikTokGlyph className="h-16 w-16 transition-transform duration-200 group-hover:scale-110" />
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-fuchsia-500/30 bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fuchsia-200">
            TikTok
          </span>
          <span className="line-clamp-1 text-sm font-medium text-slate-100">
            Latest TikTok — placeholder
          </span>
        </div>
      </a>

      {/* Copyright */}
      <div className="z-10 mt-auto pt-10 text-center text-xs leading-relaxed text-muted-foreground/70">
        <div>Built by Kevin Trinh</div>
        <div>© {year} All rights reserved</div>
      </div>
    </main>
  );
}
