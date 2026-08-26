import { describe, expect, it } from "vitest";
import { getWebsiteProjects, getPublicWebsiteProjects, getWebsiteProject, getPublicWebsiteProject } from "@/config/website-projects";

describe("Open GEO outbound language", () => {
  it.each(["en", "zh"] as const)("keeps %s visitors on the matching Open GEO homepage", (locale) => {
    const expected = `https://geo.itheheda.online/${locale}`;
    expect(getWebsiteProject("open-geo-console", locale)?.liveUrl).toBe(expected);
    expect(getPublicWebsiteProject("open-geo-console", locale)?.liveUrl).toBe(expected);
    expect(getWebsiteProjects(locale).find((p) => p.id === "open-geo-console")?.liveUrl).toBe(expected);
    expect(getPublicWebsiteProjects(locale).find((p) => p.id === "open-geo-console")?.liveUrl).toBe(expected);
  });
});
