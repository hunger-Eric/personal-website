// components/sections/ContentMedia.tsx
// 3x3 placeholder media grid: each card is a solid color block with a small
// branded platform glyph in the top-right corner. Real content + thumbnails
// will replace these later.
import Link from "next/link";
import { YoutubeGlyph, TikTokGlyph } from "@/components/BrandGlyphs";
import { BookOpenText } from "lucide-react";

type MediaType = "youtube" | "tiktok" | "article";

type MediaItem = {
  id: string;
  type: MediaType;
  href: string;
  external: boolean;
  title: string;
  /** Tailwind classes for the solid placeholder background */
  bgClass: string;
  /** How many rows this card spans (1 or 2) — used for masonry effect */
  rowSpan: 1 | 2;
};

// 9 placeholders — mixed row spans for an asymmetric masonry feel.
const ITEMS: MediaItem[] = [
  {
    id: "yt-1",
    type: "youtube",
    href: "#",
    external: true,
    title: "Building DevfolioX in public — Episode 1",
    bgClass: "bg-gradient-to-br from-red-500/55 via-red-600/45 to-rose-700/55",
    rowSpan: 2,
  },
  {
    id: "tt-1",
    type: "tiktok",
    href: "#",
    external: true,
    title: "60-second tip: a Tailwind utility I use daily",
    bgClass: "bg-gradient-to-br from-fuchsia-500/55 via-pink-600/45 to-cyan-500/35",
    rowSpan: 1,
  },
  {
    id: "art-1",
    type: "article",
    href: "#",
    external: false,
    title: "Cloudflare Workers + OpenNext: a real-world setup",
    bgClass:
      "bg-gradient-to-br from-indigo-500/55 via-violet-500/45 to-sky-500/40",
    rowSpan: 1,
  },
  {
    id: "tt-2",
    type: "tiktok",
    href: "#",
    external: true,
    title: "Behind the build — late-night refactor",
    bgClass: "bg-gradient-to-br from-cyan-500/45 via-fuchsia-500/45 to-rose-500/45",
    rowSpan: 2,
  },
  {
    id: "art-2",
    type: "article",
    href: "#",
    external: false,
    title: "A no-bloat Notion CMS pipeline",
    bgClass:
      "bg-gradient-to-br from-indigo-500/45 via-purple-500/45 to-emerald-500/30",
    rowSpan: 1,
  },
  {
    id: "yt-2",
    type: "youtube",
    href: "#",
    external: true,
    title: "Reactfolio v2 — what changed and why",
    bgClass: "bg-gradient-to-br from-red-600/55 via-orange-500/40 to-rose-500/45",
    rowSpan: 1,
  },
  {
    id: "art-3",
    type: "article",
    href: "#",
    external: false,
    title: "Designing a hub page that actually converts",
    bgClass:
      "bg-gradient-to-br from-violet-500/55 via-indigo-500/45 to-sky-500/40",
    rowSpan: 2,
  },
  {
    id: "yt-3",
    type: "youtube",
    href: "#",
    external: true,
    title: "Building a Linktree alternative in Next.js",
    bgClass: "bg-gradient-to-br from-rose-500/55 via-red-600/45 to-orange-500/40",
    rowSpan: 1,
  },
  {
    id: "tt-3",
    type: "tiktok",
    href: "#",
    external: true,
    title: "Three keyboard shortcuts I use every day",
    bgClass: "bg-gradient-to-br from-fuchsia-600/55 via-cyan-400/45 to-pink-500/45",
    rowSpan: 1,
  },
];

function PlatformBadge({ type }: { type: MediaType }) {
  if (type === "youtube") {
    return <YoutubeGlyph className="h-7 w-7" />;
  }
  if (type === "tiktok") {
    return <TikTokGlyph className="h-7 w-7" />;
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500 text-white">
      <BookOpenText className="h-[14px] w-[14px]" />
    </span>
  );
}

function MediaCard({
  item,
  className: extraClass = "",
}: {
  item: MediaItem;
  className?: string;
}) {
  const rowSpanClass = item.rowSpan === 2 ? "row-span-2" : "row-span-1";

  const Inner = (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/10 transition-colors duration-200 ease-out hover:border-white/25">
      <div className={`relative w-full flex-1 ${item.bgClass}`}>
        {/* Corner platform badge */}
        <div className="absolute right-3 top-3 z-10">
          <PlatformBadge type={item.type} />
        </div>
      </div>

      <div className="flex flex-none flex-col gap-2 bg-white/5 p-4">
        <h4 className="text-[14px] font-semibold leading-snug text-foreground sm:text-[15px]">
          <span className="block break-words line-clamp-2">{item.title}</span>
        </h4>
      </div>
    </article>
  );

  const className = `block h-full ${rowSpanClass} ${extraClass}`.trim();

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
      >
        {Inner}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className}>
      {Inner}
    </Link>
  );
}

export function ContentMediaSection() {
  return (
    <section id="content" className="py-16 scroll-mt-12 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center gap-4">
          <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
            ~/Content
          </h2>
          <div className="hidden h-px w-40 bg-white/15 sm:block sm:w-72" aria-hidden />
        </div>

        {/* Mobile: only the first 3 items render (the rest get hidden via class).
            sm+: full 9-item masonry feel with mixed row spans. */}
        <div className="mt-8 grid auto-rows-[170px] grid-cols-1 gap-4 [grid-auto-flow:dense] sm:auto-rows-[180px] sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <MediaCard
              key={item.id}
              item={item}
              className={i >= 3 ? "hidden sm:block" : ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
