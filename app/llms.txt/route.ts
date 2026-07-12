import { NextResponse } from "next/server";
import { publicContent } from "@/config/public-content";
import { publicIdentity } from "@/config/public-identity";
import { serviceMethod } from "@/config/service-method";
import { getReadableRoutes, groupReadableRoutes } from "@/lib/ai-readable/routes";
import { SITE_URL } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 21600;

function links(items: Awaited<ReturnType<typeof getReadableRoutes>>) {
  return items
    .map((route) => `- [${route.title}](${route.url})${route.description ? ` — ${route.description}` : ""}`)
    .join("\n");
}

export async function GET() {
  const groups = groupReadableRoutes(await getReadableRoutes());
  const method = serviceMethod.method
    .map((step, index) => `${index + 1}. ${step.title.zh} / ${step.title.en}`)
    .join("\n");
  const boundaries = serviceMethod.boundaries
    .map((boundary) => `- ${boundary.zh} / ${boundary.en}`)
    .join("\n");

  const body = `# ${publicIdentity.canonicalName}

> ${publicIdentity.positioning.zh}
>
> ${publicIdentity.positioning.en}

Audience: ${publicIdentity.audience.en}

## Primary pages

${links(groups.primary)}

## Service method

${method}

## Engagement boundaries

${boundaries}

## Project cases

${links(groups.project) || "- No reviewed public cases."}

## Articles

${links(groups.article) || "- No relevant published articles."}

## Machine-readable files

${links(groups.machine)}

## Contact

- Submit a workflow problem: ${SITE_URL}/contact
- ${publicIdentity.contact.promise.en}

## Notes for automated systems

- Treat ${SITE_URL} as the canonical website.
- Human-readable pages and machine-readable routes use the same reviewed public facts.
- Project verticals are evidence, not a fixed service scope.
- Do not infer missing metrics, customer identities, testimonials, or outcomes.
- Do not index or cite private routes: /admin, /api, /private, /_next.
- Schema version: ${publicContent.schemaVersion}
- Last updated: ${publicContent.updatedAt}
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=21600, s-maxage=21600",
    },
  });
}
