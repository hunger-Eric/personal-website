import { describe, expect, it } from "vitest";

import { getLocalizedPublicContent } from "@/config/public-content";
import { defaultArticleBusinessProfile } from "@/config/article-business-profile";
import { BusinessProfileSchema } from "@/lib/article-workbench/contracts";

describe("article business profile", () => {
  it("rejects an empty service list", () => {
    expect(
      BusinessProfileSchema.safeParse({
        ...defaultArticleBusinessProfile,
        services: [],
      }).success
    ).toBe(false);
  });

  it("rejects unreviewed evidence", () => {
    expect(
      BusinessProfileSchema.safeParse({
        ...defaultArticleBusinessProfile,
        approvedEvidence: [
          {
            id: "unreviewed",
            claim: "Unreviewed claim",
            reviewed: false,
          },
        ],
      }).success
    ).toBe(false);
  });

  it("rejects unknown profile keys", () => {
    expect(
      BusinessProfileSchema.safeParse({
        ...defaultArticleBusinessProfile,
        inventedMetric: "99%",
      }).success
    ).toBe(false);
  });

  it("contains only facts exposed by the reviewed Chinese public-content projection", () => {
    const publicContent = getLocalizedPublicContent("zh");
    expect(defaultArticleBusinessProfile).toEqual({
      identity: {
        name: publicContent.identity.name,
        category: publicContent.identity.category,
        positioning: publicContent.identity.positioning,
        description: publicContent.identity.description,
      },
      services: publicContent.service.suitableWork,
      audience: publicContent.identity.audience,
      geographicScope: [],
      differentiators: publicContent.service.method.map((step) => step.description),
      approvedEvidence: publicContent.projects.flatMap((project) =>
        project.evidenceArtifacts.map((artifact) => ({
          id: `${project.id}-${artifact.id}`,
          claim: artifact.description ?? artifact.label,
          reviewed: true,
        }))
      ),
      disallowedClaims: publicContent.service.boundaries,
      callToAction: {
        label: publicContent.cta.primary.label,
        href: publicContent.cta.primary.href,
      },
    });
  });
});
