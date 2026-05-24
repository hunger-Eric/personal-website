// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchGitHubContributionsForYear } from "@/lib/github/contributions";

const GQL_URL = "https://api.github.com/graphql";

function makeOkResponse(weeks: any[] = []) {
  return new Response(JSON.stringify({
    data: { user: { contributionsCollection: { contributionCalendar: { weeks } } } }
  }), { status: 200, headers: { "Content-Type": "application/json" } });
}

beforeEach(() => {
  vi.restoreAllMocks();
  process.env.GITHUB_TOKEN = "test-token";
});

describe("fetchGitHubContributionsForYear", () => {
  it("returns contributions on success", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      makeOkResponse([{ contributionDays: [{ date: "2025-01-01", contributionCount: 5 }] }])
    );
    const r = await fetchGitHubContributionsForYear("user", 2025);
    expect(r).toHaveLength(1);
    expect(r[0].date).toBe("2025-01-01");
    expect(r[0].count).toBe(5);
  });

  it("returns empty array when no weeks", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(makeOkResponse([]));
    const r = await fetchGitHubContributionsForYear("user", 2025);
    expect(r).toEqual([]);
  });

  it("handles missing contributionCount", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      makeOkResponse([{ contributionDays: [{ date: "2025-01-01" }] }])
    );
    const r = await fetchGitHubContributionsForYear("user", 2025);
    expect(r[0].count).toBe(0);
  });

  it("skips days without date", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      makeOkResponse([{ contributionDays: [{ date: "2025-01-01", contributionCount: 1 }, {}] }])
    );
    const r = await fetchGitHubContributionsForYear("user", 2025);
    expect(r).toHaveLength(1);
  });

  it("retries on rate limit then succeeds", async () => {
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) return new Response("rate limited", { status: 429 });
      return makeOkResponse([{ contributionDays: [{ date: "2025-02-01", contributionCount: 3 }] }]);
    });
    const r = await fetchGitHubContributionsForYear("user", 2025);
    expect(r).toHaveLength(1);
    expect(r[0].date).toBe("2025-02-01");
  }, 30000);

  it("throws after max retries on 5xx", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("Error", { status: 502 }));
    await expect(fetchGitHubContributionsForYear("user", 2025)).rejects.toThrow();
  });

  it("throws on GraphQL errors", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () =>
      new Response(JSON.stringify({ errors: [{ message: "Not found" }] }), { status: 200 })
    );
    await expect(fetchGitHubContributionsForYear("nonexistent", 2025)).rejects.toThrow("Not found");
  });

  it("throws on missing GITHUB_TOKEN", async () => {
    delete process.env.GITHUB_TOKEN;
    await expect(fetchGitHubContributionsForYear("user", 2025)).rejects.toThrow("GITHUB_TOKEN");
  });

  // ----- NEW TESTS for branch coverage -----

  it("retries on AbortError (timeout) then succeeds", async () => {
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        const err = new Error("The operation was aborted");
        err.name = "AbortError";
        throw err;
      }
      return makeOkResponse([{ contributionDays: [{ date: "2025-03-01", contributionCount: 7 }] }]);
    });
    const r = await fetchGitHubContributionsForYear("user", 2025);
    expect(r).toHaveLength(1);
    expect(r[0].date).toBe("2025-03-01");
  }, 30000);

  it("throws after exhausting retries on AbortError", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      const err = new Error("The operation was aborted");
      err.name = "AbortError";
      throw err;
    });
    await expect(fetchGitHubContributionsForYear("user", 2025)).rejects.toThrow(
      "GitHub API request timed out after multiple attempts"
    );
  }, 30000);

  it("re-throws non-retryable errors immediately (e.g. 401)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("Unauthorized", { status: 401 }));
    await expect(fetchGitHubContributionsForYear("user", 2025)).rejects.toThrow("GitHub GraphQL error: 401");
  });

  it("re-throws non-retryable errors immediately (e.g. 403)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("Forbidden", { status: 403 }));
    await expect(fetchGitHubContributionsForYear("user", 2025)).rejects.toThrow("GitHub GraphQL error: 403");
  });

  it("re-throws non-AbortError network errors immediately", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("DNS resolution failed"));
    await expect(fetchGitHubContributionsForYear("user", 2025)).rejects.toThrow("DNS resolution failed");
  });

  it("retries on retryable error then eventually throws when all retries exhausted", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("Rate limited", { status: 429 }));
    await expect(fetchGitHubContributionsForYear("user", 2025)).rejects.toThrow("GitHub GraphQL error: 429");
  }, 30000);

  it("retries on 503 then succeeds", async () => {
    let callCount = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      callCount++;
      if (callCount <= 2) return new Response("Service Unavailable", { status: 503 });
      return makeOkResponse([{ contributionDays: [{ date: "2025-04-01", contributionCount: 2 }] }]);
    });
    const r = await fetchGitHubContributionsForYear("user", 2025);
    expect(r).toHaveLength(1);
    expect(r[0].date).toBe("2025-04-01");
  }, 30000);

  it("handles week with undefined contributionDays", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      makeOkResponse([{ contributionDays: undefined }, { contributionDays: [{ date: "2025-01-02", contributionCount: 3 }] }])
    );
    const r = await fetchGitHubContributionsForYear("user", 2025);
    expect(r).toHaveLength(1);
    expect(r[0].date).toBe("2025-01-02");
  });

  // Line 172: the fallback throw at end of function (when all retries are exhausted
  // and the catch block doesn't throw). This makes the branch at line 172 reachable
  // by letting the loop complete all iterations without an explicit throw.

  it("handles GraphQL errors with multiple error messages", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () =>
      new Response(JSON.stringify({ errors: [{ message: "Error 1" }, { message: "Error 2" }] }), { status: 200 })
    );
    await expect(fetchGitHubContributionsForYear("user", 2025)).rejects.toThrow("Error 1, Error 2");
  });

  it("handles non-ok response with text() failure", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.reject(new Error("Cannot read body")),
    } as any);
    await expect(fetchGitHubContributionsForYear("user", 2025)).rejects.toThrow("GitHub GraphQL error: 403 - Unknown error");
  });

  it("handles missing data path gracefully", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { user: null } }), { status: 200 })
    );
    const r = await fetchGitHubContributionsForYear("user", 2025);
    expect(r).toEqual([]);
  });
});
