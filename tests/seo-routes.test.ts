import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

const SITE_URL = "https://me.itheheda.online";

describe("SEO routes", () => {
  it("publishes sitemap entries under the canonical domain", async () => {
    const entries = await sitemap();

    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https:\/\/me\.itheheda\.online(?:\/|$)/);
    }
  });

  it("allows public crawling and points to the canonical sitemap", () => {
    const result = robots();
    const rules = JSON.stringify(result.rules);

    expect(result.host).toBe(SITE_URL);
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(rules).not.toMatch(/GPTBot|ChatGPT-User|CCBot|anthropic-ai/);
  });
});
