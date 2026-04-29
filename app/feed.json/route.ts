// app/feed.json/route.ts — JSON Feed 1.1 (https://jsonfeed.org/)
import { NextResponse } from "next/server";
import { getArticles } from "@/lib/mdx/mdx";
import { siteConfig } from "@/config/siteConfig";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 21600; // 6h

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://kevintrinh.dev"
).replace(/\/$/, "");

export async function GET() {
  const articles = await getArticles();

  const items = articles.map((a) => ({
    id: `${BASE_URL}/articles/${a.slug}`,
    url: `${BASE_URL}/articles/${a.slug}`,
    title: a.title,
    summary: a.summary || undefined,
    content_text: a.summary || a.title,
    date_published: new Date(a.date).toISOString(),
    date_modified: a.updated
      ? new Date(a.updated).toISOString()
      : new Date(a.date).toISOString(),
    image: a.imageSrc
      ? a.imageSrc.startsWith("http")
        ? a.imageSrc
        : `${BASE_URL}${a.imageSrc.startsWith("/") ? a.imageSrc : `/${a.imageSrc}`}`
      : undefined,
    tags: [a.category, ...(a.tags ?? [])].filter(Boolean) as string[],
    authors: a.author ? [{ name: a.author }] : undefined,
  }));

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: `${siteConfig.name} — Articles`,
    home_page_url: `${BASE_URL}/articles`,
    feed_url: `${BASE_URL}/feed.json`,
    description: `Articles, tutorials and writing by ${siteConfig.name}.`,
    language: "en-US",
    authors: [{ name: siteConfig.name, url: BASE_URL }],
    items,
  };

  return NextResponse.json(feed, {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=21600, s-maxage=21600",
    },
  });
}
