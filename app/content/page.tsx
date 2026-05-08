// app/content/page.tsx
// Content & socials hub — a wider, media-kit-style landing for everywhere
// I publish. Lists each platform with handle, latest-content peek where the
// platform's public feeds allow it (YouTube RSS), and an "Open" CTA. The
// big Beacons.AI tile is the canonical place to view live aggregate stats
// (followers, post counts) since most platforms don't expose those without
// auth.
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BarChart3, Play } from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import { JsonLd } from "@/components/JsonLd";
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

const PAGE_DESCRIPTION = `${siteConfig.name}'s content hub — every social, every channel, in one place. View live stats and follow on each platform.`;

export const metadata: Metadata = {
  title: `Content | ${siteConfig.name}`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/content" },
  openGraph: {
    type: "profile",
    url: "/content",
    title: `${siteConfig.name} · Content & Socials`,
    description: PAGE_DESCRIPTION,
    siteName: `${siteConfig.name} Website`,
    images: [
      {
        url: "/images/og/links.png?v=4",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — content & socials hub`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} · Content & Socials`,
    description: PAGE_DESCRIPTION,
    images: ["/images/og/links.png?v=4"],
  },
  robots: { index: true, follow: true },
};

const BEACONS_MEDIA_KIT = "https://beacons.ai/kevintrinh/mediakit";

// Compact handle (e.g. "@KevinTrinhDev") derived from a profile URL when the
// config doesn't already provide one. Keeps the cards visually consistent.
function handleFromUrl(href: string, fallback = ""): string {
  try {
    const u = new URL(href);
    const seg = u.pathname.split("/").filter(Boolean);
    const last = seg[seg.length - 1] || "";
    if (!last) return fallback;
    return last.startsWith("@") ? last : `@${last.replace(/^in\//, "")}`;
  } catch {
    return fallback;
  }
}

type PlatformCard = {
  key: string;
  label: string;
  handle: string;
  href: string;
  Glyph: (props: { className?: string }) => React.ReactNode;
  blurb: string;
};

export default async function ContentPage() {
  const socialMap = new Map(
    (siteConfig.socialsList ?? []).map((s) => [s.key, s])
  );

  const linkedinHref =
    socialMap.get("linkedin")?.href ||
    "https://www.linkedin.com/in/KevinTrinhDev";
  const youtubeHref =
    socialMap.get("youtube")?.href ||
    "https://www.youtube.com/@KevinTrinhDev";
  const instagramHref =
    socialMap.get("instagram")?.href ||
    "https://www.instagram.com/KevinTrinhDev/";
  const tiktokHref =
    socialMap.get("tiktok")?.href || "https://www.tiktok.com/@KevinTrinhDev";
  const mediumHref =
    socialMap.get("medium")?.href || "https://medium.com/@KevinTrinhDev";
  const githubHref =
    socialMap.get("github")?.href || "https://github.com/KevinTrinhDev";

  const platforms: PlatformCard[] = [
    {
      key: "youtube",
      label: "YouTube",
      handle: "@KevinTrinhDev",
      href: youtubeHref,
      Glyph: YoutubeGlyph,
      blurb: "Tutorials, dev logs, and project demos",
    },
    {
      key: "instagram",
      label: "Instagram",
      handle: handleFromUrl(instagramHref, "@KevinTrinhDev"),
      href: instagramHref,
      Glyph: InstagramGlyph,
      blurb: "Behind-the-scenes & build moments",
    },
    {
      key: "tiktok",
      label: "TikTok",
      handle: handleFromUrl(tiktokHref, "@KevinTrinhDev"),
      href: tiktokHref,
      Glyph: TikTokGlyph,
      blurb: "Short clips, dev tips, and demos",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      handle: "in/KevinTrinhDev",
      href: linkedinHref,
      Glyph: LinkedInGlyph,
      blurb: "Career updates and longer-form takes",
    },
    {
      key: "medium",
      label: "Medium",
      handle: handleFromUrl(mediumHref, "@KevinTrinhDev"),
      href: mediumHref,
      Glyph: MediumGlyph,
      blurb: "Long-form articles & deep dives",
    },
    {
      key: "github",
      label: "GitHub",
      handle: handleFromUrl(githubHref, "@KevinTrinhDev"),
      href: githubHref,
      Glyph: GithubGlyph,
      blurb: "Open-source projects & code",
    },
  ];

  // Pull a few recent YouTube videos for the strip below the platform grid.
  // RSS may be unreachable for some channels — silently fall back to nothing.
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
    ? await loadLatestYouTubeVideos(channelId, 3)
    : [];
  const fallbackVideo =
    latestVideos.length === 0 && featuredVideoId
      ? [
          {
            id: featuredVideoId,
            title: featuredVideoTitle || "Latest video",
            url: `https://www.youtube.com/watch?v=${featuredVideoId}`,
            thumbnailUrl: `https://i.ytimg.com/vi/${featuredVideoId}/hqdefault.jpg`,
            publishedAt: "",
          },
        ]
      : [];
  const videos = latestVideos.length > 0 ? latestVideos : fallbackVideo;

  const year = new Date().getFullYear();

  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${BASE_URL}/content`,
    name: `${siteConfig.name} · Content & Socials`,
    description: PAGE_DESCRIPTION,
    mainEntity: {
      "@type": "Person",
      name: siteConfig.name,
      url: BASE_URL,
      sameAs: platforms.map((p) => p.href),
    },
  };

  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-5 pb-12 pt-14 text-slate-900 sm:pt-16">
      <JsonLd data={profileJsonLd} />

      {/* Top-left: back to /links — keeps the hub navigable both ways */}
      <Link
        href="/links"
        aria-label="Back to all links"
        className="absolute left-4 top-4 inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 sm:left-5 sm:top-5"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        <span>Links</span>
      </Link>

      {/* Header */}
      <header className="mt-10 flex flex-col items-center text-center sm:mt-12">
        <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full ring-1 ring-slate-200 sm:h-24 sm:w-24">
          <Image
            src="/images/avatar.jpg"
            alt={siteConfig.name}
            fill
            sizes="96px"
            className="object-cover"
            priority
          />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
          Content &amp; Socials
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Every place I publish, in one spot. Latest videos, articles, and
          links to follow on each platform.
        </p>
      </header>

      {/* Live-stats hero — image-led card linking to the Beacons media kit */}
      <a
        href={BEACONS_MEDIA_KIT}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="View live stats on Beacons.AI"
        className="group mt-8 flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:border-slate-300 hover:shadow-md"
      >
        <div className="relative aspect-[12/5] w-full overflow-hidden bg-slate-100">
          <Image
            src="/images/mediakitimage.jpg"
            alt="Media kit"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-900 text-white">
              <BarChart3 className="h-4 w-4" aria-hidden />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                Live Media Kit
              </span>
              <span className="text-[12px] text-slate-500">
                Aggregated stats via Beacons.AI
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-700">
            Open
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </div>
      </a>

      {/* Platforms grid */}
      <section className="mt-8" aria-label="Platforms">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Where to follow me
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {platforms.map(({ key, label, handle, href, Glyph, blurb }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Open ${label} (${handle}) in a new tab`}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center">
                <Glyph className="h-10 w-10" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold leading-tight text-slate-900">
                    {label}
                  </span>
                  <span className="truncate text-[12px] font-medium text-slate-500">
                    {handle}
                  </span>
                </span>
                <span className="mt-0.5 line-clamp-1 text-[12px] text-slate-500">
                  {blurb}
                </span>
              </span>
              <ArrowUpRight
                className="h-4 w-4 flex-none text-slate-400 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
                aria-hidden
              />
            </a>
          ))}
        </div>
      </section>

      {/* Recent videos strip */}
      {videos.length > 0 && (
        <section className="mt-8" aria-label="Recent YouTube uploads">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Recent on YouTube
            </h2>
            <a
              href={youtubeHref}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              View channel
            </a>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {videos.map((v) => (
              <a
                key={v.id}
                href={v.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Watch on YouTube: ${v.title}`}
                className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:border-slate-300 hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.thumbnailUrl}
                    alt={v.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex h-10 w-[58px] items-center justify-center rounded-[12px] bg-[#FF0000] text-white shadow-md shadow-black/40 transition-transform duration-200 group-hover:scale-105">
                      <Play className="h-5 w-5 translate-x-[1px] fill-current" />
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <span className="line-clamp-2 flex-1 text-[13px] font-semibold leading-snug text-slate-900">
                    {v.title}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Footer — two lines, matches /links */}
      <div className="mt-auto flex flex-col items-center gap-1 pt-12 text-center text-xs text-slate-500">
        <span>Built &amp; Designed by Kevin Trinh</span>
        <span>© {year} All rights reserved</span>
      </div>
    </main>
  );
}
