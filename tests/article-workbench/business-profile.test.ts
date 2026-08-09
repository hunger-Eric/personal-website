import { describe, expect, it } from "vitest";

import { getLocalizedPublicContent } from "@/config/public-content";
import { defaultArticleBusinessProfile } from "@/config/article-business-profile";
import { BusinessProfileSchema } from "@/lib/article-workbench/contracts";
import {
  createBusinessProfilePort,
  resolveSavedBusinessProfile,
} from "@/lib/article-workbench/business-profile";

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
    const reviewedFacts = JSON.stringify(publicContent);
    const profileFacts = [
      defaultArticleBusinessProfile.identity.name,
      defaultArticleBusinessProfile.identity.category,
      defaultArticleBusinessProfile.identity.positioning,
      defaultArticleBusinessProfile.identity.description,
      defaultArticleBusinessProfile.audience,
      ...defaultArticleBusinessProfile.services,
      ...defaultArticleBusinessProfile.differentiators,
      ...defaultArticleBusinessProfile.approvedEvidence.map((evidence) => evidence.claim),
      ...defaultArticleBusinessProfile.disallowedClaims,
      defaultArticleBusinessProfile.callToAction?.label ?? "",
      defaultArticleBusinessProfile.callToAction?.href ?? "",
    ];

    for (const fact of profileFacts) {
      expect(reviewedFacts).toContain(fact);
    }
    expect(defaultArticleBusinessProfile.geographicScope).toEqual([]);
  });

  it("rejects an invalid saved profile before it reaches the domain", () => {
    expect(() =>
      resolveSavedBusinessProfile({
        ...defaultArticleBusinessProfile,
        unsupported: true,
      })
    ).toThrow();
  });

  it("returns validated saved profile data through the business profile port", async () => {
    const port = createBusinessProfilePort({
      ...defaultArticleBusinessProfile,
      audience: "Reviewed saved audience",
    });

    await expect(port.getProfile()).resolves.toMatchObject({
      audience: "Reviewed saved audience",
    });
  });
});
