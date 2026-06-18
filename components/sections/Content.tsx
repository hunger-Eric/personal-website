import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import type { ReactNode } from "react";

import {
  InstagramGlyph,
  TikTokGlyph,
  YoutubeGlyph,
} from "@/components/BrandGlyphs";
import { XIcon } from "@/components/icons/XIcon";
import { ActionButton, SectionHeader, Surface } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import { siteConfig } from "@/config/siteConfig";

type PlatformKey = "youtube" | "instagram" | "tiktok" | "x";

type PlatformTile = {
  key: PlatformKey;
  label: string;
  icon: (props: { className?: string }) => ReactNode;
};

const copy = getSiteCopy("zh").content;

const platformTiles: PlatformTile[] = [
  { key: "tiktok", label: "TikTok", icon: TikTokGlyph },
  { key: "instagram", label: "Instagram", icon: InstagramGlyph },
  { key: "x", label: "X / Twitter", icon: XIcon },
];

function urlForKey(key: string): string | null {
  const item = (siteConfig.socialsList ?? []).find((social) => social.key === key);
  const href = (item?.href || "").trim();
  if (!href || href === "null" || href.startsWith("copy:")) return null;
  return href;
}

function platformBlurb(key: PlatformKey) {
  if (key === "x") return copy.platformBlurbs.linkedin;
  return copy.platformBlurbs[key];
}

export function ContentSection() {
  const videoId = siteConfig.featuredContent?.youtubeVideoId?.trim();
  const youtubeChannel = urlForKey("youtube");
  const videoUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : youtubeChannel ?? "#content";
  const videoThumb = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return (
    <section id="content" className="scroll-mt-12 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeader
          eyebrow={copy.heading}
          title={copy.platformsHeading}
          description={copy.description}
          actions={
            <ActionButton
              href="/content"
              tone="secondary"
              icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              {copy.mediaKitAction}
            </ActionButton>
          }
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Surface
            as="article"
            tone="paper"
            className="group overflow-hidden transition-colors hover:border-accent"
          >
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="block"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-surface-graphite">
                {videoThumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={videoThumb}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-surface-graphite-foreground/80">
                    <Play className="h-12 w-12" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-surface-graphite/60 via-surface-graphite/15 to-transparent">
                  <span className="flex h-16 w-16 items-center justify-center rounded-control bg-accent text-accent-foreground shadow-panel ring-4 ring-surface-paper/30 transition-transform duration-200 group-hover:scale-105">
                    <Play className="ml-0.5 h-7 w-7 fill-current" aria-hidden="true" />
                  </span>
                </div>
                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-control bg-surface-graphite/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-surface-graphite-foreground">
                  <YoutubeGlyph className="h-4 w-4" />
                  YouTube
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-foreground">
                    {copy.videosHeading}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {copy.platformBlurbs.youtube}
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 flex-none text-muted-foreground transition-colors group-hover:text-accent" />
              </div>
            </a>
          </Surface>

          <ul className="flex flex-col gap-3">
            {platformTiles.map((tile) => {
              const href = urlForKey(tile.key);
              if (!href) return null;
              const Icon = tile.icon;
              return (
                <li key={tile.key}>
                  <Surface
                    as="article"
                    tone="paper"
                    className="transition-colors hover:border-accent"
                  >
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex items-center gap-3 p-4"
                    >
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-control bg-muted text-foreground">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          {tile.label}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {platformBlurb(tile.key)}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 flex-none text-muted-foreground transition-colors group-hover:text-accent" />
                    </a>
                  </Surface>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
