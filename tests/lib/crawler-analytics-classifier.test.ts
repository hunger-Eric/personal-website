import { describe, expect, it } from "vitest";
import {
  classifyUserAgent,
  getAutomationFilterPatterns,
} from "@/lib/crawler-analytics/classifier";

describe("crawler User-Agent classifier", () => {
  it.each([
    ["OpenGeoConsoleBot/1.0 (+https://github.com/open-geo-console)", "open_geo_self_test"],
    ["Mozilla/5.0 compatible; GPTBot/1.2", "identified_ai_crawler"],
    ["ClaudeBot/1.0", "identified_ai_crawler"],
    ["PerplexityBot/1.0", "identified_ai_crawler"],
    ["curl/8.7.1", "other_automation"],
    ["Googlebot/2.1", "other_automation"],
    ["Mozilla/5.0 Safari/605.1.15", "unclassified"],
  ])("classifies %s as %s", (userAgent, category) => {
    expect(classifyUserAgent(userAgent).category).toBe(category);
  });

  it("applies Open GEO before generic bot rules and ignores case", () => {
    expect(classifyUserAgent("opENgeOconSoleBOT/1.0")).toMatchObject({
      category: "open_geo_self_test",
      id: "open-geo-console",
    });
  });

  it("preserves ordered rule precedence for overlapping User-Agents", () => {
    expect(classifyUserAgent("OpenGeoConsoleBot/1.0 GPTBot").category).toBe(
      "open_geo_self_test"
    );
    expect(classifyUserAgent("GPTBot curl/8.7").category).toBe(
      "identified_ai_crawler"
    );
  });

  it("returns the ordered, unique lowercase GraphQL OR filter patterns", () => {
    const patterns = getAutomationFilterPatterns();
    expect(patterns).toEqual([
      "opengeoconsolebot/",
      "gptbot",
      "chatgpt-user",
      "oai-searchbot",
      "claudebot",
      "claude-searchbot",
      "claude-user",
      "perplexitybot",
      "perplexity-user",
      "meta-externalagent",
      "meta-externalfetcher",
      "ccbot",
      "bytespider",
      "amazonbot",
      "googlebot",
      "bingbot",
      "duckduckbot",
      "baiduspider",
      "yandexbot",
      "slurp",
      "curl/",
      "wget/",
      "python-requests",
      "httpie/",
      "uptime",
      "pingdom",
      "headlesschrome",
      "playwright",
      "puppeteer",
      "selenium",
    ]);
    expect(patterns.every((pattern) => !pattern.includes("%") && !pattern.includes("_"))).toBe(
      true
    );
  });
});
