import { crawlerAnalyticsWorkerSchema } from "./worker-schema";
import {
  CRAWLER_RANGES,
  CrawlerAnalyticsError,
  type CrawlerAnalyticsResponse,
  type CrawlerRange,
} from "./types";

type ServiceDependencies = {
  now?: Date;
  env?: { readSecret: string };
  fetch?: typeof globalThis.fetch;
};

export function parseCrawlerRange(value: string | null | undefined): CrawlerRange {
  if (value == null) return "24h";
  if ((CRAWLER_RANGES as readonly string[]).includes(value)) return value as CrawlerRange;
  throw new CrawlerAnalyticsError("invalid_range", "Unsupported crawler analytics range", 400);
}

function resolveSecret(overrides?: ServiceDependencies["env"]) {
  const readSecret = overrides?.readSecret ?? process.env.CRAWLER_OBSERVER_READ_SECRET ?? "";
  if (!readSecret) {
    throw new CrawlerAnalyticsError("configuration_missing", "Crawler observer read access is not configured", 503);
  }
  return readSecret;
}

function observerUrl() {
  return new URL("https://crawler-observer.itheheda.online/_crawler-observer/v1/analytics");
}

type ObserverReadFailureStage = "fetch" | "http_status" | "invalid_json" | "invalid_schema";

function safeDiagnosticIdentifier(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const sanitized = value.replace(/[^A-Za-z0-9_.:-]/g, "").slice(0, 80);
  return sanitized || fallback;
}

function logObserverReadFailure(stage: ObserverReadFailureStage, details: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ event: "crawler_observer_read_failed", stage, ...details }));
}

function fetchFailureDetails(error: unknown) {
  const errorName = safeDiagnosticIdentifier(
    error instanceof Error ? error.name : undefined,
    "UnknownError"
  );
  const cause = error instanceof Error && error.cause && typeof error.cause === "object"
    ? error.cause as { code?: unknown }
    : undefined;
  const causeCode = cause?.code === undefined
    ? undefined
    : safeDiagnosticIdentifier(cause.code, "UnknownCode");
  return causeCode === undefined ? { errorName } : { errorName, causeCode };
}

async function sign(secret: string, canonical: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(canonical)));
  let binary = "";
  signature.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function getCrawlerAnalytics(
  range: CrawlerRange,
  dependencies: ServiceDependencies = {}
): Promise<CrawlerAnalyticsResponse> {
  const parsedRange = parseCrawlerRange(range);
  const secret = resolveSecret(dependencies.env);
  const url = observerUrl();
  url.searchParams.set("range", parsedRange);
  const timestamp = String(Math.floor((dependencies.now ?? new Date()).getTime() / 1000));
  const host = url.hostname.toLowerCase();
  const canonical = `v1\nread\n${timestamp}\nGET\n${host}\n${url.pathname}\nrange=${parsedRange}`;

  let response: Response;
  try {
    response = await (dependencies.fetch ?? globalThis.fetch)(url, {
      method: "GET",
      headers: {
        "X-Observer-Timestamp": timestamp,
        "X-Observer-Signature": await sign(secret, canonical),
      },
      cache: "no-store",
    });
  } catch (error) {
    logObserverReadFailure("fetch", fetchFailureDetails(error));
    throw new CrawlerAnalyticsError("observer_unavailable", "Crawler observer is unavailable", 502);
  }
  if (response.status === 401) {
    logObserverReadFailure("http_status", { status: response.status });
    throw new CrawlerAnalyticsError("observer_auth_invalid", "Crawler observer authentication failed", 502);
  }
  if (!response.ok) {
    logObserverReadFailure("http_status", { status: response.status });
    throw new CrawlerAnalyticsError("observer_unavailable", "Crawler observer is unavailable", 502);
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    logObserverReadFailure("invalid_json");
    throw new CrawlerAnalyticsError("observer_unavailable", "Crawler observer returned an invalid response", 502);
  }
  const parsed = crawlerAnalyticsWorkerSchema.safeParse(body);
  if (!parsed.success || parsed.data.meta.range !== parsedRange) {
    logObserverReadFailure("invalid_schema");
    throw new CrawlerAnalyticsError("observer_unavailable", "Crawler observer returned an invalid response", 502);
  }
  return parsed.data;
}
