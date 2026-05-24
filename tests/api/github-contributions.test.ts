// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/github/contributions", () => ({
  fetchGitHubContributionsForYear: vi.fn(),
}));

import { fetchGitHubContributionsForYear } from "@/lib/github/contributions";

async function handler(req: NextRequest) {
  const { GET } = await import("@/app/api/github-contributions/route");
  return GET(req);
}

describe("GET /api/github-contributions", () => {
  it("returns contributions for a year", async () => {
    const mockFetch = vi.mocked(fetchGitHubContributionsForYear);
    mockFetch.mockResolvedValue([{ date: "2025-01-01", count: 5 }]);

    const req = new NextRequest(
      new Request("http://localhost/api/github-contributions?username=user&year=2025")
    );
    const res = await handler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.days).toHaveLength(1);
    expect(body.username).toBe("user");
  });

  it("returns 400 when username is missing", async () => {
    const req = new NextRequest(
      new Request("http://localhost/api/github-contributions?year=2025")
    );
    const res = await handler(req);
    expect(res.status).toBe(400);
  });

  it("uses current year when year is missing", async () => {
    const mockFetch = vi.mocked(fetchGitHubContributionsForYear);
    mockFetch.mockResolvedValue([]);
    const req = new NextRequest(
      new Request("http://localhost/api/github-contributions?username=user")
    );
    const res = await handler(req);
    expect(res.status).toBe(200);
  });

  it("uses maxRetries param", async () => {
    const mockFetch = vi.mocked(fetchGitHubContributionsForYear);
    mockFetch.mockResolvedValue([]);
    const req = new NextRequest(
      new Request("http://localhost/api/github-contributions?username=user&maxRetries=5")
    );
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});
