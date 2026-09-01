import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { publicContent } from "@/config/public-content";
import { buildRootMetadata } from "@/lib/root-metadata";

const SITE_URL = "https://me.itheheda.online";

describe("SEO routes", () => {
  it("publishes sitemap entries under the canonical domain", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(entries.length).toBeGreaterThan(0);
    expect(urls).toContain(`${SITE_URL}/projects`);
    expect(urls).toContain(`${SITE_URL}/services`);
    expect(urls).toContain(`${SITE_URL}/contact`);
    expect(urls).toContain(`${SITE_URL}/about`);
    expect(urls).toContain(`${SITE_URL}/en`);
    expect(urls).toContain(`${SITE_URL}/en/services`);
    expect(urls).toContain(`${SITE_URL}/en/projects/hermes-notebook`);
    expect(urls).not.toContain(`${SITE_URL}/en/articles/lead-process-ai-automation-four-dimensions-real-sample-validation`);
    expect(urls).toContain(`${SITE_URL}/llms.txt`);
    expect(urls).toContain(`${SITE_URL}/feed.xml`);
    expect(urls).toContain(`${SITE_URL}/feed.json`);
    expect(urls).toContain(`${SITE_URL}/en/feed.xml`);
    expect(urls).toContain(`${SITE_URL}/en/feed.json`);
    expect(urls).toContain(`${SITE_URL}/.well-known/brand-facts.json`);
    expect(urls).toContain(`${SITE_URL}/ai/services.json`);
    expect(urls).toContain(`${SITE_URL}/ai/projects.json`);
    expect(urls.some((url) => url.startsWith(`${SITE_URL}/projects/`))).toBe(true);
    expect(urls).toContain(`${SITE_URL}/projects/hermes-notebook`);
    expect(urls).not.toContain(`${SITE_URL}/projects/enterprise-content-growth`);
    expect(urls).toContain(`${SITE_URL}/articles/lead-process-ai-automation-four-dimensions-real-sample-validation`);
    expect(urls.some((url) => url.includes("hello-agents"))).toBe(false);
    expect(urls).not.toContain(`${SITE_URL}/content`);
    expect(urls).not.toContain(`${SITE_URL}/photography`);
    expect(urls).not.toContain(`${SITE_URL}/links`);
    expect(urls).not.toContain(`${SITE_URL}/resume`);
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https:\/\/me\.itheheda\.online(?:\/|$)/);
    }

    const home = entries.find((entry) => entry.url === `${SITE_URL}/`);
    expect(home?.alternates?.languages).toMatchObject({
      "zh-CN": `${SITE_URL}/`,
      en: `${SITE_URL}/en`,
      "x-default": `${SITE_URL}/`,
    });
    expect(new Date(home?.lastModified || 0).toISOString()).toBe(
      new Date(publicContent.updatedAt).toISOString()
    );
  });

  it("allows public crawling and points to the canonical sitemap", () => {
    const result = robots();
    const rules = JSON.stringify(result.rules);

    expect(result.host).toBeUndefined();
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(rules).toContain("/admin/");
    expect(rules).toContain("/api/");
    expect(rules).not.toContain("/_next/");
    expect(rules).not.toMatch(/GPTBot|ChatGPT-User|CCBot|anthropic-ai/);
  });

  it("publishes configured international and Chinese webmaster verification without defaults", () => {
    const verificationEnvironment = {
      GOOGLE_SITE_VERIFICATION: "google-verification-value",
      BING_SITE_VERIFICATION: "bing-verification-value",
      YANDEX_SITE_VERIFICATION: "yandex-verification-value",
      NAVER_SITE_VERIFICATION: "naver-verification-value",
      BAIDU_SITE_VERIFICATION: "baidu-verification-value",
      SO360_SITE_VERIFICATION: "360-verification-value",
      SOGOU_SITE_VERIFICATION: "sogou-verification-value",
      SHENMA_SITE_VERIFICATION: "shenma-verification-value",
      TOUTIAO_SITE_VERIFICATION: "toutiao-verification-value",
    } as const;
    const originalValues = Object.fromEntries(
      Object.keys(verificationEnvironment).map((name) => [name, process.env[name]])
    );

    try {
      for (const name of Object.keys(verificationEnvironment)) {
        delete process.env[name];
      }
      expect(buildRootMetadata("zh").verification).toBeUndefined();

      Object.assign(process.env, verificationEnvironment);
      expect(buildRootMetadata("en").verification).toEqual({
        google: "google-verification-value",
        yandex: "yandex-verification-value",
        other: {
          "msvalidate.01": "bing-verification-value",
          "naver-site-verification": "naver-verification-value",
          "baidu-site-verification": "baidu-verification-value",
          "360-site-verification": "360-verification-value",
          sogou_site_verification: "sogou-verification-value",
          "shenma-site-verification": "shenma-verification-value",
          "bytedance-verification-code": "toutiao-verification-value",
        },
      });
    } finally {
      for (const [name, value] of Object.entries(originalValues)) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });

  it("publishes the localized public brand as the root metadata author and creator", () => {
    expect(buildRootMetadata("zh")).toMatchObject({
      authors: [{ name: "实解智能", url: SITE_URL }],
      creator: "实解智能",
      publisher: "实解智能",
    });
    expect(buildRootMetadata("en")).toMatchObject({
      authors: [{ name: "SolveReal Systems", url: SITE_URL }],
      creator: "SolveReal Systems",
      publisher: "SolveReal Systems",
    });
  });
});
