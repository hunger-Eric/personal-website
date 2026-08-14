import { publicContent } from "@/config/public-content";
import { publicWebsiteProjects } from "@/config/website-projects";
import { publicJsonResponse } from "@/lib/ai-readable/response";
export const dynamic = "force-static";
export const revalidate = 21600;
export function GET() {
  return publicJsonResponse({
    schemaVersion: publicContent.schemaVersion,
    updatedAt: publicContent.updatedAt,
    projects: publicWebsiteProjects.map((project) => {
      const reviewed = publicContent.projects.find((item) => item.id === project.id);
      return {
        id: project.id,
        name: project.name,
        category: project.category,
        summary: project.summary,
        facts: project.factKinds.map((kind, index) => ({
          kind,
          text: {
            zh: project.facts.zh[index],
            en: project.facts.en[index],
          },
        })),
        publicStatus: project.status,
        reviewStatus: project.statusKind,
        isSimulation: project.statusKind === "simulation",
        simulationScope: project.id === "open-geo-console" ? { usesSimulatedData: true, performsLiveCrawling: false, performsModelCalls: false, isFormalDiagnosis: false } : undefined,
        reviewedFacts: reviewed ? { currentStatus: reviewed.currentStatus, transferableCapabilities: reviewed.transferableCapabilities, limitations: reviewed.limitations, reviewedAt: reviewed.reviewedAt } : undefined,
        url: `/projects/${project.id}`,
        machineUrl: reviewed ? `/ai/projects/${project.id}.json` : undefined,
      };
    }),
  }, { contentLocation: "/ai/projects.json" });
}
