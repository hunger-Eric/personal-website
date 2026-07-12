import { publicContent } from "@/config/public-content";
import { publicIdentity } from "@/config/public-identity";
import { publicJsonResponse } from "@/lib/ai-readable/response";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";
export const revalidate = 21600;

export function GET() {
  return publicJsonResponse(
    {
      schemaVersion: publicContent.schemaVersion,
      updatedAt: publicContent.updatedAt,
      canonicalUrl: SITE_URL,
      name: publicIdentity.canonicalName,
      category: publicIdentity.category,
      positioning: publicIdentity.positioning,
      audience: publicIdentity.audience,
      description: publicIdentity.description,
      languages: publicIdentity.languages,
      contact: {
        page: `${SITE_URL}${publicIdentity.contact.page}`,
        promise: publicIdentity.contact.promise,
      },
      machineReadable: {
        services: "/ai/services.json",
        projects: "/ai/projects.json",
        llms: "/llms.txt",
        sitemap: "/sitemap.xml",
      },
    },
    { contentLocation: "/.well-known/brand-facts.json" }
  );
}
