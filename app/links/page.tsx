// app/links/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, Play } from "lucide-react";

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
import { loadLatestYouTubeVideos } from "@/config/youtubeFeed";

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://kevintrinh.dev"
).replace(/\/$/, "");

const LINKS_DESCRIPTION = `Where ${siteConfig.name} hangs out online — socials, portfolio, and content in one link.`;

// Feature flags — flip to true to surface a section.
const SHOW_ARTICLES_SECTION = false;
const SHOW_COOGCASA_SECTION = false;
const SHOW_MEDIA_KIT = false;

export const metadata: Metadata = {
  title: `Links | ${siteConfig.name}`,
  description: LINKS_DESCRIPTION,
  alternates: { canonical: "/links" },
  openGraph: {
    type: "profile",
    url: "/links",
    title: `${siteConfig.name} · Links`,
    description: LINKS_DESCRIPTION,
    siteName: `${siteConfig.name} Website`,
    images: [
      {
        url: "/images/og/links.png?v=4",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — links to socials, projects, and articles`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} · Links`,
    description: LINKS_DESCRIPTION,
    images: ["/images/og/links.png?v=4"],
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
  "linkedin",
  "youtube",
  "instagram",
  "tiktok",
] as const;

function glyphForKey(key: string) {
  switch (key) {
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

// Distinguish internal vs external hrefs so we can route same-tab for
// internal links (faster, in-app-browser-friendly) and only open new tabs
// for genuinely external destinations.
function isExternal(href: string): boolean {
  if (!href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  try {
    const u = new URL(href, BASE_URL);
    return u.host !== new URL(BASE_URL).host;
  } catch {
    return false;
  }
}

export default async function LinksPage() {
  const socialMap = new Map(
    (siteConfig.socialsList ?? []).map((s) => [s.key, s])
  );

  const emailEntry = socialMap.get("email");
  const emailHref =
    typeof emailEntry?.href === "string" && emailEntry.href.startsWith("mailto:")
      ? emailEntry.href
      : "mailto:contact@kevintrinh.dev";

  const socials: SocialGlyph[] = SOCIAL_ORDER.flatMap((key) => {
    const s = socialMap.get(key);
    const href = (s?.href || "").trim();
    if (!s || !href || href === "null" || href.startsWith("copy:")) return [];
    const Glyph = glyphForKey(key);
    if (!Glyph) return [];
    return [{ key, label: s.label || key, href, Glyph }];
  });

  // Big buttons — Articles row removed per latest revision; Portfolio is now
  // an internal Link (same tab) for fast switching.
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
      href: "/",
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
      description: "Read my writing on Medium",
      href: "https://medium.com/@KevinTrinhDev",
      icon: <MediumGlyph className="h-7 w-7" />,
    },
  ];

  // YouTube tile — prefer the channel's most recent upload from the public
  // RSS feed; fall back to the pinned featured video / channel link.
  const youtubeChannel =
    socialMap.get("youtube")?.href ||
    "https://www.youtube.com/@KevinTrinhDev";
  const channelId =
    ((siteConfig as any).featuredContent?.youtubeChannelId as
      | string
      | undefined) || "";
  const featuredVideoId =
    ((siteConfig as any).featuredContent?.youtubeVideoId as
      | string
      | undefined) || "";
  const featuredVideoTitle =
    ((siteConfig as any).featuredContent?.youtubeVideoTitle as
      | string
      | undefined) || "";
  const latestVideos = channelId
    ? await loadLatestYouTubeVideos(channelId, 1)
    : [];
  const latestVideo = latestVideos[0];
  const ytId = latestVideo?.id || featuredVideoId;
  const ytTitle =
    latestVideo?.title || featuredVideoTitle || "Latest from my channel";
  const youtubeHref = latestVideo?.url
    ? latestVideo.url
    : ytId
    ? `https://www.youtube.com/watch?v=${ytId}`
    : youtubeChannel;
  // Use hqdefault.jpg — sharper than mqdefault for the larger card.
  const youtubeThumb = ytId
    ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
    : null;

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

  // Reusable big-button render that picks <a> vs <Link> based on hostname.
  const renderBigButton = (
    btn: (typeof bigButtons)[number],
    extraClassName?: string
  ) => {
    const inner = (
      <>
        <span className="inline-flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center">
            {btn.icon}
          </span>
          <span className="flex min-w-0 flex-col text-left">
            <span className="text-sm font-semibold leading-tight text-slate-900">
              {btn.label}
            </span>
            <span className="text-[12px] font-normal leading-snug text-slate-500">
              {btn.description}
            </span>
          </span>
        </span>
        <ArrowUpRight
          className="h-4 w-4 flex-none text-slate-400 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
          aria-hidden
        />
      </>
    );
    const className =
      "group inline-flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50" +
      (extraClassName ? ` ${extraClassName}` : "");
    if (isExternal(btn.href)) {
      return (
        <a
          key={btn.key}
          href={btn.href}
          target="_blank"
          rel="noreferrer noopener"
          className={className}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link key={btn.key} href={btn.href} className={className}>
        {inner}
      </Link>
    );
  };

  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center px-5 pb-10 pt-16 text-slate-900 sm:pt-20">
      <JsonLd data={profileJsonLd} />

      {/* Top-left: Email (mailto) — pill with label */}
      <a
        href={emailHref}
        aria-label={`Email ${siteConfig.name}`}
        title={`Email ${siteConfig.name}`}
        className="absolute left-4 top-4 inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 sm:left-5 sm:top-5"
      >
        <Mail className="h-4 w-4" aria-hidden />
        <span>Contact me</span>
      </a>

      {/* Top-right: Share — icon only */}
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

      {/* Tagline — Software | Tech | Creator | Builder */}
      <p className="mt-3 max-w-xs text-center text-[13px] font-medium tracking-wide text-slate-700 sm:text-sm">
        <span>Software</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>Tech</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>Creator</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>Builder</span>
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
        {bigButtons.map((btn) => renderBigButton(btn))}
      </div>

      {/* Recent YouTube upload — section header + thumbnail-only card */}
      <section className="mt-7 w-full" aria-label="Recent YouTube Upload">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recent YouTube Upload
          </h2>
          <a
            href={youtubeChannel}
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            View channel
          </a>
        </div>
        <a
          href={youtubeHref}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Watch on YouTube: ${ytTitle}`}
          className="group block w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:border-slate-300 hover:shadow-md"
        >
          <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
            {youtubeThumb ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={youtubeThumb}
                  alt={ytTitle}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                {/* Gradient for legibility of overlays */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/20" />
                {/* Center play button — accurate YouTube red & shape */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex h-12 w-[68px] items-center justify-center rounded-[14px] bg-[#FF0000] text-white shadow-md shadow-black/40 transition-transform duration-200 group-hover:scale-105">
                    <Play className="h-[22px] w-[22px] translate-x-[1px] fill-current" />
                  </span>
                </div>
                {/* Top-left: avatar + video title overlay (fades right) */}
                <div className="absolute left-2.5 right-2.5 top-2.5 flex items-center gap-2.5">
                  <span className="relative inline-flex h-9 w-9 flex-none overflow-hidden rounded-full ring-1 ring-white/40">
                    <Image
                      src="/images/avatar.jpg"
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </span>
                  <span
                    className="block min-w-0 flex-1 overflow-hidden whitespace-nowrap text-[17px] font-bold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
                    style={{
                      WebkitMaskImage:
                        "linear-gradient(to right, #000 78%, transparent)",
                      maskImage:
                        "linear-gradient(to right, #000 78%, transparent)",
                    }}
                  >
                    {ytTitle}
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <YoutubeGlyph className="h-14 w-14" />
              </div>
            )}
          </div>
        </a>
      </section>

      {/* Legacy: standalone Articles section — kept behind a flag for easy
          re-enable, but Articles is now a third big button (Portfolio /
          Projects / Articles) so this is normally off. */}
      {SHOW_ARTICLES_SECTION && (
        <section className="mt-7 w-full" aria-label="Articles">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Articles
            </h2>
            <Link
              href="/articles"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              View all
            </Link>
          </div>
          <Link
            href="/articles"
            className="group inline-flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-slate-100">
              <MediumGlyph className="h-5 w-5" />
            </span>
            <span className="flex min-w-0 flex-col text-left">
              <span className="text-sm font-semibold leading-tight text-slate-900">
                Latest articles
              </span>
              <span className="text-[12px] font-normal leading-snug text-slate-500">
                Writing, deep dives, and dev notes
              </span>
            </span>
            <ArrowUpRight
              className="ml-auto h-4 w-4 flex-none text-slate-400 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
              aria-hidden
            />
          </Link>
        </section>
      )}

      {/* CoogCasa block — currently disabled. Keep wired for easy re-enable. */}
      {SHOW_COOGCASA_SECTION && (
        <section className="mt-7 w-full" aria-label="CoogCasa">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              CoogCasa · UH student hub
            </h2>
            <a
              href="https://coogcasa.com"
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Visit
            </a>
          </div>
        </section>
      )}

      {/* Media kit — image-led card: banner on top, CTA below.
          Hidden behind SHOW_MEDIA_KIT flag — flip to true to re-enable. */}
      {SHOW_MEDIA_KIT && (
        <a
          href="https://beacons.ai/kevintrinh/mediakit"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="View my media kit"
          className="group mt-4 flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50"
        >
          <div className="relative aspect-[12/5] w-full overflow-hidden bg-slate-100">
            <Image
              src="/images/mediakitimage.jpg"
              alt="Media kit"
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
            />
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm font-semibold leading-tight text-slate-900">
              View My Media Kit
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500">
              <span className="hidden sm:inline">Live stats via</span>
              <span className="sm:hidden">via</span>
              <span className="font-semibold text-slate-700">Beacons.AI</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 text-slate-400 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
                aria-hidden
              />
            </span>
          </div>
        </a>
      )}

      {/* Footer — two lines */}
      <div className="mt-auto flex flex-col items-center gap-1 pt-10 text-center text-xs text-slate-500">
        <span>Built &amp; Designed by Kevin Trinh</span>
        <span>© {year} All rights reserved</span>
      </div>
    </main>
  );
}
