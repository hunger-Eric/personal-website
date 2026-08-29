import { NextResponse } from "next/server";
import { publicIdentity } from "@/config/public-identity";
import { siteConfig } from "@/config/siteConfig";
import { getArticleBySlug, getArticles } from "@/lib/mdx/mdx";
import { SITE_URL } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 21600;

export async function GET() {
  const previews = await getArticles("en");
  const articles = (
    await Promise.all(previews.map((article) => getArticleBySlug(article.slug, "en")))
  ).filter((article) => article !== null);
  const items = articles.map((article) => {
    const url = `${SITE_URL}${article.publicPath}`;
    return {
      id: url,
      url,
      title: article.title,
      summary: article.summary || undefined,
      content_text: article.content,
      date_published: new Date(article.date).toISOString(),
      date_modified: new Date(article.updated || article.date).toISOString(),
      image: article.imageSrc
        ? article.imageSrc.startsWith("http")
          ? article.imageSrc
          : `${SITE_URL}${article.imageSrc.startsWith("/") ? article.imageSrc : `/${article.imageSrc}`}`
        : undefined,
      tags: [article.category, ...(article.tags ?? [])].filter(Boolean) as string[],
      authors: article.author ? [{ name: article.author }] : undefined,
    };
  });

  return NextResponse.json({
    version: "https://jsonfeed.org/version/1.1",
    title: `${publicIdentity.canonicalName} — Articles`,
    home_page_url: `${SITE_URL}/en/articles`,
    feed_url: `${SITE_URL}/en/feed.json`,
    description: "Practical writing about enterprise AI systems, automation, and delivery.",
    language: "en",
    authors: [{ name: siteConfig.name, url: SITE_URL }],
    items,
  }, {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=21600, s-maxage=21600",
    },
  });
}
