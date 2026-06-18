// config/youtubeFeed.ts
// Server-side fetcher: pulls the latest videos from a YouTube channel's
// public Atom RSS feed (no API key, no auth). Cached at build time + on
// `next: { revalidate }`.

export type YouTubeFeedVideo = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string; // ISO
};

const FEED_URL = (channelId: string) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function pickFirst(re: RegExp, src: string): string | null {
  const m = src.match(re);
  return m ? m[1] : null;
}

function parseEntries(xml: string): YouTubeFeedVideo[] {
  const out: YouTubeFeedVideo[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(xml))) {
    const entry = m[1];
    const id = pickFirst(/<yt:videoId>([A-Za-z0-9_-]{11})<\/yt:videoId>/, entry);
    const title = pickFirst(/<title>([\s\S]*?)<\/title>/, entry);
    const published = pickFirst(/<published>([^<]+)<\/published>/, entry);
    if (!id || !title) continue;
    out.push({
      id,
      title: unescapeXml(title.trim()),
      url: `https://www.youtube.com/watch?v=${id}`,
      // mqdefault: ~10 KB, 320x180. hqdefault is sharper but ~30 KB.
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
      publishedAt: published || "",
    });
  }
  return out;
}

export async function loadLatestYouTubeVideos(
  channelId: string,
  limit = 3
): Promise<YouTubeFeedVideo[]> {
  if (!channelId) return [];
  try {
    const res = await fetch(FEED_URL(channelId), {
      next: { revalidate: 60 * 60 * 6 }, // 6h
      headers: { "User-Agent": "devfoliox-yt-feed" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const videos = parseEntries(xml);
    return videos.slice(0, Math.max(0, limit));
  } catch {
    return [];
  }
}
