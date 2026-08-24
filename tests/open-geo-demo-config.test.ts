import { describe, expect, it } from "vitest";

import { getOpenGeoContactContext } from "@/config/open-geo-demo";

describe("Open GEO demo contact context", () => {
  it("returns English scenario and artifact labels for the English contact page", () => {
    expect(
      getOpenGeoContactContext(
        {
          project: "open-geo-console",
          scenario: "service-clarity",
          artifact: "diagnostic-summary",
        },
        "en"
      )
    ).toMatchObject({
      scenarioTitle: "Can AI clearly understand the service offering?",
      artifactTitle: "Simulated deliverable · GEO diagnostic summary",
    });
  });
});
