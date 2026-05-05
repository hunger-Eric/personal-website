// components/sections/YouTube.tsx
import { Youtube, ExternalLink } from "lucide-react";
import { youtubeVideos } from "../../config/youtube";
import { siteConfig } from "../../config/siteConfig";

export function YouTubeSection() {
  if (!youtubeVideos.length) return null;

  const featured = youtubeVideos[0];
  const mostRecent = youtubeVideos[1] ?? featured;
  const mostViewed = youtubeVideos[2] ?? mostRecent;

  const channelUrl = siteConfig.socials?.youtube;
  const featuredEmbedUrl = getYouTubeEmbedUrl(featured.url);

  const youtubeProfile = {
    avatarUrl: "/images/codertrinh-avatar.jpg",
    name: "KevinTrinhDev",
    description:
      "Software dev, CS student, and content creator sharing projects, tutorials, and dev logs.",
    stats: {
      videos: "3",
      subscribers: "250",
      views: "3.6K",
    },
  };

  return (
    <section id="youtube" className="py-16 scroll-mt-12 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          ~/YouTube
        </h2>

        <h3 className="mt-4 text-2xl font-semibold sm:text-3xl">
          Videos of my work, hobbies, and life.
        </h3>

        {/* Channel banner */}
        <div className="mt-3 flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-md bg-black/40">
              <img
                src={youtubeProfile.avatarUrl}
                alt={youtubeProfile.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white sm:text-base">
                {youtubeProfile.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground sm:text-xs">
                <span>{youtubeProfile.stats.videos} videos</span>
                <span>· {youtubeProfile.stats.subscribers} subscribers</span>
                <span>· {youtubeProfile.stats.views} views</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                {youtubeProfile.description}
              </p>
            </div>
          </div>

          {channelUrl && (
            <a
              href={channelUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-medium text-white shadow-sm transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-accent/90 sm:text-sm"
            >
              <Youtube className="h-4 w-4" />
              <span>View channel</span>
            </a>
          )}
        </div>

        {/* Featured video: video left, text right */}
        <article className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground sm:p-5 sm:text-base">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent sm:text-sm">
            Featured video
          </p>

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start">
            <div className="md:basis-[50%]">
              <div className="relative aspect-video overflow-hidden rounded-md">
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
                <h4 className="text-base font-semibold text-white sm:text-lg">
                  {featured.title}
                </h4>

                {(featured.date || featured.views) && (
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    {featured.date}
                    {featured.date && featured.views && " · "}
                    {featured.views && `${featured.views} views`}
                  </p>
                )}

                {featured.description && (
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {featured.description}
                  </p>
                )}
              </div>

              <a
                href={featured.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 self-start rounded-md border border-white/25 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10 sm:text-sm"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </article>

        {/* Bottom row: most recent + most viewed */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <VideoCard label="Most recent video" video={mostRecent} />
          <VideoCard label="Most viewed video" video={mostViewed} />
        </div>
      </div>
    </section>
  );
}

type SimpleVideo = (typeof youtubeVideos)[number];

function VideoCard({ label, video }: { label: string; video: SimpleVideo }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:border-accent/70 hover:bg-white/10 sm:p-4 sm:text-sm md:flex-row md:items-start"
    >
      <div className="md:w-40 md:flex-shrink-0">
        <div className="relative aspect-video overflow-hidden rounded-md">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
          />
          {video.duration && (
            <div className="pointer-events-none absolute bottom-1 right-1 rounded-sm bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
              {video.duration}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent sm:text-sm">
          {label}
        </p>

        <h5 className="line-clamp-2 font-medium text-white">{video.title}</h5>

        {(video.date || video.views) && (
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            {video.date}
            {video.date && video.views && " · "}
            {video.views && `${video.views} views`}
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
