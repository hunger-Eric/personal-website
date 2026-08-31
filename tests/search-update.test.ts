import { describe, expect, it } from "vitest";

import {
  runBaiduSubmission,
  runSearchUpdate,
} from "@/lib/search-update.mjs";
import { parseSearchUpdateArguments } from "@/lib/search-update-cli.mjs";

const SITE_URL = "https://me.itheheda.online";
const ARTICLE_URL = `${SITE_URL}/articles/evidence-led-ai-automation`;

describe("search engine update workflow", () => {
  it("parses a single-engine retry without selecting other engines", () => {
    expect(
      parseSearchUpdateArguments([
        "--submit",
        "--engine",
        "baidu",
        "--url",
        ARTICLE_URL,
      ])
    ).toEqual({ submit: true, engines: ["baidu"], urls: [ARTICLE_URL] });
    expect(() => parseSearchUpdateArguments(["--engine", "unknown", "--url", ARTICLE_URL]))
      .toThrow(/Unsupported search engine/);
  });

  it("keeps Baidu in dry-run mode unless real submission is explicitly enabled", async () => {
    let networkCalls = 0;

    const result = await runBaiduSubmission(
      {
        siteUrl: SITE_URL,
        token: "private-baidu-token",
        urls: [ARTICLE_URL],
      },
      {
        fetchImpl: async () => {
          networkCalls += 1;
          return new Response(null, { status: 500 });
        },
      }
    );

    expect(result).toEqual({ mode: "dry-run", urlCount: 1 });
    expect(networkCalls).toBe(0);
  });

  it("requires a separate Baidu submission gate", async () => {
    await expect(
      runBaiduSubmission(
        {
          siteUrl: SITE_URL,
          token: "private-baidu-token",
          urls: [ARTICLE_URL],
        },
        { submit: true, allowExternalSubmission: false }
      )
    ).rejects.toThrow(/BAIDU_ALLOW_SUBMIT/);
  });

  it("returns Baidu acceptance counts without exposing its token", async () => {
    const result = await runBaiduSubmission(
      {
        siteUrl: SITE_URL,
        token: "private-baidu-token",
        urls: [ARTICLE_URL],
      },
      {
        submit: true,
        allowExternalSubmission: true,
        fetchImpl: async () =>
          Response.json({
            remain: 49,
            success: 1,
            not_same_site: [],
            not_valid: [],
          }),
      }
    );

    expect(result).toEqual({
      mode: "submitted",
      status: 200,
      urlCount: 1,
      accepted: 1,
      remainingQuota: 49,
      rejected: [],
    });
    expect(JSON.stringify(result)).not.toContain("private-baidu-token");
  });

  it("uses the exact Baidu site identifier configured by its resource platform", async () => {
    let submittedSite = "";

    await runBaiduSubmission(
      {
        siteUrl: SITE_URL,
        baiduSite: "me.itheheda.online",
        token: "private-baidu-token",
        urls: [ARTICLE_URL],
      },
      {
        submit: true,
        allowExternalSubmission: true,
        fetchImpl: async (input) => {
          submittedSite = new URL(String(input)).searchParams.get("site") ?? "";
          return Response.json({ remain: 49, success: 1 });
        },
      }
    );

    expect(submittedSite).toBe("me.itheheda.online");
  });

  it("stops before notifications when a changed URL is not live in the sitemap", async () => {
    let providerCalls = 0;

    await expect(
      runSearchUpdate(
        {
          siteUrl: SITE_URL,
          sitemapUrl: `${SITE_URL}/sitemap.xml`,
          urls: [ARTICLE_URL],
          indexNowKey: "indexnow-test-key-2026",
          baiduToken: "private-baidu-token",
        },
        {
          fetchImpl: async (input) => {
            const url = String(input);
            if (url === `${SITE_URL}/sitemap.xml`) {
              return new Response(
                `<?xml version="1.0"?><urlset><url><loc>${SITE_URL}/</loc></url></urlset>`,
                { status: 200 }
              );
            }
            providerCalls += 1;
            return new Response(null, { status: 200 });
          },
        }
      )
    ).rejects.toThrow(/not present in the live sitemap/);

    expect(providerCalls).toBe(0);
  });

  it("continues with Baidu when Bing fails", async () => {
    let baiduCalls = 0;

    const result = await runSearchUpdate(
      {
        siteUrl: SITE_URL,
        sitemapUrl: `${SITE_URL}/sitemap.xml`,
        urls: [ARTICLE_URL],
        indexNowKey: "indexnow-test-key-2026",
        baiduToken: "private-baidu-token",
      },
      {
        submit: true,
        allowIndexNowSubmission: true,
        allowBaiduSubmission: true,
        fetchImpl: async (input) => {
          const url = String(input);
          if (url === `${SITE_URL}/sitemap.xml`) {
            return new Response(`<urlset><url><loc>${ARTICLE_URL}</loc></url></urlset>`, {
              status: 200,
            });
          }
          if (url === ARTICLE_URL) {
            return new Response("<!doctype html><title>Published</title>", {
              status: 200,
              headers: { "content-type": "text/html; charset=utf-8" },
            });
          }
          if (url === "https://api.indexnow.org/indexnow") {
            return new Response(null, { status: 500 });
          }
          if (url.startsWith("http://data.zz.baidu.com/urls?")) {
            baiduCalls += 1;
            return Response.json({ remain: 49, success: 1 });
          }
          throw new Error(`Unexpected URL: ${url}`);
        },
      }
    );

    expect(result.bing).toEqual({
      mode: "failed",
      error: "IndexNow submission failed with HTTP 500",
    });
    expect(result.baidu).toMatchObject({ mode: "submitted", accepted: 1 });
    expect(result.indexingStatus).toBe("partial-submission-unverified");
    expect(baiduCalls).toBe(1);
  });

  it("keeps Sogou last and pending when Baidu fails", async () => {
    const result = await runSearchUpdate(
      {
        siteUrl: SITE_URL,
        sitemapUrl: `${SITE_URL}/sitemap.xml`,
        urls: [ARTICLE_URL],
        indexNowKey: "indexnow-test-key-2026",
        baiduToken: "private-baidu-token",
      },
      {
        submit: true,
        allowIndexNowSubmission: true,
        allowBaiduSubmission: true,
        fetchImpl: async (input) => {
          const url = String(input);
          if (url === `${SITE_URL}/sitemap.xml`) {
            return new Response(`<urlset><url><loc>${ARTICLE_URL}</loc></url></urlset>`, {
              status: 200,
            });
          }
          if (url === ARTICLE_URL) {
            return new Response("<!doctype html><title>Published</title>", {
              status: 200,
              headers: { "content-type": "text/html; charset=utf-8" },
            });
          }
          if (url === "https://api.indexnow.org/indexnow") {
            return new Response(null, { status: 200 });
          }
          if (url.startsWith("http://data.zz.baidu.com/urls?")) {
            return Response.json({ error: 401, message: "token is not valid" }, { status: 401 });
          }
          throw new Error(`Unexpected URL: ${url}`);
        },
      }
    );

    expect(result.bing).toEqual({ mode: "submitted", status: 200, urlCount: 1 });
    expect(result.baidu).toEqual({
      mode: "failed",
      error: "Baidu submission failed with HTTP 401",
    });
    expect(result.sogou).toMatchObject({
      mode: "manual-url-submission",
      status: "pending",
      urls: [ARTICLE_URL],
    });
    expect(Object.keys(result)).toEqual([
      "generatedAt",
      "siteUrl",
      "sitemap",
      "urls",
      "google",
      "bing",
      "baidu",
      "sogou",
      "indexingStatus",
    ]);
  });

  it("retries one selected search engine without touching the others", async () => {
    let indexNowCalls = 0;

    const result = await runSearchUpdate(
      {
        siteUrl: SITE_URL,
        sitemapUrl: `${SITE_URL}/sitemap.xml`,
        urls: [ARTICLE_URL],
        indexNowKey: "indexnow-test-key-2026",
        baiduToken: "private-baidu-token",
      },
      {
        submit: true,
        engines: ["baidu"],
        allowIndexNowSubmission: true,
        allowBaiduSubmission: true,
        fetchImpl: async (input) => {
          const url = String(input);
          if (url === `${SITE_URL}/sitemap.xml`) {
            return new Response(`<urlset><url><loc>${ARTICLE_URL}</loc></url></urlset>`, {
              status: 200,
            });
          }
          if (url === ARTICLE_URL) {
            return new Response("<!doctype html><title>Published</title>", {
              status: 200,
              headers: { "content-type": "text/html; charset=utf-8" },
            });
          }
          if (url === "https://api.indexnow.org/indexnow") {
            indexNowCalls += 1;
            return new Response(null, { status: 200 });
          }
          if (url.startsWith("http://data.zz.baidu.com/urls?")) {
            return Response.json({ remain: 49, success: 1 });
          }
          throw new Error(`Unexpected URL: ${url}`);
        },
      }
    );

    expect(result.google).toEqual({ mode: "skipped", status: "not-requested" });
    expect(result.bing).toEqual({ mode: "skipped", status: "not-requested" });
    expect(result.baidu).toMatchObject({ mode: "submitted", accepted: 1 });
    expect(result.sogou).toEqual({ mode: "skipped", status: "not-requested" });
    expect(indexNowCalls).toBe(0);
  });

  it("labels a unified dry-run as not submitted", async () => {
    const result = await runSearchUpdate(
      {
        siteUrl: SITE_URL,
        sitemapUrl: `${SITE_URL}/sitemap.xml`,
        urls: [ARTICLE_URL],
        indexNowKey: "indexnow-test-key-2026",
      },
      {
        fetchImpl: async (input) => {
          if (String(input) === `${SITE_URL}/sitemap.xml`) {
            return new Response(`<urlset><url><loc>${ARTICLE_URL}</loc></url></urlset>`, {
              status: 200,
            });
          }
          return new Response("<!doctype html><title>Published</title>", {
            status: 200,
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        },
        now: () => new Date("2026-09-01T03:00:00.000Z"),
      }
    );

    expect(result.indexingStatus).toBe("ready-not-submitted");
    expect(result.bing.mode).toBe("dry-run");
    expect(result.baidu.mode).toBe("dry-run");
  });

  it("produces one truthful receipt for Google, Bing, Baidu, and Sogou", async () => {
    const result = await runSearchUpdate(
      {
        siteUrl: SITE_URL,
        sitemapUrl: `${SITE_URL}/sitemap.xml`,
        urls: [ARTICLE_URL],
        indexNowKey: "indexnow-test-key-2026",
        baiduToken: "private-baidu-token",
      },
      {
        fetchImpl: async (input, init) => {
          const url = String(input);
          if (url === `${SITE_URL}/sitemap.xml`) {
            return new Response(
              `<?xml version="1.0"?><urlset><url><loc>${ARTICLE_URL}</loc></url></urlset>`,
              { status: 200 }
            );
          }
          if (url === ARTICLE_URL) {
            return new Response("<!doctype html><title>Published</title>", {
              status: 200,
              headers: { "content-type": "text/html; charset=utf-8" },
            });
          }
          if (url === "https://api.indexnow.org/indexnow") {
            expect(init?.method).toBe("POST");
            return new Response(null, { status: 200 });
          }
          if (url.startsWith("http://data.zz.baidu.com/urls?")) {
            expect(init?.method).toBe("POST");
            return Response.json({ remain: 49, success: 1 });
          }
          throw new Error(`Unexpected URL: ${url}`);
        },
        submit: true,
        allowIndexNowSubmission: true,
        allowBaiduSubmission: true,
        now: () => new Date("2026-09-01T03:00:00.000Z"),
      }
    );

    expect(result).toEqual({
      generatedAt: "2026-09-01T03:00:00.000Z",
      siteUrl: SITE_URL,
      sitemap: {
        url: `${SITE_URL}/sitemap.xml`,
        status: "verified",
        changedUrlCount: 1,
      },
      urls: [ARTICLE_URL],
      google: {
        mode: "sitemap-discovery",
        status: "ready",
        note: "Google will recrawl the registered sitemap; general pages are not eligible for the Google Indexing API.",
      },
      bing: { mode: "submitted", status: 200, urlCount: 1 },
      baidu: {
        mode: "submitted",
        status: 200,
        urlCount: 1,
        accepted: 1,
        remainingQuota: 49,
        rejected: [],
      },
      sogou: {
        mode: "manual-url-submission",
        status: "pending",
        urls: [ARTICLE_URL],
        note: "Sogou has no public URL-submission API for this workflow; submit these page URLs in its resource platform.",
      },
      indexingStatus: "submitted-unverified",
    });
  });
});
