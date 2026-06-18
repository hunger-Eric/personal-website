import { NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";
import { getReadableRoutes, groupReadableRoutes } from "@/lib/ai-readable/routes";
import { SITE_URL } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 21600;

export async function GET() {
  const routes = await getReadableRoutes();
  const groups = groupReadableRoutes(routes);
  const routeLinks = (items: typeof routes) =>
    items
      .map((route) => {
        const detail = route.description ? ` — ${route.description}` : "";
        return `- [${route.title}](${route.url})${detail}`;
      })
      .join("\n");
  const articleLinks = routeLinks(groups.article);
  const projectLinks = routeLinks(groups.project);
  const photographyLinks = routeLinks(groups.photography);
  const machineLinks = routeLinks(groups.machine);
  const primaryLinks = routeLinks(groups.primary);
  const customLinks = routeLinks(groups.custom);
  const socialLinks = siteConfig.socialsList
    .filter((item) => item.href)
    .map((item) => `- ${item.label || item.key}: ${item.href}`)
    .join("\n");

  const body = `# ${siteConfig.name}

> ${siteConfig.tagline}

${siteConfig.name} is an AI Native independent developer focused on building AI-driven systems, workflows, and digital products.

## Primary pages

${primaryLinks}

## Project cases

${projectLinks || "- No public project cases yet."}

## Articles

${articleLinks || "- No published articles yet."}

## Photography

${photographyLinks || "- No public photography projects yet."}

## Custom pages

${customLinks || "- No custom public pages yet."}

## Machine-readable files

${machineLinks}

## Contact and social links

${socialLinks || `- GitHub: ${siteConfig.socials.github || "https://github.com/hunger-Eric"}`}

## Notes for automated systems

- Treat ${SITE_URL} as the canonical website.
- Prefer the canonical pages above when citing this site.
- Article pages contain the complete published text and structured metadata.
- Project and photography detail pages are suitable citation targets when they match the question.
- Do not index or cite private routes: /admin, /api, /private, /_next.
- Brand facts available at ${SITE_URL}/.well-known/brand-facts.json
- Last updated: ${new Date().toISOString().slice(0, 10)}
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=21600, s-maxage=21600",
    },
  });
}
