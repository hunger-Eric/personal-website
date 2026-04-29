// app/feed.xml/route.ts — RSS 2.0 feed of MDX articles
import { NextResponse } from "next/server";
import { getArticles } from "@/lib/mdx/mdx";
import { siteConfig } from "@/config/siteConfig";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 21600; // 6h — articles are static, no need to be hot

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://kevintrinh.dev"
).replace(/\/$/, "");

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

export async function GET() {
  const articles = await getArticles();

  const lastBuild = articles.length
    ? toRfc822(articles[0].date)
    : new Date().toUTCString();

  const items = articles
    .map((a) => {
      const link = `${BASE_URL}/articles/${a.slug}`;
      const cats = (a.tags ?? []).map(
        (t) => `    <category>${escapeXml(t)}</category>`
      );
      if (a.category) {
        cats.unshift(`    <category>${escapeXml(a.category)}</category>`);
      }
      return [
        "  <item>",
        `    <title>${escapeXml(a.title)}</title>`,
        `    <link>${link}</link>`,
        `    <guid isPermaLink="true">${link}</guid>`,
        `    <pubDate>${toRfc822(a.date)}</pubDate>`,
        a.summary
          ? `    <description>${escapeXml(a.summary)}</description>`
          : "",
        a.author
          ? `    <author>noreply@kevintrinh.dev (${escapeXml(a.author)})</author>`
          : "",
        ...cats,
        "  </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(siteConfig.name)} — Articles</title>
  <link>${BASE_URL}/articles</link>
  <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
  <description>${escapeXml(
    `Articles, tutorials and writing by ${siteConfig.name}.`
  )}</description>
  <language>en-us</language>
  <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=21600, s-maxage=21600",
    },
  });
}
