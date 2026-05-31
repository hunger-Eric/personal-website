// app/feed.json/route.ts — JSON Feed 1.1 (https://jsonfeed.org/)
import { NextResponse } from "next/server";
import { getArticles } from "@/lib/mdx/mdx";
import { siteConfig } from "@/config/siteConfig";
import { SITE_URL } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 21600; // 6h

export async function GET() {
  const articles = await getArticles();

  const items = articles.map((a) => ({
    id: `${SITE_URL}/articles/${a.slug}`,
    url: `${SITE_URL}/articles/${a.slug}`,
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
        : `${SITE_URL}${a.imageSrc.startsWith("/") ? a.imageSrc : `/${a.imageSrc}`}`
      : undefined,
    tags: [a.category, ...(a.tags ?? [])].filter(Boolean) as string[],
    authors: a.author ? [{ name: a.author }] : undefined,
  }));

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: `${siteConfig.name} — Articles`,
    home_page_url: `${SITE_URL}/articles`,
    feed_url: `${SITE_URL}/feed.json`,
    description: `关于 ${siteConfig.name} 的文章、教程与写作。`,
    language: "zh-CN",
    authors: [{ name: siteConfig.name, url: SITE_URL }],
    items,
  };

  return NextResponse.json(feed, {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=21600, s-maxage=21600",
    },
  });
}
