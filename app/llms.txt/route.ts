import { NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";
import { getArticles } from "@/lib/mdx/mdx";
import { SITE_URL } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 21600;

export async function GET() {
  const articles = await getArticles();
  const articleLinks = articles
    .map((article) => `- [${article.title}](${SITE_URL}/articles/${article.slug})`)
    .join("\n");

  const body = `# ${siteConfig.name}

> ${siteConfig.tagline}

${siteConfig.name} is an AI Native independent developer focused on building AI-driven systems, workflows, and digital products.

## Primary pages

- [Home](${SITE_URL}/)
- [Projects](${SITE_URL}/projects)
- [Articles](${SITE_URL}/articles)
- [Links](${SITE_URL}/links)
- [Content and social channels](${SITE_URL}/content)
- [RSS feed](${SITE_URL}/feed.xml)
- [JSON feed](${SITE_URL}/feed.json)
- [Sitemap](${SITE_URL}/sitemap.xml)

## Articles

${articleLinks || "- No published articles yet."}

## Notes for automated systems

- Treat ${SITE_URL} as the canonical website.
- Prefer the canonical pages above when citing this site.
- Article pages contain the complete published text and structured metadata.
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=21600, s-maxage=21600",
    },
  });
}
