// lib/admin-guard.ts
// Shared admin access guard — used by proxy, API routes, and admin layout.
// Defense-in-depth: even if proxy doesn't run, the routes themselves check.
//
// Authentication flow:
// 1. User visits /admin?token=xxx -> proxy validates, sets cookie, redirects
// 2. Subsequent requests carry the cookie -> proxy validates it
// 3. API routes + layout also double-check the token independently

import { NextRequest, NextResponse } from "next/server";

/** Master switch: admin is only available in local development.
 *  On Vercel (VERCEL=1), admin is completely disabled — all routes
 *  return 404 regardless of env vars.  This prevents the admin panel
 *  and API from being exposed on the public internet.
 */
export function isAdminEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.ENABLE_ADMIN === "true";
}

/** Verify a token string against the ADMIN_TOKEN env var */
export function verifyAdminToken(token: string | null): boolean {
  if (!token) return false;
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  return token === expected;
}

/** Parse a cookie value from a raw Cookie header string */
function parseCookieHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key?.trim() === name) return rest.join("=").trim();
  }
  return null;
}

/**
 * Extract admin token from request: ?token= param, x-admin-token header, or cookie.
 * Order matters: query param takes priority (for first-time auth), then header,
 * then cookie (for subsequent requests).
 */
export function extractAdminToken(request: NextRequest): string | null {
  // 1. Query param — first-time auth entry point
  const queryToken = request.nextUrl.searchParams.get("token");
  if (queryToken) return queryToken;

  // 2. Header — for programmatic API calls
  const headerToken = request.headers.get("x-admin-token");
  if (headerToken) return headerToken;

  // 3. Cookie — established session (try both NextRequest.cookies API and raw header parse)
  const cookieToken =
    request.cookies.get("admin_token")?.value ??
    parseCookieHeader(request.headers.get("cookie"), "admin_token");
  if (cookieToken) return cookieToken;

  return null;
}

/**
 * Guard for API routes. Returns a 404 Response if access denied, null if allowed.
 * Pass `request` to also enforce token-auth; omit for env-var-only check.
 */
export function adminGuard(request?: NextRequest): Response | null {
  if (!isAdminEnabled()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  if (request) {
    const token = extractAdminToken(request);
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
  }

  return null;
}
