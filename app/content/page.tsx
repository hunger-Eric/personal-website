// app/content/page.tsx
// Content and socials hub. Public, crawler-readable index of every channel.
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, BarChart3, Play } from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import {
  GithubGlyph,
  InstagramGlyph,
  LinkedInGlyph,
  MediumGlyph,
  TikTokGlyph,
  YoutubeGlyph,
} from "@/components/BrandGlyphs";
import {
  ActionButton,
  ArchiveCard,
  PageShell,
  SectionHeader,
  Surface,
} from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import { siteConfig } from "@/config/siteConfig";
import { platformBrandColors } from "@/config/visualTokens";
import { loadLatestYouTubeVideos } from "@/config/youtubeFeed";
import { SITE_URL } from "@/lib/site-url";

const copy = getSiteCopy("en");
const PAGE_DESCRIPTION = copy.content.description;
const BEACONS_MEDIA_KIT = "https://beacons.ai/kevintrinh/mediakit";

export const metadata: Metadata = {
  title: `Content | ${siteConfig.name}`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/content" },
  openGraph: {
    type: "profile",
    url: "/content",
    title: `${siteConfig.name} | ${copy.content.heading}`,
    description: PAGE_DESCRIPTION,
    siteName: `${siteConfig.name} Website`,
    images: [
      {
        url: "/images/og/links.png?v=4",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} content and socials hub`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${copy.content.heading}`,
    description: PAGE_DESCRIPTION,
    images: ["/images/og/links.png?v=4"],
  },
  robots: { index: true, follow: true },
};

function handleFromUrl(href: string, fallback = ""): string {
  try {
    const url = new URL(href);
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || "";
    if (!last) return fallback;
    return last.startsWith("@") ? last : `@${last.replace(/^in\//, "")}`;
  } catch {
    return fallback;
  }
}

type PlatformCard = {
  key: keyof typeof copy.content.platformBlurbs;
  label: string;
  handle: string;
  href: string;
  Glyph: (props: { className?: string }) => React.ReactNode;
  blurb: string;
};

export default async function ContentPage() {
  const socialMap = new Map(
    (siteConfig.socialsList ?? []).map((social) => [social.key, social])
  );

  const linkedinHref =
    socialMap.get("linkedin")?.href ||
    "https://www.linkedin.com/in/hunger-Eric";
  const youtubeHref =
    socialMap.get("youtube")?.href || "https://www.youtube.com/@hunger-Eric";
  const instagramHref =
    socialMap.get("instagram")?.href ||
    "https://www.instagram.com/hunger-Eric/";
  const tiktokHref =
    socialMap.get("tiktok")?.href || "https://www.tiktok.com/@hunger-Eric";
  const mediumHref =
    socialMap.get("medium")?.href || "https://medium.com/@hunger-Eric";
  const githubHref =
    socialMap.get("github")?.href || "https://github.com/hunger-Eric";

  const platforms: PlatformCard[] = [
    {
      key: "youtube",
      label: "YouTube",
      handle: "@hunger-Eric",
      href: youtubeHref,
      Glyph: YoutubeGlyph,
      blurb: copy.content.platformBlurbs.youtube,
    },
    {
      key: "instagram",
      label: "Instagram",
      handle: handleFromUrl(instagramHref, "@hunger-Eric"),
      href: instagramHref,
      Glyph: InstagramGlyph,
      blurb: copy.content.platformBlurbs.instagram,
    },
    {
      key: "tiktok",
      label: "TikTok",
      handle: handleFromUrl(tiktokHref, "@hunger-Eric"),
      href: tiktokHref,
      Glyph: TikTokGlyph,
      blurb: copy.content.platformBlurbs.tiktok,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      handle: "in/hunger-Eric",
      href: linkedinHref,
      Glyph: LinkedInGlyph,
      blurb: copy.content.platformBlurbs.linkedin,
    },
    {
      key: "medium",
      label: "Medium",
      handle: handleFromUrl(mediumHref, "@hunger-Eric"),
      href: mediumHref,
      Glyph: MediumGlyph,
      blurb: copy.content.platformBlurbs.medium,
    },
    {
      key: "github",
      label: "GitHub",
      handle: handleFromUrl(githubHref, "@hunger-Eric"),
      href: githubHref,
      Glyph: GithubGlyph,
      blurb: copy.content.platformBlurbs.github,
    },
  ];

  const featuredContent = (
    siteConfig as {
      featuredContent?: {
        youtubeChannelId?: string;
        youtubeVideoId?: string;
        youtubeVideoTitle?: string;
      };
    }
  ).featuredContent;
  const channelId = featuredContent?.youtubeChannelId || "";
  const featuredVideoId = featuredContent?.youtubeVideoId || "";
  const featuredVideoTitle = featuredContent?.youtubeVideoTitle || "";

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
    url: `${SITE_URL}/content`,
    name: `${siteConfig.name} | ${copy.content.heading}`,
    description: PAGE_DESCRIPTION,
    mainEntity: {
      "@type": "Person",
      name: siteConfig.name,
      url: SITE_URL,
      sameAs: platforms.map((platform) => platform.href),
    },
  };

  return (
    <PageShell
      tone="public"
      className="min-h-[100dvh] px-5 py-6 sm:px-6 sm:py-8"
    >
      <JsonLd data={profileJsonLd} />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div>
          <ActionButton
            href="/links"
            tone="ghost"
            aria-label="Back to all links"
            icon={<ArrowLeft className="h-4 w-4" aria-hidden />}
          >
            {copy.content.backToLinks}
          </ActionButton>
        </div>

        <SectionHeader
          eyebrow="Public Channel Index"
          title={copy.content.heading}
          description={copy.content.description}
        />

        <a
          href={BEACONS_MEDIA_KIT}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="View live stats on Beacons.AI"
          className="group block"
        >
          <Surface
            tone="paper"
            className="overflow-hidden shadow-card transition-shadow duration-150 group-hover:shadow-overlay"
          >
            <div className="relative aspect-[12/5] w-full overflow-hidden bg-muted">
              <Image
                src="/images/mediakitimage.jpg"
                alt="Media kit"
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-foreground text-background">
                  <BarChart3 className="h-4 w-4" aria-hidden />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {copy.content.mediaKitTitle}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {copy.content.mediaKitDescription}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                {copy.content.mediaKitAction}
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </div>
          </Surface>
        </a>

        <section aria-label="Platforms">
          <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {copy.content.platformsHeading}
          </h2>
          <Surface tone="paper" className="px-5">
            {platforms.map(({ key, label, handle, href, Glyph, blurb }) => (
              <ArchiveCard
                key={key}
                href={href}
                title={
                  <span className="inline-flex items-center gap-3">
                    <span className="flex h-10 w-10 flex-none items-center justify-center">
                      <Glyph className="h-10 w-10" />
                    </span>
                    <span>{label}</span>
                  </span>
                }
                description={blurb}
                meta={handle}
                action={<ArrowUpRight className="h-4 w-4" aria-hidden />}
              />
            ))}
          </Surface>
        </section>

        {videos.length > 0 ? (
          <section aria-label="Recent YouTube uploads">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {copy.content.videosHeading}
              </h2>
              <a
                href={youtubeHref}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                {copy.content.viewChannel}
              </a>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Watch on YouTube: ${video.title}`}
                  className="group block overflow-hidden rounded-card border border-hairline bg-surface-paper-elevated shadow-card transition-shadow duration-150 hover:shadow-overlay"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-surface-graphite">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="inline-flex h-10 w-[58px] items-center justify-center rounded-control text-accent-foreground shadow-card transition-transform duration-200 group-hover:scale-105"
                        style={{ backgroundColor: platformBrandColors.youtube }}
                      >
                        <Play className="h-5 w-5 translate-x-[1px] fill-current" />
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <span className="line-clamp-2 flex-1 text-[13px] font-semibold leading-snug text-foreground">
                      {video.title}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <div className="flex flex-col items-center gap-1 pt-4 text-center text-xs text-muted-foreground">
          <span>{copy.content.builtBy}</span>
          <span>
            © {year} {copy.content.rights}
          </span>
        </div>
      </main>
    </PageShell>
  );
}
