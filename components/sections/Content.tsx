// components/sections/Content.tsx
// Landing-page "Content" section. A small preview of /content (the platform
// hub): one big featured-video card on the left, and a stack of small
// platform tiles on the right.
import { ArrowUpRight, Play } from "lucide-react";
import * as LucideIcons from "lucide-react";

import { siteConfig } from "@/config/siteConfig";
import { XIcon } from "@/components/icons/XIcon";

type SmallTile = {
  key: string;
  name: string;
  blurb: string;
  iconKey?: string;
  tone: string;
};

const SMALL_TILES: SmallTile[] = [
  {
    key: "tiktok",
    name: "TikTok",
    blurb: "Short clips on coding + college life.",
    iconKey: "Music2",
    tone: "bg-pink-500/15 text-pink-400",
  },
  {
    key: "instagram",
    name: "Instagram",
    blurb: "Photos & stories from projects.",
    iconKey: "Instagram",
    tone: "bg-fuchsia-500/15 text-fuchsia-400",
  },
  {
    key: "x",
    name: "X / Twitter",
    blurb: "Build logs, hot takes, threads.",
    iconKey: "x",
    tone: "bg-zinc-700/30 text-zinc-200",
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

function urlForKey(key: string): string | null {
  const item = (siteConfig.socialsList ?? []).find((s) => s.key === key);
  const href = (item?.href || "").trim();
  if (!href || href === "null" || href.startsWith("copy:")) return null;
  return href;
}

export function ContentSection() {
  const videoId = siteConfig.featuredContent?.youtubeVideoId?.trim();
  const ytChannel = urlForKey("youtube");
  const videoUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : ytChannel ?? "#content";
  const videoThumb = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return (
    <section id="content" className="py-16 scroll-mt-12 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          ~/Content
        </h2>

        <div className="mt-3">
          <h3 className="text-2xl font-semibold sm:text-3xl">
            Where I post stuff.
          </h3>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* Featured video card */}
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors duration-200 hover:border-accent/60 hover:bg-white/[0.07]"
          >
            <div className="relative aspect-video w-full bg-black">
              {videoThumb ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={videoThumb}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/50 via-black to-red-950/50 text-white/80">
                  <Play className="h-12 w-12" aria-hidden />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/15 to-transparent">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl ring-4 ring-red-600/30 transition-transform duration-200 group-hover:scale-110">
                  <Play className="ml-0.5 h-7 w-7 fill-current" aria-hidden />
                </span>
              </div>
              <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                YouTube
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="text-base font-semibold text-foreground">
                  <span className="relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                    Watch my latest video
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  youtube.com/@hunger-Eric
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 flex-none text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
            </div>
          </a>

          {/* Small platform tiles */}
          <ul className="flex flex-col gap-3">
            {SMALL_TILES.map((t) => {
              const href = urlForKey(t.key);
              if (!href) return null;
              const Icon = resolveIcon(t.iconKey);
              return (
                <li key={t.key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-200 hover:border-accent/60 hover:bg-white/[0.07]"
                  >
                    <span
                      className={[
                        "flex h-10 w-10 flex-none items-center justify-center rounded-lg",
                        t.tone,
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        <span className="relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                          {t.name}
                        </span>
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {t.blurb}
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 flex-none text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
