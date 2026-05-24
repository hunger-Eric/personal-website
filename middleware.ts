// middleware.ts — Gate admin panel behind ENABLE_ADMIN env var
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminEnabled } from "@/lib/admin-guard";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /admin/* and /api/admin/*
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin")
  ) {
    if (!isAdminEnabled()) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
