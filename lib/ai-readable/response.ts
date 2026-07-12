import { NextResponse } from "next/server";

const CACHE_CONTROL =
  "public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400";

export function publicJsonResponse(
  body: unknown,
  options: { status?: number; contentLocation?: string } = {}
) {
  const response = NextResponse.json(body, { status: options.status ?? 200 });
  response.headers.set("Cache-Control", CACHE_CONTROL);
  if (options.contentLocation) {
    response.headers.set("Content-Location", options.contentLocation);
  }
  return response;
}
