// app/api/github-contributions/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  fetchGitHubContributionsForYear,
  type GitHubContributionDay,
} from "@/lib/github/contributions";

type ApiResponse = {
  username: string;
  year: number;
  days: GitHubContributionDay[];
  warning?: string;
  code?: string;
};

type ApiErrorResponse = {
  error: string;
  code?: string;
};

// Simple in-memory cache for this server instance
type CacheEntry = {
  expiresAt: number; // timestamp in ms
  payload: ApiResponse;
};

// username:year -> CacheEntry
const memoryCache = new Map<string, CacheEntry>();

// Cache TTL: 1 hour for contributions (they don't change that frequently)
const TTL_MS = 60 * 60 * 1000; // 1 hour

// Max cache size to prevent memory issues
const MAX_CACHE_SIZE = 100;

/**
 * Clean up expired cache entries
 */
function cleanupCache(): void {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }

  // If still too large, remove oldest entries
  if (memoryCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(memoryCache.entries()).sort(
      (a, b) => a[1].expiresAt - b[1].expiresAt
    );
    const toRemove = entries.slice(0, memoryCache.size - MAX_CACHE_SIZE);
    for (const [key] of toRemove) {
      memoryCache.delete(key);
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const usernameParam = searchParams.get("username");
    const yearParam = searchParams.get("year");

    const username = usernameParam || process.env.GITHUB_USERNAME || undefined;
    if (!username) {
      const errorResponse: ApiErrorResponse = {
        error: "Missing username parameter",
        code: "MISSING_USERNAME",
      };
      return NextResponse.json(errorResponse, {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    // Validate username format (alphanumeric, hyphens, max 39 chars)
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) {
      const errorResponse: ApiErrorResponse = {
        error: "Invalid username format",
        code: "INVALID_USERNAME",
      };
      return NextResponse.json(errorResponse, {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    const nowDate = new Date();
    const currentYear = nowDate.getUTCFullYear();
    const year = yearParam ? Number(yearParam) : currentYear;

    // Validate year
    if (!Number.isFinite(year) || year < 2008 || year > currentYear + 1) {
      const errorResponse: ApiErrorResponse = {
        error: `Invalid year. Must be between 2008 and ${currentYear + 1}`,
        code: "INVALID_YEAR",
      };
      return NextResponse.json(errorResponse, {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    // ----- In-memory cache lookup -----
    const cacheKey = `${username.toLowerCase()}:${year}`;
    const nowMs = Date.now();
    const cached = memoryCache.get(cacheKey);

    if (cached && cached.expiresAt > nowMs) {
      // Serve from in-memory cache
      return NextResponse.json(cached.payload, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          "X-Cache": "HIT",
        },
      });
    }

    // ----- Cache miss → fetch from GitHub -----
    let days: GitHubContributionDay[];
    try {
      days = await fetchGitHubContributionsForYear(username, year);
    } catch (fetchError: unknown) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Unknown error";

      if (message.includes("GITHUB_TOKEN")) {
        const fallbackPayload: ApiResponse = {
          username,
          year,
          days: [],
          warning: "GitHub contribution data is unavailable in this environment.",
          code: "MISSING_TOKEN",
        };

        return NextResponse.json(fallbackPayload, {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
            "X-Data-Status": "FALLBACK",
          },
        });
      }

      throw fetchError;
    }

    const payload: ApiResponse = { username, year, days };

    // Cleanup and store in in-memory cache
    cleanupCache();
    memoryCache.set(cacheKey, {
      expiresAt: nowMs + TTL_MS,
      payload,
    });

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        // Cache at the edge for 1 hour, allow stale for a day
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "X-Cache": "MISS",
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("github-contributions API error:", errorMessage);

    // Determine appropriate error response
    let status = 500;
    let code = "INTERNAL_ERROR";

    if (errorMessage.includes("GITHUB_TOKEN")) {
      status = 500;
      code = "MISSING_TOKEN";
    } else if (errorMessage.includes("404")) {
      status = 404;
      code = "USER_NOT_FOUND";
    } else if (errorMessage.includes("403") || errorMessage.includes("rate")) {
      status = 429;
      code = "RATE_LIMITED";
    } else if (errorMessage.includes("timeout")) {
      status = 504;
      code = "TIMEOUT";
    }

    const errorResponse: ApiErrorResponse = {
      error:
        status === 500
          ? "Failed to fetch contributions"
          : errorMessage.split(" - ")[0],
      code,
    };

    return NextResponse.json(errorResponse, {
      status,
      headers: {
        // Don't cache errors for long
        "Cache-Control": "no-store",
      },
    });
  }
}
