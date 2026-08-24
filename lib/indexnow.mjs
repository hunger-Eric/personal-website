export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_KEY_PATH = "/indexnow-key.txt";

const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const EXACT_PUBLIC_PATHS = new Set([
  "/",
  "/services",
  "/projects",
  "/articles",
  "/about",
  "/contact",
  "/en",
  "/en/services",
  "/en/projects",
  "/en/articles",
  "/en/about",
  "/en/contact",
]);
const DETAIL_PUBLIC_PATH = /^\/(?:en\/)?(?:projects|articles)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeIndexNowKey(value) {
  const key = typeof value === "string" ? value.trim() : "";
  return KEY_PATTERN.test(key) ? key : null;
}

function canonicalSiteUrl(value) {
  const site = new URL(value);
  if (site.protocol !== "https:" || site.username || site.password) {
    throw new Error("siteUrl must be a credential-free HTTPS origin");
  }
  if (site.pathname !== "/" || site.search || site.hash) {
    throw new Error("siteUrl must contain only the canonical origin");
  }
  return site;
}

function canonicalPublicUrl(value, site) {
  const url = new URL(value);
  const allowedPath =
    EXACT_PUBLIC_PATHS.has(url.pathname) || DETAIL_PUBLIC_PATH.test(url.pathname);
  if (
    url.origin !== site.origin ||
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !allowedPath
  ) {
    throw new Error(`URL is not an allowed public canonical URL: ${value}`);
  }
  return url.href;
}

export function buildIndexNowPayload({ siteUrl, key, urls }) {
  const normalizedKey = normalizeIndexNowKey(key);
  if (!normalizedKey) throw new Error("INDEXNOW_KEY must be 8-128 letters, digits, or hyphens");
  if (!Array.isArray(urls) || urls.length === 0 || urls.length > 10_000) {
    throw new Error("IndexNow requires between 1 and 10000 URLs");
  }

  const site = canonicalSiteUrl(siteUrl);
  const urlList = [...new Set(urls.map((url) => canonicalPublicUrl(url, site)))];
  return {
    host: site.host,
    key: normalizedKey,
    keyLocation: new URL(INDEXNOW_KEY_PATH, site).href,
    urlList,
  };
}

export async function runIndexNowNotification(input, options = {}) {
  const payload = buildIndexNowPayload(input);
  if (!options.submit) return { mode: "dry-run", urlCount: payload.urlList.length };
  if (!options.allowExternalSubmission) {
    throw new Error("Real submission requires INDEXNOW_ALLOW_SUBMIT=true");
  }

  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const response = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`IndexNow submission failed with HTTP ${response.status}`);
  return { mode: "submitted", status: response.status, urlCount: payload.urlList.length };
}
