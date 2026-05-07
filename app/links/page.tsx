// app/links/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  UserPlus,
  Play,
  GraduationCap,
  Wrench,
  Newspaper,
  Image as ImageIcon,
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
  MediumGlyph,
} from "@/components/BrandGlyphs";
import { loadProjects, type ProjectItem } from "@/config/projects";

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
        url: "/images/og/links.png",
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
    images: ["/images/og/links.png"],
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

export default async function LinksPage() {
  const socialMap = new Map(
    (siteConfig.socialsList ?? []).map((s) => [s.key, s])
  );

  const emailEntry = socialMap.get("email");
  const emailHref =
    typeof emailEntry?.href === "string" && emailEntry.href.startsWith("mailto:")
      ? emailEntry.href
      : "mailto:hi@kevintrinh.dev";

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

  // Featured projects (carousel) — fall back to first projects if none flagged
  let featuredProjects: ProjectItem[] = [];
  try {
    const all = await loadProjects();
    const featured = all.filter((p) => p.featured);
    featuredProjects = (featured.length ? featured : all).slice(0, 5);
  } catch {
    featuredProjects = [];
  }

  // YouTube tile (replaces previous TikTok tile)
  const youtubeChannel =
    socialMap.get("youtube")?.href ||
    "https://www.youtube.com/@KevinTrinhDev";
  const ytId = (siteConfig as any).featuredContent?.youtubeVideoId as
    | string
    | undefined;
  const youtubeHref = ytId
    ? `https://www.youtube.com/watch?v=${ytId}`
    : youtubeChannel;
  const youtubeThumb = ytId
    ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
    : null;

  // CoogCasa cards
  const coogCasaCards: Array<{
    key: string;
    label: string;
    description: string;
    href: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "coogcasa-scholarships",
      label: "UH Scholarships",
      description: "Curated scholarships for UH students",
      href: "https://coogcasa.com/scholarships",
      icon: <GraduationCap className="h-5 w-5 text-emerald-600" />,
    },
    {
      key: "coogcasa-tools",
      label: "Student Tools",
      description: "Free tools made for UH students",
      href: "https://coogcasa.com/tools",
      icon: <Wrench className="h-5 w-5 text-sky-600" />,
    },
    {
      key: "coogcasa-home",
      label: "CoogCasa.com",
      description: "Home for everything UH",
      href: "https://coogcasa.com",
      icon: <Newspaper className="h-5 w-5 text-indigo-600" />,
    },
  ];

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
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center px-5 pb-10 pt-16 text-slate-900 sm:pt-20">
      <JsonLd data={profileJsonLd} />

      {/* Top-left: Save contact (vCard) */}
      <a
        href="/contact.vcf"
        download="KevinTrinh.vcf"
        aria-label={`Save ${siteConfig.name} to your contacts`}
        title="Save my contact"
        className="absolute left-4 top-4 inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 sm:left-5 sm:top-5"
      >
        <UserPlus className="h-4 w-4" aria-hidden />
        <span>Save contact</span>
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

      {/* Tagline */}
      <p className="mt-3 max-w-xs text-center text-[13px] font-medium tracking-wide text-slate-700 sm:text-sm">
        <span>Software</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>Tech</span>
        <span className="mx-2 text-slate-300">|</span>
        <span>Creator</span>
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

      {/* Popular projects — horizontal scroll */}
      {featuredProjects.length > 0 && (
        <section className="mt-7 w-full" aria-label="Popular projects">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Popular projects
            </h2>
            <Link
              href="/projects"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              View all
            </Link>
          </div>

          <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {featuredProjects.map((p) => {
              const liveLink = p.links?.find((l) => l.type === "live");
              const repo = p.githubRepoUrl;
              const slugHref = `/projects/${p.id}`;
              const href = liveLink?.href || repo || slugHref;
              const img = p.imageUrl || "/images/demo_1.png";
              return (
                <a
                  key={p.id}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                  className="group flex w-56 flex-none snap-start flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 px-3 py-2">
                    <span className="line-clamp-1 text-sm font-semibold text-slate-900">
                      {p.name}
                    </span>
                    <span className="line-clamp-2 text-[12px] leading-snug text-slate-500">
                      {p.summary}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured YouTube — replaces the previous TikTok tile */}
      <a
        href={youtubeHref}
        target="_blank"
        rel="noreferrer noopener"
        className="group mt-4 block w-full overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50"
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          {youtubeThumb ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youtubeThumb}
                alt="Featured YouTube video"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                  <Play className="h-5 w-5 translate-x-[1px] fill-current" />
                </span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <YoutubeGlyph className="h-14 w-14 transition-transform duration-200 group-hover:scale-110" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
            YouTube
          </span>
          <span className="line-clamp-1 text-sm font-medium text-slate-700">
            Latest from my channel
          </span>
        </div>
      </a>

      {/* CoogCasa — UH student stuff */}
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

        <div className="flex flex-col gap-2">
          {coogCasaCards.map(({ key, label, description, href, icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-slate-100">
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
              <ArrowUpRight
                className="ml-auto h-4 w-4 flex-none text-slate-400 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
                aria-hidden
              />
            </a>
          ))}
        </div>
      </section>

      {/* Media kit — bottom block */}
      <section className="mt-7 w-full" aria-label="Media kit">
        <a
          href={`mailto:${emailHref.replace(/^mailto:/i, "")}?subject=Media%20kit%20request`}
          className="group inline-flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-slate-100">
            <ImageIcon className="h-5 w-5 text-slate-700" />
          </span>
          <span className="flex min-w-0 flex-col text-left">
            <span className="text-sm font-semibold leading-tight text-slate-900">
              Media kit
            </span>
            <span className="text-[12px] font-normal leading-snug text-slate-500">
              For brands &amp; partnerships — email me
            </span>
          </span>
          <ArrowUpRight
            className="ml-auto h-4 w-4 flex-none text-slate-400 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-700"
            aria-hidden
          />
        </a>
      </section>

      {/* Copyright */}
      <div className="mt-auto pt-10 text-center text-xs leading-relaxed text-slate-400">
        <div>Built by Kevin Trinh</div>
        <div>© {year} All rights reserved</div>
      </div>
    </main>
  );
}
