// app/links/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Mail } from "lucide-react";

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
  MediumGlyph,
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
    icon: React.ReactNode;
  }> = [
    {
      key: "portfolio",
      label: "Portfolio Website",
      description: "My main personal site",
      href: `${BASE_URL}/`,
      icon: (
        <Image
          src="/images/favicon.png"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 rounded-md object-contain"
        />
      ),
    },
    {
      key: "projects",
      label: "Projects",
      description: "Builds & open source on GitHub",
      href: "https://github.com/KevinTrinhDev",
      icon: <GithubGlyph className="h-7 w-7" />,
    },
    {
      key: "articles",
      label: "Articles",
      description: "Writing, deep dives, and dev notes",
      href: `${BASE_URL}/articles`,
      icon: <MediumGlyph className="h-7 w-7" />,
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
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center bg-white px-5 pb-10 pt-16 text-slate-900 sm:pt-20">
      <JsonLd data={profileJsonLd} />

      {/* Top-left: Email */}
      <a
        href={emailHref}
        aria-label={`Email ${siteConfig.name}`}
        title={`Email ${siteConfig.name}`}
        className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 sm:left-5 sm:top-5"
      >
        <Mail className="h-4 w-4" aria-hidden />
      </a>

      {/* Top-right: Share */}
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-5 sm:top-5">
        <ShareButton
          label="Share"
          showLabel={false}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
        />
      </div>

      {/* Avatar */}
      <div className="relative mb-5 h-28 w-28 overflow-hidden rounded-full ring-1 ring-slate-200 sm:h-32 sm:w-32">
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
      <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {siteConfig.name}
      </h1>

      {/* Location */}
      <div className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-500">
        <FilledMapPin className="h-4 w-4 text-slate-400" />
        <span>{siteConfig.location || "Houston, TX"}</span>
      </div>

      {/* Description — same-color keyword pipes */}
      <p className="mt-3 max-w-xs text-center text-[13px] font-medium tracking-wide text-slate-700 sm:text-sm">
        <span>Software</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>Tech</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>Builder</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>CS @ UH</span>
      </p>

      {/* Social glyphs */}
      {socials.length > 0 && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
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
      <div className="mt-7 flex w-full flex-col gap-3">
        {bigButtons.map(({ key, label, description, href, icon }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="inline-flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 flex-none items-center justify-center">
                {icon}
              </span>
              <span className="flex min-w-0 flex-col text-left">
                <span className="text-sm font-semibold leading-tight text-slate-900">
                  {label}
                </span>
                <span className="text-[12px] font-normal leading-snug text-slate-500">
                  {description}
                </span>
              </span>
            </span>
            <ArrowUpRight
              className="h-4 w-4 flex-none text-slate-400 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
              aria-hidden
            />
          </a>
        ))}
      </div>

      {/* Latest TikTok — clean light card, no gradient */}
      <a
        href={tiktokHref}
        target="_blank"
        rel="noreferrer noopener"
        className="group mt-4 block w-full overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <TikTokGlyph className="h-14 w-14 transition-transform duration-200 group-hover:scale-110" />
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            TikTok
          </span>
          <span className="line-clamp-1 text-sm font-medium text-slate-700">
            Latest TikTok — placeholder
          </span>
        </div>
      </a>

      {/* Copyright */}
      <div className="mt-auto pt-10 text-center text-xs leading-relaxed text-slate-400">
        <div>Built by Kevin Trinh</div>
        <div>© {year} All rights reserved</div>
      </div>
    </main>
  );
}
