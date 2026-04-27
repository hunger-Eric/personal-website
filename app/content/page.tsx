// app/content/page.tsx
// Content hub — every platform where Kevin posts content. Different from
// /connect (which is just every contact link) and /articles (long-form on
// this site). This page is the "go follow me" page.
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import * as LucideIcons from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { XIcon } from "@/components/icons/XIcon";

export const metadata: Metadata = {
  title: "Content",
  description: `Every place ${siteConfig.name} publishes content — videos, posts, articles, and more.`,
  openGraph: {
    title: `Content | ${siteConfig.name}`,
    description: `Every place ${siteConfig.name} publishes content.`,
  },
};

type Platform = {
  key: string;
  name: string;
  handle: string;
  blurb: string;
  cta: string;
  /** Lucide icon name OR "x" for the custom X glyph. */
  iconKey?: string;
  /** Tailwind background classes for the icon tile. */
  tone: string;
};

const PLATFORMS: Platform[] = [
  {
    key: "youtube",
    name: "YouTube",
    handle: "@KevinTrinhDev",
    blurb:
      "Long-form videos — projects, tutorials, behind the scenes, and the occasional rant.",
    cta: "Watch",
    iconKey: "Youtube",
    tone: "bg-red-600/15 text-red-400",
  },
  {
    key: "tiktok",
    name: "TikTok",
    handle: "@KevinTrinhDev",
    blurb:
      "Short clips on coding, college life, and what I'm working on this week.",
    cta: "Watch",
    iconKey: "Music2",
    tone: "bg-pink-500/15 text-pink-400",
  },
  {
    key: "instagram",
    name: "Instagram",
    handle: "@KevinTrinhDev",
    blurb: "Photos, stories, and visuals from the projects and the day-to-day.",
    cta: "Follow",
    iconKey: "Instagram",
    tone: "bg-fuchsia-500/15 text-fuchsia-400",
  },
  {
    key: "threads",
    name: "Threads",
    handle: "@KevinTrinhDev",
    blurb: "Short text updates — quick thoughts, mini tutorials, and replies.",
    cta: "Follow",
    iconKey: "AtSign",
    tone: "bg-slate-500/15 text-slate-300",
  },
  {
    key: "x",
    name: "X / Twitter",
    handle: "@KevinTrinhDev",
    blurb: "Realtime build logs, hot takes, and threads on what I'm shipping.",
    cta: "Follow",
    iconKey: "x",
    tone: "bg-zinc-700/30 text-zinc-200",
  },
  {
    key: "medium",
    name: "Medium",
    handle: "@KevinTrinhDev",
    blurb: "Long-form essays — usually deeper takes than what lands here.",
    cta: "Read",
    iconKey: "PenSquare",
    tone: "bg-emerald-500/15 text-emerald-400",
  },
  {
    key: "devto",
    name: "Dev.to",
    handle: "@KevinTrinhDev",
    blurb: "Code-heavy walkthroughs and tutorials, cross-posted from this site.",
    cta: "Read",
    iconKey: "Code2",
    tone: "bg-sky-500/15 text-sky-400",
  },
  {
    key: "github",
    name: "GitHub",
    handle: "@KevinTrinhDev",
    blurb: "Source code for almost everything I build — open source by default.",
    cta: "Browse",
    iconKey: "Github",
    tone: "bg-violet-500/15 text-violet-300",
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    handle: "in/KevinTrinhDev",
    blurb: "Professional updates, internships, and the occasional career post.",
    cta: "Connect",
    iconKey: "Linkedin",
    tone: "bg-sky-600/15 text-sky-400",
  },
];

function resolveIcon(iconKey?: string) {
  if (iconKey === "x") return XIcon;
  if (iconKey && (LucideIcons as any)[iconKey]) {
    return (LucideIcons as any)[iconKey] as (p: {
      className?: string;
    }) => React.ReactNode;
  }
  return ArrowUpRight as unknown as (p: {
    className?: string;
  }) => React.ReactNode;
}

export default function ContentPage() {
  // Resolve URL for each platform from siteConfig.socialsList — single
  // source of truth so the URLs stay correct even if site.json changes.
  const urlForKey = (key: string): string | null => {
    const item = (siteConfig.socialsList ?? []).find((s) => s.key === key);
    const href = (item?.href || "").trim();
    if (!href || href === "null" || href.startsWith("copy:")) return null;
    return href;
  };

  const platforms = PLATFORMS.map((p) => ({ ...p, url: urlForKey(p.key) })).filter(
    (p) => !!p.url
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Content", url: "/content" },
        ]}
      />

      <header className="mb-10">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Content
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Every platform I post on — videos, photos, threads, code, essays.
          Pick the format you like and follow there.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((p) => {
          const Icon = resolveIcon(p.iconKey);
          return (
            <li key={p.key}>
              <a
                href={p.url as string}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex h-full flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5 transition-colors duration-200 hover:border-accent/60 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-lg",
                      p.tone,
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {p.cta}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="text-base font-semibold leading-snug text-foreground">
                    <span className="relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                      {p.name}
                    </span>
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {p.handle}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {p.blurb}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground/80 transition-colors group-hover:text-accent">
                  Visit profile
                  <ArrowUpRight className="h-4 w-4 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
