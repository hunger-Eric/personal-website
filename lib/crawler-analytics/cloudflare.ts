import {
  CrawlerAnalyticsError,
  type CloudflareRequestGroup,
  type CloudflareWindowResult,
} from "./types";

const GROUP_LIMIT = 5000;
const GRAPHQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";
const QUERY = `
  query CrawlerTraffic($zoneTag: string, $baseFilter: filter, $crawlerFilter: filter) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        total: httpRequestsAdaptiveGroups(limit: 1, filter: $baseFilter, orderBy: [count_DESC]) { count avg { sampleInterval } }
        byAgent: httpRequestsAdaptiveGroups(limit: 5000, filter: $crawlerFilter, orderBy: [count_DESC]) { count avg { sampleInterval } dimensions { userAgent } }
        byTrend: httpRequestsAdaptiveGroups(limit: 5000, filter: $crawlerFilter, orderBy: [count_DESC]) { count avg { sampleInterval } dimensions { datetimeHour userAgent } }
        byPath: httpRequestsAdaptiveGroups(limit: 5000, filter: $crawlerFilter, orderBy: [count_DESC]) { count avg { sampleInterval } dimensions { clientRequestPath userAgent } }
        byStatus: httpRequestsAdaptiveGroups(limit: 5000, filter: $crawlerFilter, orderBy: [count_DESC]) { count avg { sampleInterval } dimensions { edgeResponseStatus userAgent } }
      }
    }
  }
`;

type QueryInput = {
  token: string;
  zoneId: string;
  hostname: string;
  start: string;
  end: string;
  patterns: readonly string[];
  fetchImpl?: typeof fetch;
};

function httpError(status: number): CrawlerAnalyticsError {
  if (status === 401) return new CrawlerAnalyticsError("cloudflare_auth_invalid", "Cloudflare authentication failed", 502);
  if (status === 403) return new CrawlerAnalyticsError("cloudflare_permission_denied", "Cloudflare permission denied", 502);
  if (status === 429) return new CrawlerAnalyticsError("cloudflare_rate_limited", "Cloudflare rate limited", 503);
  return new CrawlerAnalyticsError("cloudflare_unavailable", "Cloudflare analytics unavailable", 502);
}

function invalidResponse(): never {
  throw new CrawlerAnalyticsError("cloudflare_unavailable", "Cloudflare analytics returned an invalid response", 502);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  return invalidResponse();
}

function nullableInteger(value: unknown): number | null | undefined {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (typeof value === "number" && Number.isFinite(value) && Number.isInteger(value)) return value;
  return invalidResponse();
}

function nullableSampleInterval(value: unknown): number | null | undefined {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1) return value;
  return invalidResponse();
}

function group(value: unknown): CloudflareRequestGroup {
  if (!isRecord(value) || typeof value.count !== "number" || !Number.isFinite(value.count) || value.count < 0) {
    return invalidResponse();
  }
  const rawAvg = value.avg;
  let avg: CloudflareRequestGroup["avg"];
  if (rawAvg === null || rawAvg === undefined) avg = rawAvg;
  else {
    if (!isRecord(rawAvg)) return invalidResponse();
    avg = { sampleInterval: nullableSampleInterval(rawAvg.sampleInterval) };
  }
  const rawDimensions = value.dimensions;
  let dimensions: CloudflareRequestGroup["dimensions"];
  if (rawDimensions === null || rawDimensions === undefined) dimensions = rawDimensions;
  else {
    if (!isRecord(rawDimensions)) return invalidResponse();
    dimensions = {
      datetimeHour: nullableString(rawDimensions.datetimeHour),
      userAgent: nullableString(rawDimensions.userAgent),
      clientRequestPath: nullableString(rawDimensions.clientRequestPath),
      edgeResponseStatus: nullableInteger(rawDimensions.edgeResponseStatus),
    };
  }
  return { count: value.count, avg, dimensions };
}

function groups(value: unknown): CloudflareRequestGroup[] {
  if (!Array.isArray(value)) {
    return invalidResponse();
  }
  return value.map(group);
}

function graphQlError(errors: Array<{ message?: string }>): CrawlerAnalyticsError {
  const messages = errors.map((error) => error.message ?? "").join(" ");
  const code = /cannot query field|unknown argument|unknown type|not supported/i.test(messages)
    ? "unsupported_dataset"
    : "cloudflare_unavailable";
  return new CrawlerAnalyticsError(code, "Cloudflare analytics query failed", 502);
}

type GraphQlEnvelope = { data?: unknown; errors?: Array<{ message?: string }> };

function envelope(value: unknown): GraphQlEnvelope {
  if (!isRecord(value)) return invalidResponse();
  const rawErrors = value.errors;
  if (rawErrors === null || rawErrors === undefined) return { data: value.data };
  if (!Array.isArray(rawErrors)) return invalidResponse();
  const errors = rawErrors.map((error) => {
    if (!isRecord(error)) return invalidResponse();
    const message = error.message;
    if (message === undefined) return {};
    if (typeof message !== "string") return invalidResponse();
    return { message };
  });
  return { data: value.data, errors };
}

export async function queryCloudflareWindow(input: QueryInput): Promise<CloudflareWindowResult> {
  const baseFilter = {
    datetime_geq: input.start,
    datetime_lt: input.end,
    clientRequestHTTPHost: input.hostname,
    requestSource: "eyeball",
  };
  const crawlerFilter = {
    ...baseFilter,
    OR: input.patterns.map((pattern) => ({ userAgent_like: `%${pattern}%` })),
  };

  let response: Response;
  try {
    response = await (input.fetchImpl ?? fetch)(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${input.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { zoneTag: input.zoneId, baseFilter, crawlerFilter } }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new CrawlerAnalyticsError("cloudflare_unavailable", "Cloudflare analytics unavailable", 502);
  }
  if (!response.ok && (response.status === 401 || response.status === 403 || response.status === 429)) {
    throw httpError(response.status);
  }

  let body: GraphQlEnvelope;
  try {
    body = envelope(await response.json());
  } catch {
    throw new CrawlerAnalyticsError("cloudflare_unavailable", "Cloudflare analytics returned an invalid response", 502);
  }
  if (body.errors?.length) throw graphQlError(body.errors);
  if (!response.ok) throw httpError(response.status);

  const viewer = isRecord(body.data) ? body.data.viewer : undefined;
  const zones = isRecord(viewer) ? viewer.zones : undefined;
  const zone = Array.isArray(zones) ? zones[0] : undefined;
  if (!isRecord(zone)) throw new CrawlerAnalyticsError("cloudflare_unavailable", "Cloudflare zone analytics unavailable", 502);
  const result = {
    total: groups(zone.total), byAgent: groups(zone.byAgent), byTrend: groups(zone.byTrend),
    byPath: groups(zone.byPath), byStatus: groups(zone.byStatus),
  };
  if (Object.values(result).some((value) => value.length === GROUP_LIMIT)) {
    throw new CrawlerAnalyticsError("result_truncated", "Cloudflare analytics result was truncated", 502);
  }
  return result;
}
