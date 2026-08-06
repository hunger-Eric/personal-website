import { NextRequest, NextResponse } from "next/server";
import {
  crawlerAuthChallenge,
  verifyCrawlerDashboardRequest,
} from "@/lib/crawler-dashboard-auth";
import {
  CrawlerAnalyticsError,
  type CrawlerAnalyticsErrorCode,
} from "@/lib/crawler-analytics/types";
import {
  getCrawlerAnalytics,
  parseCrawlerRange,
} from "@/lib/crawler-analytics/service";

export const dynamic = "force-dynamic";

const STATUS_BY_CODE: Record<CrawlerAnalyticsErrorCode, number> = {
  invalid_range: 400,
  configuration_missing: 503,
  cloudflare_auth_invalid: 424,
  cloudflare_permission_denied: 424,
  cloudflare_rate_limited: 503,
  cloudflare_unavailable: 424,
  unsupported_dataset: 424,
  result_truncated: 424,
};

const MESSAGE_BY_CODE: Record<CrawlerAnalyticsErrorCode, string> = {
  invalid_range: "Unsupported crawler analytics range",
  configuration_missing: "Crawler analytics is not configured",
  cloudflare_auth_invalid: "Crawler analytics is unavailable",
  cloudflare_permission_denied: "Crawler analytics is unavailable",
  cloudflare_rate_limited: "Crawler analytics is unavailable",
  cloudflare_unavailable: "Crawler analytics is unavailable",
  unsupported_dataset: "Crawler analytics is unavailable",
  result_truncated: "Crawler analytics is unavailable",
};

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };
const ALLOW = "GET, HEAD, OPTIONS";

function parseRequestedRange(request: NextRequest) {
  const ranges = request.nextUrl.searchParams.getAll("range");
  if (ranges.length > 1) {
    throw new CrawlerAnalyticsError(
      "invalid_range",
      "Unsupported crawler analytics range",
      400
    );
  }
  return parseCrawlerRange(ranges[0]);
}

export async function GET(request: NextRequest) {
  if (!verifyCrawlerDashboardRequest(request)) {
    return crawlerAuthChallenge("api");
  }

  try {
    const range = parseRequestedRange(request);
    const data = await getCrawlerAnalytics(range);
    return NextResponse.json(data, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const code = error instanceof CrawlerAnalyticsError
      ? error.code
      : "cloudflare_unavailable";
    return NextResponse.json(
      { error: { code, message: MESSAGE_BY_CODE[code] } },
      { status: STATUS_BY_CODE[code], headers: NO_STORE_HEADERS }
    );
  }
}

export function OPTIONS(request: NextRequest) {
  if (!verifyCrawlerDashboardRequest(request)) {
    return crawlerAuthChallenge("api");
  }
  return new NextResponse(null, {
    status: 204,
    headers: { ...NO_STORE_HEADERS, Allow: ALLOW },
  });
}

function methodNotAllowed(request: NextRequest) {
  if (!verifyCrawlerDashboardRequest(request)) {
    return crawlerAuthChallenge("api");
  }
  return NextResponse.json(
    { error: { code: "method_not_allowed", message: "Method not allowed" } },
    { status: 405, headers: { ...NO_STORE_HEADERS, Allow: ALLOW } }
  );
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
