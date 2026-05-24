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
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ message: "Not found" }] }), { status: 200 })
    );
    await expect(fetchGitHubContributionsForYear("nonexistent", 2025)).rejects.toThrow("Not found");
  });

  it("throws on missing GITHUB_TOKEN", async () => {
    delete process.env.GITHUB_TOKEN;
    await expect(fetchGitHubContributionsForYear("user", 2025)).rejects.toThrow("GITHUB_TOKEN");
  });
});
