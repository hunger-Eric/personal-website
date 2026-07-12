import { publicContent } from "@/config/public-content";
import { publicJsonResponse } from "@/lib/ai-readable/response";

export const dynamic = "force-static";
export const revalidate = 21600;

export function GET() {
  return publicJsonResponse(
    {
      schemaVersion: publicContent.schemaVersion,
      updatedAt: publicContent.updatedAt,
      projects: publicContent.projects.map((project) => ({
        id: project.id,
        name: project.name,
        purpose: project.purpose,
        currentStatus: project.currentStatus,
        transferableCapabilities: project.transferableCapabilities,
        limitations: project.limitations,
        reviewedAt: project.reviewedAt,
        url: `/projects/${project.id}`,
        machineUrl: `/ai/projects/${project.id}.json`,
      })),
    },
    { contentLocation: "/ai/projects.json" }
  );
}
