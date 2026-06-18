import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

const SITE_URL = "https://me.itheheda.online";

describe("SEO routes", () => {
  it("publishes sitemap entries under the canonical domain", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(entries.length).toBeGreaterThan(0);
    expect(urls).toContain(`${SITE_URL}/projects`);
    expect(urls).toContain(`${SITE_URL}/content`);
    expect(urls).toContain(`${SITE_URL}/photography`);
    expect(urls).toContain(`${SITE_URL}/llms.txt`);
    expect(urls).toContain(`${SITE_URL}/feed.xml`);
    expect(urls).toContain(`${SITE_URL}/feed.json`);
    expect(urls).toContain(`${SITE_URL}/.well-known/brand-facts.json`);
    expect(urls.some((url) => url.startsWith(`${SITE_URL}/projects/`))).toBe(true);
    expect(urls.some((url) => url.startsWith(`${SITE_URL}/photography/`))).toBe(true);
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https:\/\/me\.itheheda\.online(?:\/|$)/);
    }
  });

  it("allows public crawling and points to the canonical sitemap", () => {
    const result = robots();
    const rules = JSON.stringify(result.rules);

    expect(result.host).toBe(SITE_URL);
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(rules).toContain("/admin/");
    expect(rules).toContain("/api/");
    expect(rules).not.toMatch(/GPTBot|ChatGPT-User|CCBot|anthropic-ai/);
  });
});
