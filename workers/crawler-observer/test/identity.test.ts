import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  classifyIdentity,
  findIdentityCandidate,
  otherAutomationIdentity,
  type IdentityCandidate,
} from "../src/identity";
import initialSql from "../migrations/0001_initial.sql?raw";
import identitySql from "../migrations/0002_identity_shadow.sql?raw";

async function apply(sql: string) {
  for (const statement of sql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)) {
    await env.DB.prepare(statement).run();
  }
}

const fixture: readonly IdentityCandidate[] = [
  {
    botId: "oai-searchbot",
    botName: "OAI-SearchBot",
    providerId: "openai",
    providerName: "OpenAI",
    region: "global",
    purpose: "ai_search",
    uaToken: "OAI-SearchBot",
    ruleSourceId: "openai_searchbot",
  },
];

describe("crawler identity contract", () => {
  beforeEach(async () => {
    await apply(initialSql);
    await apply(identitySql);
    await env.DB.prepare("DELETE FROM crawler_rule_sets").run();
  });
  it("matches a candidate case-insensitively without storing the raw UA", () => {
    expect(findIdentityCandidate("Mozilla compatible oai-searchbot/1.0", fixture)).toEqual(fixture[0]);
  });

  it("returns null for an ordinary browser", () => {
    expect(findIdentityCandidate("Mozilla/5.0 Chrome/124.0", fixture)).toBeNull();
  });

  it("keeps an existing AI catalog entry as a declared candidate", () => {
    expect(findIdentityCandidate("ClaudeBot/1.0")).toMatchObject({
      botId: "claudebot",
      providerName: "Anthropic",
      ruleSourceId: null,
    });
  });

  it.each(["OpenGeoConsoleBot/1.0", "OpenGEOConsole/0.1"])('recognizes %s as declared Open GEO test traffic', (userAgent) => {
    expect(findIdentityCandidate(userAgent)).toMatchObject({
      botId: "open-geo-declared-test",
      providerName: "Open GEO",
      purpose: "self_test",
      ruleSourceId: null,
    });
  });

  it("maps the three OpenAI crawlers to their fixed official rule sources", () => {
    expect(findIdentityCandidate("GPTBot/1.1")).toMatchObject({
      botId: "gptbot",
      purpose: "ai_training",
      ruleSourceId: "openai_gptbot",
    });
    expect(findIdentityCandidate("OAI-SearchBot/1.0")).toMatchObject({
      botId: "oai-searchbot",
      purpose: "ai_search",
      ruleSourceId: "openai_searchbot",
    });
    expect(findIdentityCandidate("ChatGPT-User/1.0")).toMatchObject({
      botId: "chatgpt-user",
      purpose: "user_fetch",
      ruleSourceId: "openai_chatgpt_user",
    });
  });

  it("maps Perplexity crawlers to their fixed official rule sources", () => {
    expect(findIdentityCandidate("PerplexityBot/1.0")).toMatchObject({
      botId: "perplexitybot",
      purpose: "ai_search",
      ruleSourceId: "perplexity_bot",
    });
    expect(findIdentityCandidate("Perplexity-User/1.0")).toMatchObject({
      botId: "perplexity-user",
      purpose: "user_fetch",
      ruleSourceId: "perplexity_user",
    });
  });

  it.each([
    ["Bytespider", "bytespider", "ai_training"],
    ["Baiduspider", "baiduspider", "search_index"],
    ["Sogou web spider", "sogou", "search_index"],
    ["360Spider", "360spider", "search_index"],
  ] as const)("recognizes %s as a China-region UA-only candidate", (ua, botId, purpose) => {
    expect(findIdentityCandidate(ua)).toMatchObject({
      botId,
      region: "cn",
      purpose,
      ruleSourceId: null,
    });
  });

  it("returns the locked other-automation identity", () => {
    expect(otherAutomationIdentity()).toEqual({
      botId: "other-bot",
      botName: "Other automation bot",
      providerId: "unknown",
      providerName: "Unknown",
      region: "global",
      purpose: "unknown",
      verificationStatus: "other_automation",
      verificationMethod: "generic_bot",
    });
  });

  it("classifies official, spoofed, declared, and generic automation identities", async () => {
    const now = new Date("2026-08-06T12:00:00.000Z");
    await env.DB.prepare("INSERT INTO crawler_rule_sets (source_id, source_url, prefixes_json, content_sha256, source_created_at, last_attempt_at, last_success_at, last_error_code) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)")
      .bind("openai_gptbot", "https://openai.com/gptbot.json", '["203.0.113.0/24"]', "0".repeat(64), now.toISOString(), now.toISOString(), now.toISOString())
      .run();

    await expect(classifyIdentity({ userAgent: "GPTBot", clientIp: "203.0.113.8", openGeoVerified: false, genericAutomation: true }, env.DB, now))
      .resolves.toMatchObject({ verificationStatus: "verified_official", verificationMethod: "official_ip_range" });
    await expect(classifyIdentity({ userAgent: "GPTBot", clientIp: "198.51.100.8", openGeoVerified: false, genericAutomation: true }, env.DB, now))
      .resolves.toMatchObject({ verificationStatus: "suspected_spoof", verificationMethod: "official_ip_range" });
    await expect(classifyIdentity({ userAgent: "ClaudeBot", clientIp: "198.51.100.8", openGeoVerified: false, genericAutomation: true }, env.DB, now))
      .resolves.toMatchObject({ verificationStatus: "declared_unverified", verificationMethod: "ua_only" });
    await expect(classifyIdentity({ userAgent: "curl/8.4.0", clientIp: "198.51.100.8", openGeoVerified: false, genericAutomation: true }, env.DB, now))
      .resolves.toMatchObject({ verificationStatus: "other_automation", verificationMethod: "generic_bot" });
    await expect(classifyIdentity({ userAgent: "GPTBot", clientIp: "203.0.113.8", openGeoVerified: true, genericAutomation: true }, env.DB, now))
      .resolves.toMatchObject({ botId: "open-geo-self-test", verificationStatus: "verified_official", verificationMethod: "signed_hmac" });
    await expect(classifyIdentity({ userAgent: "OpenGeoConsoleBot/1.0", clientIp: "198.51.100.8", openGeoVerified: false, genericAutomation: true }, env.DB, now))
      .resolves.toMatchObject({ botId: "open-geo-declared-test", verificationStatus: "declared_unverified", verificationMethod: "ua_only" });
  });

  it("synchronizes the matching official source before classifying the first request", async () => {
    const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify({
      creationTime: "2026-08-06T00:00:00.000000",
      prefixes: [{ ipv4Prefix: "203.0.113.0/24" }],
    }), { status: 200 }));
    const now = new Date("2026-08-06T12:00:00.000Z");

    await expect(classifyIdentity({ userAgent: "OAI-SearchBot", clientIp: "203.0.113.8", openGeoVerified: false, genericAutomation: true }, env.DB, now, fetcher))
      .resolves.toMatchObject({ verificationStatus: "verified_official", verificationMethod: "official_ip_range" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("downgrades an expired official rule to declared identity", async () => {
    const syncedAt = new Date("2026-08-06T12:00:00.000Z");
    await env.DB.prepare("INSERT INTO crawler_rule_sets (source_id, source_url, prefixes_json, content_sha256, source_created_at, last_attempt_at, last_success_at, last_error_code) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)")
      .bind("openai_gptbot", "https://openai.com/gptbot.json", '["203.0.113.0/24"]', "0".repeat(64), syncedAt.toISOString(), syncedAt.toISOString(), syncedAt.toISOString())
      .run();
    const unavailable = vi.fn().mockRejectedValue(new Error("source unavailable"));
    await expect(classifyIdentity({ userAgent: "GPTBot", clientIp: "198.51.100.8", openGeoVerified: false, genericAutomation: true }, env.DB, new Date("2026-08-13T12:00:01.000Z"), unavailable))
      .resolves.toMatchObject({ verificationStatus: "declared_unverified", verificationMethod: "ua_only" });
  });
});
