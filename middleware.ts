// middleware.ts — Admin authentication gate
//
// Two auth paths:
//   1. Login page:  /admin → redirect to /admin/login → enter password → cookie set → enter
//   2. Token param: /admin?token=xxx → validate → cookie set → redirect clean
//
// Cookie: HttpOnly, Secure, SameSite=Strict, 7-day expiry
// Token also accepted via x-admin-token header for programmatic calls.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isAdminEnabled,
  verifyAdminToken,
  extractAdminToken,
} from "@/lib/admin-guard";

/** Paths that should be accessible without auth (login page + its API) */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /admin/* and /api/admin/*
  if (
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api/admin")
  ) {
    return NextResponse.next();
  }

  // Master switch
  if (!isAdminEnabled()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Public paths — always pass through (login page must be reachable)
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // For page routes under /admin (but not login) — if no auth, redirect to login
  if (pathname.startsWith("/admin")) {
    const token = extractAdminToken(request);

    if (!verifyAdminToken(token)) {
      const loginUrl = new URL("/admin/login", request.url);
      // Preserve original path so login page can redirect back
      if (pathname !== "/admin" && pathname !== "/admin/login") {
        loginUrl.searchParams.set("redirect", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    // Token valid via query param — set cookie and redirect clean
    if (request.nextUrl.searchParams.has("token")) {
      const response = NextResponse.redirect(new URL(pathname, request.url));
      response.cookies.set("admin_token", token!, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    return NextResponse.next();
  }

  // For API routes under /api/admin (not login) — return 404 if no auth
  if (pathname.startsWith("/api/admin")) {
    const token = extractAdminToken(request);
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
