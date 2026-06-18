// components/sections/YouTube.tsx
"use client";

import { Youtube, ExternalLink } from "lucide-react";
import Image from "next/image";
import { youtubeVideos } from "../../config/youtube";
import { siteConfig } from "../../config/siteConfig";
import { useLocale } from "../LocaleProvider";
import { getSiteCopy } from "../../config/contentCopy";
import { ActionButton, SectionHeader, Surface } from "../system";

export function YouTubeSection() {
  const { locale } = useLocale();
  const copy = getSiteCopy(locale).youtube;

  if (!youtubeVideos.length) return null;

  const featured = youtubeVideos[0];
  const mostRecent = youtubeVideos[1] ?? featured;
  const mostViewed = youtubeVideos[2] ?? mostRecent;

  const channelUrl = siteConfig.socials?.youtube;
  const featuredEmbedUrl = getYouTubeEmbedUrl(featured.url);

  const youtubeProfile = {
    avatarUrl: "/images/codertrinh-avatar.jpg",
    name: copy.channelName,
    description: copy.channelDescription,
    stats: copy.stats,
  };

  return (
    <section id="youtube" className="scroll-mt-12 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          className="py-5"
        />

        {/* Channel banner */}
        <Surface
          tone="paper"
          className="mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-control border border-hairline bg-surface-paper">
              <Image
                src={youtubeProfile.avatarUrl}
                alt={youtubeProfile.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground sm:text-base">
                {youtubeProfile.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground sm:text-xs">
                <span>
                  {youtubeProfile.stats.videos} {copy.videosLabel}
                </span>
                <span>
                  · {youtubeProfile.stats.subscribers} {copy.subscribersLabel}
                </span>
                <span>
                  · {youtubeProfile.stats.views} {copy.viewsLabel}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                {youtubeProfile.description}
              </p>
            </div>
          </div>

          {channelUrl && (
            <ActionButton
              href={channelUrl}
              target="_blank"
              rel="noreferrer noopener"
              tone="primary"
              icon={<Youtube className="h-4 w-4" aria-hidden />}
            >
              {copy.viewChannel}
            </ActionButton>
          )}
        </Surface>

        {/* Featured video: video left, text right */}
        <Surface
          tone="paper"
          className="mt-6 p-4 text-sm text-muted-foreground sm:p-5 sm:text-base"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-accent sm:text-sm">
            {copy.featuredVideo}
          </p>

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start">
            <div className="md:basis-[50%]">
              <div className="relative aspect-video overflow-hidden rounded-control border border-hairline bg-surface-paper">
                <iframe
                  src={featuredEmbedUrl}
                  title={featured.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-3 md:pl-3">
              <div className="space-y-2">
                <h4 className="text-base font-semibold text-foreground sm:text-lg">
                  {featured.title}
                </h4>

                {(featured.date || featured.views) && (
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    {featured.date}
                    {featured.date && featured.views && " · "}
                    {featured.views && `${featured.views} ${copy.viewsLabel}`}
                  </p>
                )}

                {featured.description && (
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {featured.description}
                  </p>
                )}
              </div>

              <ActionButton
                href={featured.url}
                target="_blank"
                rel="noreferrer noopener"
                tone="secondary"
                icon={<ExternalLink className="h-3.5 w-3.5" aria-hidden />}
                className="self-start px-3 py-1.5 text-xs sm:text-sm"
              >
                {copy.watchOnYouTube}
              </ActionButton>
            </div>
          </div>
        </Surface>

        {/* Bottom row: most recent + most viewed */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <VideoCard
            label={copy.mostRecentVideo}
            viewsLabel={copy.viewsLabel}
            video={mostRecent}
          />
          <VideoCard
            label={copy.mostViewedVideo}
            viewsLabel={copy.viewsLabel}
            video={mostViewed}
          />
        </div>
      </div>
    </section>
  );
}

type SimpleVideo = (typeof youtubeVideos)[number];

function VideoCard({
  label,
  viewsLabel,
  video,
}: {
  label: string;
  viewsLabel: string;
  video: SimpleVideo;
}) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex flex-col gap-2 rounded-card border border-hairline bg-surface-paper-elevated p-3 text-xs text-muted-foreground transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:border-accent/70 hover:bg-muted sm:p-4 sm:text-sm md:flex-row md:items-start"
    >
      <div className="md:w-40 md:flex-shrink-0">
        <div className="relative aspect-video overflow-hidden rounded-control border border-hairline bg-surface-paper">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(min-width: 768px) 160px, 100vw"
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
          />
          {video.duration && (
            <div className="pointer-events-none absolute bottom-1 right-1 rounded-control bg-surface-graphite px-1.5 py-0.5 text-[10px] text-surface-graphite-foreground">
              {video.duration}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent sm:text-sm">
          {label}
        </p>

        <h5 className="line-clamp-2 font-medium text-foreground">
          {video.title}
        </h5>

        {(video.date || video.views) && (
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            {video.date}
            {video.date && video.views && " · "}
            {video.views && `${video.views} ${viewsLabel}`}
          </p>
        )}
      </div>
    </a>
  );
}

function getYouTubeEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      if (id) {
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
      }
    }

    const v = parsed.searchParams.get("v");
    if (v) {
      return `https://www.youtube.com/embed/${v}?rel=0&modestbranding=1`;
    }

    return url;
  } catch {
    return url;
  }
}

// Exported for testing
export { getYouTubeEmbedUrl };
