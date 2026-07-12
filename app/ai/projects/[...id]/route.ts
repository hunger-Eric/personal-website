import { publicContent } from "@/config/public-content";
import { publicJsonResponse } from "@/lib/ai-readable/response";

export const dynamic = "force-static";
export const revalidate = 21600;

export function generateStaticParams() {
  return publicContent.projects.map((project) => ({
    id: [`${project.id}.json`],
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string[] }> }
) {
  const segments = (await params)?.id ?? [];
  const requested = segments.join("/");
  const id = requested.endsWith(".json") ? requested.slice(0, -5) : "";
  const project = publicContent.projects.find((item) => item.id === id);
  if (!project) {
    return publicJsonResponse(
      { schemaVersion: publicContent.schemaVersion, error: "Project not found" },
      { status: 404 }
    );
  }

  return publicJsonResponse(
    {
      schemaVersion: publicContent.schemaVersion,
      updatedAt: publicContent.updatedAt,
      project,
      canonicalUrl: `/projects/${project.id}`,
    },
    { contentLocation: `/ai/projects/${project.id}.json` }
  );
}
