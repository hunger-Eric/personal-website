import { NextResponse } from "next/server";
import { publicIdentity } from "@/config/public-identity";
import { getArticleBySlug, getArticles } from "@/lib/mdx/mdx";
import { SITE_URL } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 21600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

export async function GET() {
  const previews = await getArticles("en");
  const articles = (
    await Promise.all(previews.map((article) => getArticleBySlug(article.slug, "en")))
  ).filter((article) => article !== null);
  const lastBuild = articles.length ? toRfc822(articles[0].date) : new Date().toUTCString();
  const items = articles.map((article) => {
    const link = `${SITE_URL}${article.publicPath}`;
    const categories = [article.category, ...(article.tags ?? [])]
      .filter(Boolean)
      .map((category) => `    <category>${escapeXml(category!)}</category>`);
    return [
      "  <item>",
      `    <title>${escapeXml(article.title)}</title>`,
      `    <link>${link}</link>`,
      `    <guid isPermaLink="true">${link}</guid>`,
      `    <pubDate>${toRfc822(article.date)}</pubDate>`,
      article.summary ? `    <description>${escapeXml(article.summary)}</description>` : "",
      `    <content:encoded><![CDATA[${article.content.replaceAll("]]>", "]]]]><![CDATA[>")}]]></content:encoded>`,
      article.author
        ? `    <author>noreply@itheheda.online (${escapeXml(article.author)})</author>`
        : "",
      ...categories,
      "  </item>",
    ].filter(Boolean).join("\n");
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${escapeXml(publicIdentity.canonicalName)} — Articles</title>
  <link>${SITE_URL}/en/articles</link>
  <atom:link href="${SITE_URL}/en/feed.xml" rel="self" type="application/rss+xml" />
  <description>Practical writing about enterprise AI systems, automation, and delivery.</description>
  <language>en</language>
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
