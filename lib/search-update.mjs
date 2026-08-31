import { buildIndexNowPayload, runIndexNowNotification } from "./indexnow.mjs";

const BAIDU_ENDPOINT = "http://data.zz.baidu.com/urls";

function canonicalUrls({ siteUrl, urls }) {
  return buildIndexNowPayload({
    siteUrl,
    key: "search-update-validation-key",
    urls,
  }).urlList;
}

export async function runBaiduSubmission(input, options = {}) {
  const urls = canonicalUrls(input);
  if (!options.submit) return { mode: "dry-run", urlCount: urls.length };
  if (!options.allowExternalSubmission) {
    throw new Error("Real Baidu submission requires BAIDU_ALLOW_SUBMIT=true");
  }

  const token = typeof input.token === "string" ? input.token.trim() : "";
  if (!token) throw new Error("BAIDU_PUSH_TOKEN is required for real submission");

  const endpoint = new URL(BAIDU_ENDPOINT);
  endpoint.searchParams.set("site", input.baiduSite || new URL(input.siteUrl).host);
  endpoint.searchParams.set("token", token);

  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: { "content-type": "text/plain; charset=utf-8" },
    body: urls.join("\n"),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Baidu submission failed with HTTP ${response.status}`);
  }

  return {
    mode: "submitted",
    status: response.status,
    urlCount: urls.length,
    accepted: Number(body.success ?? 0),
    remainingQuota: Number(body.remain ?? 0),
    rejected: [...(body.not_same_site ?? []), ...(body.not_valid ?? [])],
  };
}

export async function runSearchUpdate(input, options = {}) {
  const urls = canonicalUrls(input);
  const selectedEngines = new Set(
    options.engines ?? ["google", "bing", "baidu", "sogou"]
  );
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const sitemapUrl = new URL(input.sitemapUrl);
  if (sitemapUrl.origin !== new URL(input.siteUrl).origin) {
    throw new Error("sitemapUrl must use the canonical site origin");
  }

  const sitemapResponse = await fetchImpl(sitemapUrl);
  if (!sitemapResponse.ok) {
    throw new Error(`Live sitemap verification failed with HTTP ${sitemapResponse.status}`);
  }
  const sitemapXml = await sitemapResponse.text();
  const missingUrls = urls.filter((url) => !sitemapXml.includes(`<loc>${url}</loc>`));
  if (missingUrls.length > 0) {
    throw new Error(`Changed URL is not present in the live sitemap: ${missingUrls[0]}`);
  }

  for (const url of urls) {
    const response = await fetchImpl(url, { redirect: "manual" });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.toLowerCase().includes("text/html")) {
      throw new Error(`Changed URL is not a live HTML page: ${url}`);
    }
  }

  const google = selectedEngines.has("google")
    ? {
        mode: "sitemap-discovery",
        status: "ready",
        note: "Google will recrawl the registered sitemap; general pages are not eligible for the Google Indexing API.",
      }
    : { mode: "skipped", status: "not-requested" };
  const bing = selectedEngines.has("bing")
    ? await runIndexNowNotification(
        { siteUrl: input.siteUrl, key: input.indexNowKey, urls },
        {
          submit: options.submit,
          allowExternalSubmission: options.allowIndexNowSubmission,
          fetchImpl,
        }
      ).catch((error) => ({
        mode: "failed",
        error: error instanceof Error ? error.message : "IndexNow submission failed",
      }))
    : { mode: "skipped", status: "not-requested" };
  const baidu = selectedEngines.has("baidu")
    ? await runBaiduSubmission(
        {
          siteUrl: input.siteUrl,
          baiduSite: input.baiduSite,
          token: input.baiduToken,
          urls,
        },
        {
          submit: options.submit,
          allowExternalSubmission: options.allowBaiduSubmission,
          fetchImpl,
        }
      ).catch((error) => ({
        mode: "failed",
        error: error instanceof Error ? error.message : "Baidu submission failed",
      }))
    : { mode: "skipped", status: "not-requested" };
  const sogou = selectedEngines.has("sogou")
    ? {
        mode: "manual-url-submission",
        status: "pending",
        urls,
        note: "Sogou has no public URL-submission API for this workflow; submit these page URLs in its resource platform.",
      }
    : { mode: "skipped", status: "not-requested" };
  const hasProviderFailure = bing.mode === "failed" || baidu.mode === "failed";

  return {
    generatedAt: (options.now?.() ?? new Date()).toISOString(),
    siteUrl: new URL(input.siteUrl).origin,
    sitemap: {
      url: sitemapUrl.href,
      status: "verified",
      changedUrlCount: urls.length,
    },
    urls,
    google,
    bing,
    baidu,
    sogou,
    indexingStatus: options.submit
      ? hasProviderFailure
        ? "partial-submission-unverified"
        : "submitted-unverified"
      : "ready-not-submitted",
  };
}
