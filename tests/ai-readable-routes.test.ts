import { describe, expect, it } from "vitest";

import { getReadableRoutes, groupReadableRoutes } from "@/lib/ai-readable/routes";

const SITE_URL = "https://me.itheheda.online";

describe("AI-readable route inventory", () => {
  it("groups public, detail, and machine-readable routes", async () => {
    const routes = await getReadableRoutes();
    const groups = groupReadableRoutes(routes);

    expect(groups.primary.map((route) => route.path)).toEqual(
      expect.arrayContaining(["/", "/projects", "/articles", "/photography", "/links", "/content"])
    );
    expect(groups.project.length).toBeGreaterThan(0);
    expect(groups.article.length).toBeGreaterThan(0);
    expect(groups.photography.length).toBeGreaterThan(0);
    expect(groups.machine.map((route) => route.path)).toEqual(
      expect.arrayContaining([
        "/llms.txt",
        "/feed.xml",
        "/feed.json",
        "/sitemap.xml",
        "/.well-known/brand-facts.json",
      ])
    );
    for (const route of routes) {
      expect(route.url).toMatch(new RegExp(`^${SITE_URL.replaceAll(".", "\\.")}`));
      expect(route.title.length).toBeGreaterThan(0);
    }
  });
});
