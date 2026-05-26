// app/links/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import { ShareButton } from "@/components/ShareButton";
import { JsonLd } from "@/components/JsonLd";
import { FilledMapPin } from "@/components/FilledIcons";
import { GithubGlyph } from "@/components/BrandGlyphs";

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://me.itheheda.online"
).replace(/\/$/, "");

const LINKS_DESCRIPTION = `${siteConfig.name} 的个人主页 — GitHub、文章和摄影作品集`;

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
        alt: `${siteConfig.name} — links to socials and projects`,
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
      : "";

  const githubEntry = socialMap.get("github");
  const githubHref = githubEntry?.href || "https://github.com/hunger-Eric";

  const bigButtons: Array<{
    key: string;
    label: string;
    description: string;
    href: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "home",
      label: "个人网站",
      description: "AI Native 独立开发者",
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
      key: "articles",
      label: "文章",
      description: "Hello-Agents 系列 & 技术博客",
      href: "/articles",
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5z" />
          <line x1="8" y1="7" x2="16" y2="7" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      ),
    },
    {
      key: "github",
      label: "GitHub",
      description: "hunger-Eric · 开源项目",
      href: githubHref,
      icon: <GithubGlyph className="h-7 w-7" />,
    },
    {
      key: "projects",
      label: "摄影作品集",
      description: "街头光影 · 城市切片 · 沅水",
      href: "/photography",
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
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
        .map((s) => s.href)
        .filter(
          (h): h is string => typeof h === "string" && /^https?:\/\//i.test(h)
        ),
      ...(emailHref && { email: emailHref.replace(/^mailto:/i, "") }),
    },
  };

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
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center px-5 pb-10 pt-12 text-slate-900 sm:pt-14">
      <JsonLd data={profileJsonLd} />

      {/* Top-left: Email */}
      {emailHref && (
        <a
          href={emailHref}
          aria-label={`Email ${siteConfig.name}`}
          title={`Email ${siteConfig.name}`}
          className="absolute left-4 top-4 inline-flex h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 sm:left-5 sm:top-5"
        >
          <Mail className="h-4 w-4" aria-hidden />
          <span>联系我</span>
        </a>
      )}

      {/* Top-right: Share */}
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-5 sm:top-5">
        <ShareButton
          label="Share"
          showLabel={false}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
        />
      </div>

      {/* Name */}
      <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {siteConfig.name}
      </h1>

      {/* Location */}
      {siteConfig.location && (
        <div className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-500">
          <FilledMapPin className="h-4 w-4 text-slate-400" />
          <span>{siteConfig.location}</span>
        </div>
      )}

      {/* Tagline */}
      <p className="mt-3 max-w-xs text-center text-[13px] font-medium tracking-wide text-slate-700 sm:text-sm">
        全栈程序猿 · AI Agent · 摄影
      </p>

      {/* GitHub glyph */}
      {githubHref && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <a
            href={githubHref}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            title="GitHub"
            className="group inline-flex h-7 w-7 items-center justify-center transition-transform duration-150 hover:-translate-y-0.5"
          >
            <GithubGlyph className="h-7 w-7 transition-transform duration-150 group-hover:scale-110" />
          </a>
        </div>
      )}

      {/* Big buttons */}
      <div className="mt-7 flex w-full flex-col gap-3">
        {bigButtons.map((btn) => renderBigButton(btn))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col items-center gap-1 pt-10 text-center text-xs text-slate-500">
        <span>Built by {siteConfig.name}</span>
        <span>© {year} All rights reserved</span>
      </div>
    </main>
  );
}