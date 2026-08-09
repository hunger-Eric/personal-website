import { getLocalizedPublicContent } from "./public-content";
import {
  BusinessProfileSchema,
  type BusinessProfile,
} from "@/lib/article-workbench/contracts";

function projectEvidence(content: ReturnType<typeof getLocalizedPublicContent>) {
  return content.projects.flatMap((project) =>
    project.evidenceArtifacts.map((artifact) => ({
      id: `${project.id}-${artifact.id}`,
      claim: artifact.description ?? artifact.label,
      reviewed: true as const,
    }))
  );
}

function createDefaultArticleBusinessProfile(): BusinessProfile {
  const content = getLocalizedPublicContent("zh");

  return BusinessProfileSchema.parse({
    identity: {
      name: content.identity.name,
      category: content.identity.category,
      positioning: content.identity.positioning,
      description: content.identity.description,
    },
    services: content.service.suitableWork.map((item) => item),
    audience: content.identity.audience,
    geographicScope: [],
    differentiators: content.service.method.map((step) => step.description),
    approvedEvidence: projectEvidence(content),
    disallowedClaims: content.service.boundaries.map((item) => item),
    callToAction: {
      label: content.cta.primary.label,
      href: content.cta.primary.href,
    },
  });
}

export const defaultArticleBusinessProfile = createDefaultArticleBusinessProfile();
