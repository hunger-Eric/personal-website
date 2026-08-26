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
  parseCrawlerSite,
} from "@/lib/crawler-analytics/service";

export const dynamic = "force-dynamic";

const STATUS_BY_CODE: Record<CrawlerAnalyticsErrorCode, number> = {
  invalid_range: 400,
  invalid_site: 400,
  configuration_missing: 503,
  observer_auth_invalid: 502,
  observer_unavailable: 502,
};

const MESSAGE_BY_CODE: Record<CrawlerAnalyticsErrorCode, string> = {
  invalid_range: "Unsupported crawler analytics range",
  invalid_site: "Unsupported crawler analytics site",
  configuration_missing: "Crawler observer is not configured",
  observer_auth_invalid: "Crawler observer is unavailable",
  observer_unavailable: "Crawler observer is unavailable",
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

function parseRequestedSite(request: NextRequest) {
  const sites = request.nextUrl.searchParams.getAll("site");
  if (sites.length > 1) {
    throw new CrawlerAnalyticsError("invalid_site", "Unsupported crawler analytics site", 400);
  }
  return parseCrawlerSite(sites[0]);
}

export async function GET(request: NextRequest) {
  if (!await verifyCrawlerDashboardRequest(request)) {
    return crawlerAuthChallenge("api");
  }

  try {
    const site = parseRequestedSite(request);
    const range = parseRequestedRange(request);
    const data = await getCrawlerAnalytics(site, range);
    return NextResponse.json(data, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const code = error instanceof CrawlerAnalyticsError
      ? error.code
      : "observer_unavailable";
    return NextResponse.json(
      { error: { code, message: MESSAGE_BY_CODE[code] } },
      { status: STATUS_BY_CODE[code], headers: NO_STORE_HEADERS }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  if (!await verifyCrawlerDashboardRequest(request)) {
    return crawlerAuthChallenge("api");
  }
  return new NextResponse(null, {
    status: 204,
    headers: { ...NO_STORE_HEADERS, Allow: ALLOW },
  });
}

async function methodNotAllowed(request: NextRequest) {
  if (!await verifyCrawlerDashboardRequest(request)) {
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
