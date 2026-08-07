import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ensureOfficialRuleSource,
  ensureOfficialRuleSources,
  isIpInPrefixes,
  loadUsableRuleSet,
  parseOfficialPrefixPayload,
  PERPLEXITY_RULE_SOURCES,
  syncOpenAiRuleSources,
  syncPerplexityRuleSources,
  syncRuleSource,
  type OfficialRuleSource,
} from "../src/official-ip-rules";
import initialSql from "../migrations/0001_initial.sql?raw";
import identitySql from "../migrations/0002_identity_shadow.sql?raw";

const source: OfficialRuleSource = {
  id: "openai_gptbot",
  url: "https://openai.com/gptbot.json",
};

async function apply(sql: string) {
  for (const statement of sql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)) {
    await env.DB.prepare(statement).run();
  }
}

describe("official crawler IP rules", () => {
  beforeEach(async () => {
    await apply(initialSql);
    await apply(identitySql);
    await env.DB.prepare("DELETE FROM crawler_rule_sets").run();
  });

  it("normalizes IPv4 and IPv6 prefixes and matches boundaries", () => {
    const parsed = parseOfficialPrefixPayload({
      creationTime: "2026-08-06T00:00:00.000000",
      prefixes: [{ ipv4Prefix: "203.0.113.0/24" }, { ipv6Prefix: "2001:db8::/32" }],
    });
    expect(parsed.prefixes).toEqual(["2001:db8::/32", "203.0.113.0/24"]);
    expect(isIpInPrefixes("203.0.113.255", parsed.prefixes)).toBe(true);
    expect(isIpInPrefixes("203.0.114.0", parsed.prefixes)).toBe(false);
    expect(isIpInPrefixes("2001:db8::1", parsed.prefixes)).toBe(true);
  });

  it("stores a validated version and serves it for seven days", async () => {
    const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify({
      creationTime: "2026-08-06T00:00:00.000000",
      prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
    }), { status: 200 }));
    const now = new Date("2026-08-06T12:00:00.000Z");
    await syncRuleSource(env.DB, source, fetcher, now);
    await expect(loadUsableRuleSet(env.DB, source.id, new Date("2026-08-13T11:59:59.000Z"))).resolves.toMatchObject({
      prefixes: ["203.0.113.0/24"], usingLastKnownGood: true,
    });
    await expect(loadUsableRuleSet(env.DB, source.id, new Date("2026-08-13T12:00:01.000Z"))).resolves.toBeNull();
  });

  it("preserves the last good version after a bad response without logging its body", async () => {
    const now = new Date("2026-08-06T12:00:00.000Z");
    await syncRuleSource(env.DB, source, vi.fn().mockResolvedValue(new Response(JSON.stringify({
      creationTime: "2026-08-06T00:00:00.000000",
      prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
    }))), now);
    const secretBody = "remote-response-must-not-log";
    await syncRuleSource(env.DB, source, vi.fn().mockResolvedValue(new Response(secretBody, { status: 503 })), new Date("2026-08-07T12:00:00.000Z"));
    const row = await env.DB.prepare("SELECT prefixes_json, last_error_code FROM crawler_rule_sets WHERE source_id = ?").bind(source.id).first<{ prefixes_json: string; last_error_code: string }>();
    expect(row).toMatchObject({ prefixes_json: '["203.0.113.0/24"]', last_error_code: "http_status" });
    expect(JSON.stringify(row)).not.toContain(secretBody);
  });

  it("synchronizes only the three fixed OpenAI JSON sources", async () => {
    const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify({
      creationTime: "2026-08-06T00:00:00.000000",
      prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
    })));
    await syncOpenAiRuleSources(env.DB, fetcher, new Date("2026-08-06T12:00:00.000Z"));
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "https://openai.com/gptbot.json",
      "https://openai.com/searchbot.json",
      "https://openai.com/chatgpt-user.json",
    ]);
  });

  it("keeps Perplexity sources fixed and separate from OpenAI", async () => {
    expect(PERPLEXITY_RULE_SOURCES).toEqual([
      { id: "perplexity_bot", url: "https://www.perplexity.ai/perplexitybot.json" },
      { id: "perplexity_user", url: "https://www.perplexity.ai/perplexity-user.json" },
    ]);
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      creationTime: "2026-08-06T00:00:00.000000",
      prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
    })));
    await syncPerplexityRuleSources(env.DB, fetcher, new Date("2026-08-06T12:00:00.000Z"));
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "https://www.perplexity.ai/perplexitybot.json",
      "https://www.perplexity.ai/perplexity-user.json",
    ]);
  });

  it("bootstraps every official source when the database has no successful rules", async () => {
    const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify({
      creationTime: "2026-08-06T00:00:00.000000",
      prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
    }), { status: 200 }));
    const now = new Date("2026-08-06T12:00:00.000Z");

    await ensureOfficialRuleSources(env.DB, fetcher, now);
    await ensureOfficialRuleSources(env.DB, fetcher, new Date("2026-08-06T13:00:00.000Z"));

    expect(fetcher).toHaveBeenCalledTimes(5);
    const rows = await env.DB.prepare("SELECT source_id, last_success_at FROM crawler_rule_sets ORDER BY source_id").all<{
      source_id: string;
      last_success_at: string | null;
    }>();
    expect(rows.results).toHaveLength(5);
    expect(rows.results.every((row) => row.last_success_at === now.toISOString())).toBe(true);
  });

  it("bootstraps only the requested source for first-request verification", async () => {
    const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify({
      creationTime: "2026-08-06T00:00:00.000000",
      prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
    }), { status: 200 }));
    const now = new Date("2026-08-06T12:00:00.000Z");

    await ensureOfficialRuleSource(env.DB, "openai_searchbot", fetcher, now);
    await ensureOfficialRuleSource(env.DB, "openai_searchbot", fetcher, new Date("2026-08-06T13:00:00.000Z"));

    expect(fetcher).toHaveBeenCalledTimes(1);
    const rows = await env.DB.prepare("SELECT source_id FROM crawler_rule_sets").all<{ source_id: string }>();
    expect(rows.results).toEqual([{ source_id: "openai_searchbot" }]);
  });

  it("immediately retries when a fixed source URL changes", async () => {
    const previousAttempt = "2026-08-06T12:00:00.000Z";
    await env.DB.prepare("INSERT INTO crawler_rule_sets (source_id, source_url, prefixes_json, content_sha256, source_created_at, last_attempt_at, last_success_at, last_error_code) VALUES (?, ?, NULL, NULL, NULL, ?, NULL, ?)")
      .bind("perplexity_bot", "https://www.perplexity.com/perplexitybot.json", previousAttempt, "fetch_failed")
      .run();
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      creationTime: "2026-08-06T00:00:00.000000",
      prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
    }), { status: 200 }));

    await ensureOfficialRuleSource(env.DB, "perplexity_bot", fetcher, new Date("2026-08-06T12:01:00.000Z"));

    expect(fetcher).toHaveBeenCalledTimes(1);
    const row = await env.DB.prepare("SELECT source_url, last_success_at FROM crawler_rule_sets WHERE source_id = ?")
      .bind("perplexity_bot")
      .first<{ source_url: string; last_success_at: string | null }>();
    expect(row).toEqual({ source_url: "https://www.perplexity.ai/perplexitybot.json", last_success_at: "2026-08-06T12:01:00.000Z" });
  });

  it("fetches and records the fixed Perplexity destination", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
        creationTime: "2026-08-06T00:00:00.000000",
        prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
      }), { status: 200 }));
    const perplexity = PERPLEXITY_RULE_SOURCES[0];
    expect(perplexity).toBeDefined();

    await syncRuleSource(env.DB, perplexity!, fetcher, new Date("2026-08-06T12:00:00.000Z"));

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith("https://www.perplexity.ai/perplexitybot.json", expect.objectContaining({ redirect: "error" }));
    const row = await env.DB.prepare("SELECT source_url, last_success_at, last_error_code FROM crawler_rule_sets WHERE source_id = ?")
      .bind("perplexity_bot")
      .first<{ source_url: string; last_success_at: string | null; last_error_code: string | null }>();
    expect(row).toMatchObject({
      source_url: "https://www.perplexity.ai/perplexitybot.json",
      last_success_at: "2026-08-06T12:00:00.000Z",
      last_error_code: null,
    });
  });

  it("does not follow redirects returned by the fixed Perplexity destination", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, {
      status: 302,
      headers: { Location: "https://attacker.example/rules.json" },
    }));
    const perplexity = PERPLEXITY_RULE_SOURCES[0];
    expect(perplexity).toBeDefined();

    await syncRuleSource(env.DB, perplexity!, fetcher, new Date("2026-08-06T12:00:00.000Z"));

    expect(fetcher).toHaveBeenCalledTimes(1);
    const row = await env.DB.prepare("SELECT last_success_at, last_error_code FROM crawler_rule_sets WHERE source_id = ?")
      .bind("perplexity_bot")
      .first<{ last_success_at: string | null; last_error_code: string | null }>();
    expect(row).toEqual({ last_success_at: null, last_error_code: "http_status" });
  });
});
