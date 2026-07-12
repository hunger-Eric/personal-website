import { describe, expect, it } from "vitest";

import { getReadableRoutes, groupReadableRoutes } from "@/lib/ai-readable/routes";

const SITE_URL = "https://me.itheheda.online";

describe("AI-readable route inventory", () => {
  it("groups public, detail, and machine-readable routes", async () => {
    const routes = await getReadableRoutes();
    const groups = groupReadableRoutes(routes);

    expect(groups.primary.map((route) => route.path)).toEqual(
      expect.arrayContaining(["/", "/projects", "/articles", "/about", "/contact"])
    );
    expect(groups.project.map((route) => route.path)).toEqual([
      "/projects/freight-lead-agent",
    ]);
    expect(groups.article.length).toBeGreaterThan(0);
    expect(groups.machine.map((route) => route.path)).toEqual(
      expect.arrayContaining([
        "/llms.txt",
        "/feed.xml",
        "/feed.json",
        "/sitemap.xml",
        "/.well-known/brand-facts.json",
        "/ai/services.json",
        "/ai/projects.json",
        "/ai/projects/freight-lead-agent.json",
      ])
    );
    expect(routes.map((route) => route.path)).not.toEqual(
      expect.arrayContaining([
        "/photography",
        "/content",
        "/links",
        "/resume",
      ])
    );
    for (const route of routes) {
      expect(route.url).toMatch(new RegExp(`^${SITE_URL.replaceAll(".", "\\.")}`));
      expect(route.title.length).toBeGreaterThan(0);
    }
  });
});
