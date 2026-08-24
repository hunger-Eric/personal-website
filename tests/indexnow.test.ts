import { afterEach, describe, expect, it } from "vitest";

import { GET } from "@/app/indexnow-key.txt/route";
import {
  buildIndexNowPayload,
  runIndexNowNotification,
} from "@/lib/indexnow.mjs";

const SITE_URL = "https://me.itheheda.online";
const KEY = "indexnow-test-key-2026";

afterEach(() => {
  delete process.env.INDEXNOW_KEY;
});

describe("IndexNow", () => {
  it("serves only a valid configured key as plain text", async () => {
    expect((await GET()).status).toBe(404);

    process.env.INDEXNOW_KEY = KEY;
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(await response.text()).toBe(KEY);
  });

  it("builds a deduplicated payload for canonical public URLs", () => {
    expect(
      buildIndexNowPayload({
        siteUrl: SITE_URL,
        key: KEY,
        urls: [`${SITE_URL}/`, `${SITE_URL}/en/services`, `${SITE_URL}/`],
      })
    ).toEqual({
      host: "me.itheheda.online",
      key: KEY,
      keyLocation: `${SITE_URL}/indexnow-key.txt`,
      urlList: [`${SITE_URL}/`, `${SITE_URL}/en/services`],
    });
  });

  it.each([
    "https://example.com/services",
    "http://me.itheheda.online/services",
    "https://me.itheheda.online/admin/crawlers",
    "https://me.itheheda.online/api/contact",
    "https://me.itheheda.online/services?preview=1",
  ])("rejects a URL outside the canonical public whitelist: %s", (url) => {
    expect(() =>
      buildIndexNowPayload({ siteUrl: SITE_URL, key: KEY, urls: [url] })
    ).toThrow(/public canonical URL/);
  });

  it("defaults to dry-run and never calls the external endpoint", async () => {
    let calls = 0;
    const result = await runIndexNowNotification(
      { siteUrl: SITE_URL, key: KEY, urls: [`${SITE_URL}/services`] },
      {
        fetchImpl: async () => {
          calls += 1;
          return new Response(null, { status: 200 });
        },
      }
    );

    expect(result).toEqual({ mode: "dry-run", urlCount: 1 });
    expect(calls).toBe(0);
  });

  it("requires an explicit submission gate before posting", async () => {
    await expect(
      runIndexNowNotification(
        { siteUrl: SITE_URL, key: KEY, urls: [`${SITE_URL}/services`] },
        { submit: true, allowExternalSubmission: false }
      )
    ).rejects.toThrow(/INDEXNOW_ALLOW_SUBMIT/);
  });
});
