import { describe, expect, it, vi } from "vitest";
import { queryCloudflareWindow } from "@/lib/crawler-analytics/cloudflare";

const input = {
  token: "token",
  zoneId: "zone",
  hostname: "me.itheheda.online",
  start: "2026-08-05T00:00:00.000Z",
  end: "2026-08-06T00:00:00.000Z",
  patterns: ["gptbot", "opengeoconsolebot/"],
};

describe("Cloudflare crawler query", () => {
  it("sends only fixed zone, hostname, time and automation filters", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      Response.json({
        data: { viewer: { zones: [{ total: [{ count: 12 }], byAgent: [], byTrend: [], byPath: [], byStatus: [] }] } },
      })
    );
    await queryCloudflareWindow({ ...input, fetchImpl });
    const [, init] = fetchImpl.mock.calls[0];
    const body = JSON.parse(String(init.body));
    expect(body.variables.zoneTag).toBe("zone");
    expect(body.variables.baseFilter).toMatchObject({
      clientRequestHTTPHost: "me.itheheda.online",
      requestSource: "eyeball",
    });
    expect(body.variables.crawlerFilter.OR).toEqual([
      { userAgent_like: "%gptbot%" },
      { userAgent_like: "%opengeoconsolebot/%" },
    ]);
    expect(init.headers.Authorization).toBe("Bearer token");
    expect(init.cache).toBe("no-store");
  });

  it.each([
    [401, "cloudflare_auth_invalid"],
    [403, "cloudflare_permission_denied"],
    [429, "cloudflare_rate_limited"],
    [500, "cloudflare_unavailable"],
  ])("maps HTTP %s to %s", async (status, code) => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status }));
    await expect(queryCloudflareWindow({ ...input, fetchImpl })).rejects.toMatchObject({ code });
  });

  it("maps a schema error in a non-2xx GraphQL response to unsupported_dataset", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      Response.json({ errors: [{ message: "Unknown argument crawlerFilter" }] }, { status: 500 })
    );
    await expect(queryCloudflareWindow({ ...input, fetchImpl })).rejects.toMatchObject({ code: "unsupported_dataset" });
  });

  it.each([
    "not authorized for that account",
    "zones [zone] are not authorized",
    "does not have access to the path",
    "permission denied",
  ])("maps GraphQL permission error %s to a safe typed error", async (message) => {
    const fetchImpl = vi.fn().mockResolvedValue(Response.json({ errors: [{ message }] }));

    await expect(queryCloudflareWindow({ ...input, fetchImpl })).rejects.toMatchObject({
      code: "cloudflare_permission_denied",
      message: "Cloudflare analytics query failed",
    });
  });

  it("maps GraphQL authentication errors to a safe typed error", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(Response.json({ errors: [{ message: "Unauthorized" }] }));

    await expect(queryCloudflareWindow({ ...input, fetchImpl })).rejects.toMatchObject({
      code: "cloudflare_auth_invalid",
      message: "Cloudflare analytics query failed",
    });
  });

  it("maps GraphQL schema errors and empty zone results", async () => {
    const schemaError = vi.fn().mockResolvedValue(Response.json({ errors: [{ message: "Cannot query field" }] }));
    await expect(queryCloudflareWindow({ ...input, fetchImpl: schemaError })).rejects.toMatchObject({ code: "unsupported_dataset" });
    const empty = vi.fn().mockResolvedValue(Response.json({ data: { viewer: { zones: [] } } }));
    await expect(queryCloudflareWindow({ ...input, fetchImpl: empty })).rejects.toMatchObject({
      code: "cloudflare_permission_denied",
      message: "Cloudflare permission denied",
    });
  });

  it.each([
    [null, "a null JSON body"],
    [[], "an array JSON body"],
    [{ errors: [null] }, "a null GraphQL error"],
    [{ errors: [{ message: 123 }] }, "a non-string GraphQL error message"],
  ])("rejects %s with a typed unavailable error", async (body, _description) => {
    const fetchImpl = vi.fn().mockResolvedValue(Response.json(body));
    await expect(queryCloudflareWindow({ ...input, fetchImpl })).rejects.toMatchObject({
      code: "cloudflare_unavailable",
    });
  });

  it("fails instead of presenting truncated groups", async () => {
    const full = Array.from({ length: 5000 }, () => ({ count: 1, dimensions: { userAgent: "GPTBot" } }));
    const fetchImpl = vi.fn().mockResolvedValue(Response.json({
      data: { viewer: { zones: [{ total: [], byAgent: full, byTrend: [], byPath: [], byStatus: [] }] } },
    }));
    await expect(queryCloudflareWindow({ ...input, fetchImpl })).rejects.toMatchObject({ code: "result_truncated" });
  });

  it.each([
    [{ count: -1 }, "a negative count"],
    [{ count: 1, dimensions: { userAgent: 123 } }, "a non-string User-Agent"],
    [{ count: 1, avg: { sampleInterval: 0 } }, "an invalid sample interval"],
    [{ count: 1, dimensions: { edgeResponseStatus: 200.5 } }, "a non-integer status"],
  ])("rejects malformed groups with %s", async (group, _description) => {
    const fetchImpl = vi.fn().mockResolvedValue(Response.json({
      data: { viewer: { zones: [{ total: [group], byAgent: [], byTrend: [], byPath: [], byStatus: [] }] } },
    }));
    await expect(queryCloudflareWindow({ ...input, fetchImpl })).rejects.toMatchObject({ code: "cloudflare_unavailable" });
  });
});
