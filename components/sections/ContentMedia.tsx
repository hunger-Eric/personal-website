// components/sections/ContentMedia.tsx
// Pulls the latest YouTube videos from the channel's public RSS feed at
// build time (with revalidation). Placeholder TikTok / Article slots will be
// added later when those platforms are active.
import { YoutubeGlyph } from "@/components/BrandGlyphs";
import { Play } from "lucide-react";
import { SectionHeader } from "@/components/system";
import { getSiteCopy } from "@/config/contentCopy";
import { siteConfig } from "@/config/siteConfig";
import {
  loadLatestYouTubeVideos,
  type YouTubeFeedVideo,
} from "@/config/youtubeFeed";

const siteCopy = getSiteCopy("zh");
const contentCopy = siteCopy.content;
const youtubeCopy = siteCopy.youtube;

function VideoCard({ video }: { video: YouTubeFeedVideo }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${youtubeCopy.watchOnYouTube}: ${video.title}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-card border border-hairline bg-surface-paper-elevated transition-colors duration-200 ease-out hover:border-accent"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-graphite">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnailUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-graphite/45 via-transparent to-surface-graphite/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex h-12 w-16 items-center justify-center rounded-card bg-accent text-accent-foreground shadow-panel ring-4 ring-surface-paper/30 transition-transform duration-200 group-hover:scale-105">
            <Play className="h-5 w-5 translate-x-[1px] fill-current" />
          </span>
        </div>
        <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-control bg-surface-graphite/80 px-1.5 py-1 text-[10px] font-semibold text-surface-graphite-foreground backdrop-blur-sm">
          <YoutubeGlyph className="h-3.5 w-3.5" />
          <span>YouTube</span>
        </div>
      </div>
      <div className="flex flex-none flex-col gap-1 p-4">
        <h4 className="line-clamp-2 text-[14px] font-semibold leading-snug text-foreground sm:text-[15px]">
          {video.title}
        </h4>
      </div>
    </a>
  );
}

export async function ContentMediaSection() {
  const channelId = siteConfig.featuredContent?.youtubeChannelId || "";
  const videos = await loadLatestYouTubeVideos(channelId, 3);

  // Hide entirely if there is nothing to show.
  if (videos.length === 0) return null;

  return (
    <section id="content" className="py-16 scroll-mt-12 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeader
          eyebrow={contentCopy.heading}
          title={contentCopy.videosHeading}
          description={contentCopy.description}
        />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </div>
    </section>
  );
}
