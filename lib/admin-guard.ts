// lib/admin-guard.ts
// Shared admin access guard — used by middleware, API routes, and admin layout.
// Defense-in-depth: even if middleware doesn't run, the routes themselves check.

import { NextResponse } from "next/server";

export function isAdminEnabled(): boolean {
  return process.env.ENABLE_ADMIN === "true";
}

export function adminGuard(): Response | null {
  if (!isAdminEnabled()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  return null;
}
