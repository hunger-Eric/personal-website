// app/api/views/[slug]/route.ts
// Per-article view counter backed by Cloudflare KV (binding: ARTICLE_VIEWS).
//
// GET  /api/views/<slug>  → returns { views: number }
// POST /api/views/<slug>  → increments + returns { views: number }, with cookie
//                           dedupe so a single visitor only counts once / 24h.
//
// Hardening:
// - Slug must match the static set of published article slugs (defense
//   against arbitrary KV writes).
// - Honors DNT and Sec-GPC: returns count but does NOT increment.
// - Filters obvious bots/crawlers by user-agent before incrementing.
import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getArticleSlugs } from "@/lib/mdx/mdx";

export const runtime = "nodejs";
// Force-cache the slug list at build time. The MDX files are bundled into the
// worker (no runtime fs access), so we read them once at module init and reuse.
let SLUGS_CACHE: Set<string> | null = null;

const COOKIE_PREFIX = "vw_";
const COOKIE_MAX_AGE_S = 60 * 60 * 24; // 24h

const BOT_REGEX =
  /(bot|crawl|slurp|spider|preview|fetch|httpclient|curl|wget|python-requests|axios|node-fetch|undici|headless|lighthouse|pingdom|prerender|baiduspider)/i;

// Minimal subset of the Cloudflare KV interface we actually use, so we don't
// need to depend on @cloudflare/workers-types just for this file.
type ViewsKv = {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
};

// Best-effort per-IP throttle. The cookie dedupe is the primary defense; this
// belt-and-suspenders limit guards against cookie-clearers and casual scripts.
// 60s TTL keeps KV usage tiny.
const IP_RATE_LIMIT_TTL_S = 60;

function getClientIp(req: NextRequest): string | null {
  // CF-Connecting-IP is set by Cloudflare on every Worker request.
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return null;
}

async function isIpThrottled(
  kv: ViewsKv | null,
  ip: string | null,
  slug: string
): Promise<boolean> {
  if (!kv || !ip) return false;
  const key = `rl:${ip}:${slug}`;
  const seen = await kv.get(key);
  if (seen) return true;
  // Note: KV writes are eventually consistent, so two near-simultaneous
  // requests can both pass this check. Combined with the cookie dedupe and
  // bot filter that's acceptable for a personal blog view counter.
  await kv.put(key, "1", { expirationTtl: IP_RATE_LIMIT_TTL_S });
  return false;
}

function getKv(): ViewsKv | null {
  try {
    const env = getCloudflareContext().env as Record<string, unknown>;
    return (env.ARTICLE_VIEWS as ViewsKv) ?? null;
  } catch {
    // Local dev without bindings — return null and degrade gracefully.
    return null;
  }
}

async function getSlugsCached(): Promise<Set<string>> {
  if (SLUGS_CACHE) return SLUGS_CACHE;
  try {
    const slugs = await getArticleSlugs();
    SLUGS_CACHE = new Set(slugs);
  } catch {
    // fs unavailable at runtime on the edge — fall back to permissive mode
    SLUGS_CACHE = new Set();
  }
  return SLUGS_CACHE;
}

async function isAllowedSlug(slug: string): Promise<boolean> {
  if (!/^[a-z0-9][a-z0-9-]{0,80}$/i.test(slug)) return false;
  const slugs = await getSlugsCached();
  // If we couldn't read the slug manifest at all (edge runtime without fs),
  // accept the slug as long as the regex passed — KV writes are still bounded
  // by the strict regex + cookie dedupe + bot filtering.
  if (slugs.size === 0) return true;
  return slugs.has(slug);
}

function honorsTracking(req: NextRequest): boolean {
  if (req.headers.get("DNT") === "1") return false;
  if (req.headers.get("Sec-GPC") === "1") return false;
  const ua = req.headers.get("user-agent") || "";
  if (BOT_REGEX.test(ua)) return false;
  return true;
}

async function readViews(kv: ViewsKv | null, slug: string): Promise<number> {
  if (!kv) return 0;
  const raw = await kv.get(`views:${slug}`);
  const n = raw == null ? 0 : Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

async function writeViews(
  kv: ViewsKv | null,
  slug: string,
  next: number
): Promise<void> {
  if (!kv) return;
  await kv.put(`views:${slug}`, String(next));
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  if (!(await isAllowedSlug(slug))) {
    return NextResponse.json({ views: 0 }, { status: 200 });
  }
  const kv = getKv();
  const views = await readViews(kv, slug);
  return NextResponse.json(
    { views },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  if (!(await isAllowedSlug(slug))) {
    return NextResponse.json({ views: 0 }, { status: 200 });
  }
  const kv = getKv();
  const cookieName = `${COOKIE_PREFIX}${slug}`;
  const alreadyCounted = req.cookies.get(cookieName)?.value === "1";

  let views = await readViews(kv, slug);

  if (!alreadyCounted && honorsTracking(req)) {
    const throttled = await isIpThrottled(kv, getClientIp(req), slug);
    if (!throttled) {
      views += 1;
      await writeViews(kv, slug, views);
    }
  }

  const res = NextResponse.json(
    { views },
    { headers: { "Cache-Control": "no-store" } }
  );
  // Always (re)set the cookie so a fast-clicker doesn't double-count even when
  // we already had it; refreshes the 24h window.
  res.cookies.set(cookieName, "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    maxAge: COOKIE_MAX_AGE_S,
    path: "/",
  });
  return res;
}
