import { NextRequest, NextResponse } from "next/server";

const USERNAME = "admin";
const PAGE_PREFIX = "/admin/crawlers";
const API_PREFIX = "/api/admin/crawlers";
const CHALLENGE = 'Basic realm="Crawler analytics", charset="UTF-8"';

function matchesBoundary(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

function decodeBasicCredentials(value: string): string {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return decoder.decode(bytes);
}

async function digest(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function safeEqual(left: string, right: string): Promise<boolean> {
  const [leftDigest, rightDigest] = await Promise.all([digest(left), digest(right)]);
  let difference = 0;
  for (let index = 0; index < leftDigest.length; index += 1) {
    difference |= leftDigest[index] ^ rightDigest[index];
  }
  return difference === 0;
}

export function isCrawlerDashboardPath(pathname: string): boolean {
  return matchesBoundary(pathname, PAGE_PREFIX) || matchesBoundary(pathname, API_PREFIX);
}

export async function verifyCrawlerDashboardRequest(request: NextRequest): Promise<boolean> {
  const expectedPassword = process.env.CRAWLER_DASHBOARD_PASSWORD;
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Basic +(.+)$/i);
  if (!expectedPassword || !match) return false;

  try {
    const decoded = decodeBasicCredentials(match[1]);
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;
    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    const [usernameMatches, passwordMatches] = await Promise.all([
      safeEqual(username, USERNAME),
      safeEqual(password, expectedPassword),
    ]);
    return usernameMatches && passwordMatches;
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
