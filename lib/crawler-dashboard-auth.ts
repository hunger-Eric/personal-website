import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const USERNAME = "admin";
const PAGE_PREFIX = "/admin/crawlers";
const API_PREFIX = "/api/admin/crawlers";
const CHALLENGE = 'Basic realm="Crawler analytics", charset="UTF-8"';

function matchesBoundary(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function safeEqual(left: string, right: string): boolean {
  return timingSafeEqual(digest(left), digest(right));
}

export function isCrawlerDashboardPath(pathname: string): boolean {
  return matchesBoundary(pathname, PAGE_PREFIX) || matchesBoundary(pathname, API_PREFIX);
}

export function verifyCrawlerDashboardRequest(request: NextRequest): boolean {
  const expectedPassword = process.env.CRAWLER_DASHBOARD_PASSWORD;
  const authorization = request.headers.get("authorization");
  if (!expectedPassword || !authorization?.startsWith("Basic ")) return false;

  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;
    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    return safeEqual(username, USERNAME) && safeEqual(password, expectedPassword);
  } catch {
    return false;
  }
}

export function crawlerAuthChallenge(kind: "page" | "api" = "page"): NextResponse {
  const response = kind === "api"
    ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    : new NextResponse("Unauthorized", { status: 401 });
  response.headers.set("WWW-Authenticate", CHALLENGE);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
