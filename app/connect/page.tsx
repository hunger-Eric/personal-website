// app/connect/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import * as LucideIcons from "lucide-react";
import {
  ArrowUpRight,
  ExternalLink,
  FileText,
  Folder,
  Globe,
  Home,
  Mail,
  MapPin,
  Newspaper,
} from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import { XIcon } from "@/components/icons/XIcon";
import { ShareButton } from "@/components/ShareButton";
import { JsonLd } from "@/components/JsonLd";

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://kevintrinh.dev"
).replace(/\/$/, "");

const CONNECT_DESCRIPTION = `Every place ${siteConfig.name} is active online — socials, portfolio, projects, articles and resume in one link.`;

export const metadata: Metadata = {
  title: `Connect | ${siteConfig.name}`,
  description: CONNECT_DESCRIPTION,
  alternates: { canonical: "/connect" },
  openGraph: {
    type: "profile",
    url: "/connect",
    title: `Connect with ${siteConfig.name}`,
    description: CONNECT_DESCRIPTION,
    siteName: `${siteConfig.name} Portfolio`,
    images: [
      {
        url: "/images/demo_1.png",
        width: 1864,
        height: 952,
        alt: `Connect with ${siteConfig.name} — socials, projects, articles, resume`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Connect with ${siteConfig.name}`,
    description: CONNECT_DESCRIPTION,
    images: ["/images/demo_1.png"],
  },
  robots: { index: true, follow: true },
};

// The icon row uses these social keys, in this exact order.
const ICON_KEYS = [
  "tiktok",
  "instagram",
  "youtube",
  "linkedin",
  "github",
  "x",
] as const;

type SmallIcon = {
  key: string;
  label: string;
  href: string;
  Icon: (props: { className?: string }) => React.ReactNode;
};

function resolveIconForSocial(
  key: string,
  iconName?: string
): (props: { className?: string }) => React.ReactNode {
  if (key === "x") return XIcon;
  const fromLucide =
    iconName && (LucideIcons as any)[iconName]
      ? (LucideIcons as any)[iconName]
      : null;
  if (fromLucide) {
    const Comp = fromLucide as (p: { className?: string }) => React.ReactNode;
    return Comp;
  }
  return ArrowUpRight as unknown as (p: {
    className?: string;
  }) => React.ReactNode;
}

export default function ConnectPage() {
  const socialMap = new Map(
    (siteConfig.socialsList ?? []).map((s) => [s.key, s])
  );

  // Pull the configured email so the top-right contact button always points
  // at whatever address is in site.json — no duplication.
  const emailEntry = socialMap.get("email");
  const emailHref =
    typeof emailEntry?.href === "string" && emailEntry.href.startsWith("mailto:")
      ? emailEntry.href
      : "mailto:kevin@kevintrinh.dev";
  const smallIcons: SmallIcon[] = ICON_KEYS.map((key) => {
    const s = socialMap.get(key);
    const href = (s?.href || "").trim();
    if (!s || !href || href === "null" || href.startsWith("copy:")) {
      return null;
    }
    return {
      key,
      label: s.label || key,
      href,
      Icon: resolveIconForSocial(key, s.icon),
    };
  }).filter(Boolean) as SmallIcon[];

  // Big buttons — open every link in a new tab per spec.
  const BASE_URL = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://kevintrinh.dev"
  ).replace(/\/$/, "");

  const bigButtons = [
    {
      key: "portfolio",
      label: "Portfolio website",
      href: `${BASE_URL}/`,
      Icon: Globe,
    },
    {
      key: "resume",
      label: "Resume (PDF)",
      href: `${BASE_URL}/resume`,
      Icon: FileText,
    },
    {
      key: "projects",
      label: "Projects",
      href: `${BASE_URL}/projects`,
      Icon: Folder,
    },
    {
      key: "articles",
      label: "Articles",
      href: `${BASE_URL}/articles`,
      Icon: Newspaper,
    },
  ];

  const year = new Date().getFullYear();

  // JSON-LD ProfilePage anchored to /connect so this page is independently
  // discoverable in search alongside the homepage.
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${BASE_URL}/connect`,
    name: `Connect with ${siteConfig.name}`,
    description: CONNECT_DESCRIPTION,
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
          (h): h is string =>
            typeof h === "string" && /^https?:\/\//i.test(h)
        ),
      email: emailHref.replace(/^mailto:/i, ""),
    },
  };

  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center px-5 pb-10 pt-16 sm:pt-20">
      <JsonLd data={profileJsonLd} />
      {/* Top-left: Home */}
      <a
        href="/"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Open homepage"
        title="Open homepage"
        className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-200 transition-colors hover:border-accent hover:bg-white/10 hover:text-white sm:left-5 sm:top-5"
      >
        <Home className="h-4 w-4" aria-hidden />
      </a>

      {/* Top-right: Contact (email) + Share */}
      <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-5 sm:top-5">
        <a
          href={emailHref}
          aria-label={`Email ${siteConfig.name}`}
          title={`Email ${siteConfig.name}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/15 px-2.5 py-2 text-xs font-medium text-white transition-colors hover:border-accent hover:bg-accent/25"
        >
          <Mail className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Contact</span>
        </a>
        <ShareButton
          label="Share"
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-accent hover:bg-white/10 hover:text-white"
        />
      </div>

      {/* Avatar */}
      <div className="relative mb-5 h-28 w-28 overflow-hidden rounded-full ring-2 ring-white/10 sm:h-32 sm:w-32">
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
      <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
        {siteConfig.name}
      </h1>

      {/* Location */}
      <div className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-slate-200/70" aria-hidden />
        <span>{siteConfig.location || "Houston, TX"}</span>
      </div>

      {/* Description */}
      <p className="mt-3 text-center text-sm text-muted-foreground">CS @ UH</p>

      {/* Small icon row */}
      {smallIcons.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          {smallIcons.map(({ key, label, href, Icon }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              title={label}
              className="text-slate-200/85 transition-colors duration-150 hover:text-white"
            >
              <Icon className="h-[22px] w-[22px]" />
            </a>
          ))}
        </div>
      )}

      {/* Big buttons — all open in new tab */}
      <div className="mt-7 flex w-full flex-col gap-3">
        {bigButtons.map(({ key, label, href, Icon }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-slate-50 transition-all duration-150 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-white/[0.08] hover:shadow-[0_4px_24px_-12px_rgba(99,102,241,0.5)]"
          >
            <span className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/[0.06] text-slate-100 transition-colors group-hover:bg-accent/15">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span>{label}</span>
            </span>
            <ExternalLink
              className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-accent"
              aria-hidden
            />
          </a>
        ))}
      </div>

      {/* Copyright */}
      <div className="mt-auto pt-10 text-center text-xs leading-relaxed text-muted-foreground/70">
        <div>Built by Kevin Trinh</div>
        <div>© {year} All rights reserved</div>
      </div>
    </main>
  );
}
