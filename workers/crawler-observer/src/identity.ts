import bots from "@geosuite/ai-crawler-bots/bots.json";
import { ensureOfficialRuleSource, isIpInPrefixes, loadUsableRuleSet } from "./official-ip-rules";

export type VerificationStatus =
  | "verified_official"
  | "declared_unverified"
  | "suspected_spoof"
  | "other_automation";

export type VerificationMethod =
  | "official_ip_range"
  | "signed_hmac"
  | "ua_only"
  | "generic_bot";

export type CrawlerPurpose =
  | "ai_training"
  | "ai_search"
  | "user_fetch"
  | "search_index"
  | "self_test"
  | "unknown";

export type CrawlerRegion = "global" | "cn";

export type RuleSourceId =
  | "openai_gptbot"
  | "openai_searchbot"
  | "openai_chatgpt_user"
  | "perplexity_bot"
  | "perplexity_user";

export type IdentityCandidate = {
  botId: string;
  botName: string;
  providerId: string;
  providerName: string;
  region: CrawlerRegion;
  purpose: CrawlerPurpose;
  uaToken: string;
  ruleSourceId: RuleSourceId | null;
};

export type IdentityResult = Omit<IdentityCandidate, "uaToken" | "ruleSourceId"> & {
  verificationStatus: VerificationStatus;
  verificationMethod: VerificationMethod;
};

export type IdentityInput = {
  userAgent: string;
  clientIp: string | null;
  openGeoVerified: boolean;
  genericAutomation: boolean;
};

const EXPLICIT_IDENTITY_CATALOG: readonly IdentityCandidate[] = [
  { botId: "open-geo-declared-test", botName: "Open GEO test (unverified)", providerId: "open-geo", providerName: "Open GEO", region: "global", purpose: "self_test", uaToken: "OpenGeoConsoleBot", ruleSourceId: null },
  { botId: "open-geo-declared-test", botName: "Open GEO test (unverified)", providerId: "open-geo", providerName: "Open GEO", region: "global", purpose: "self_test", uaToken: "OpenGEOConsole/", ruleSourceId: null },
  { botId: "oai-searchbot", botName: "OAI-SearchBot", providerId: "openai", providerName: "OpenAI", region: "global", purpose: "ai_search", uaToken: "OAI-SearchBot", ruleSourceId: "openai_searchbot" },
  { botId: "chatgpt-user", botName: "ChatGPT-User", providerId: "openai", providerName: "OpenAI", region: "global", purpose: "user_fetch", uaToken: "ChatGPT-User", ruleSourceId: "openai_chatgpt_user" },
  { botId: "gptbot", botName: "GPTBot", providerId: "openai", providerName: "OpenAI", region: "global", purpose: "ai_training", uaToken: "GPTBot", ruleSourceId: "openai_gptbot" },
  { botId: "perplexity-user", botName: "Perplexity-User", providerId: "perplexity", providerName: "Perplexity", region: "global", purpose: "user_fetch", uaToken: "Perplexity-User", ruleSourceId: "perplexity_user" },
  { botId: "perplexitybot", botName: "PerplexityBot", providerId: "perplexity", providerName: "Perplexity", region: "global", purpose: "ai_search", uaToken: "PerplexityBot", ruleSourceId: "perplexity_bot" },
  { botId: "bytespider", botName: "Bytespider", providerId: "bytedance", providerName: "ByteDance", region: "cn", purpose: "ai_training", uaToken: "Bytespider", ruleSourceId: null },
  { botId: "baiduspider", botName: "Baiduspider", providerId: "baidu", providerName: "Baidu", region: "cn", purpose: "search_index", uaToken: "Baiduspider", ruleSourceId: null },
  { botId: "sogou", botName: "Sogou Spider", providerId: "sogou", providerName: "Sogou", region: "cn", purpose: "search_index", uaToken: "Sogou", ruleSourceId: null },
  { botId: "360spider", botName: "360Spider", providerId: "360", providerName: "360 Search", region: "cn", purpose: "search_index", uaToken: "360Spider", ruleSourceId: null },
];

function providerId(owner: string): string {
  return owner.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

function purpose(value: string): CrawlerPurpose {
  if (value === "training") return "ai_training";
  if (value === "search") return "ai_search";
  if (value === "user-agent") return "user_fetch";
  return "unknown";
}

const FALLBACK_AI_CATALOG: readonly IdentityCandidate[] = bots
  .filter((bot) => bot.uaToken !== null)
  .map((bot) => ({
    botId: bot.id,
    botName: bot.name,
    providerId: providerId(bot.owner),
    providerName: bot.owner,
    region: "global" as const,
    purpose: purpose(bot.purpose),
    uaToken: bot.uaToken as string,
    ruleSourceId: null,
  }));

export const IDENTITY_CATALOG: readonly IdentityCandidate[] = [
  ...EXPLICIT_IDENTITY_CATALOG,
  ...FALLBACK_AI_CATALOG,
];

export function findIdentityCandidate(
  userAgent: string,
  catalog: readonly IdentityCandidate[] = IDENTITY_CATALOG,
): IdentityCandidate | null {
  const normalized = userAgent.toLowerCase();
  return [...catalog]
    .sort((left, right) => right.uaToken.length - left.uaToken.length)
    .find((candidate) => normalized.includes(candidate.uaToken.toLowerCase())) ?? null;
}

export function otherAutomationIdentity(): IdentityResult {
  return {
    botId: "other-bot",
    botName: "Other automation bot",
    providerId: "unknown",
    providerName: "Unknown",
    region: "global",
    purpose: "unknown",
    verificationStatus: "other_automation",
    verificationMethod: "generic_bot",
  };
}

function fromCandidate(
  candidate: IdentityCandidate,
  verificationStatus: VerificationStatus,
  verificationMethod: VerificationMethod,
): IdentityResult {
  return {
    botId: candidate.botId,
    botName: candidate.botName,
    providerId: candidate.providerId,
    providerName: candidate.providerName,
    region: candidate.region,
    purpose: candidate.purpose,
    verificationStatus,
    verificationMethod,
  };
}

export async function classifyIdentity(
  input: IdentityInput,
  db: D1Database,
  now = new Date(),
  ruleFetcher: typeof fetch = fetch,
): Promise<IdentityResult | null> {
  if (input.openGeoVerified) {
    return {
      botId: "open-geo-self-test",
      botName: "Open GEO self-test",
      providerId: "open-geo",
      providerName: "Open GEO",
      region: "global",
      purpose: "self_test",
      verificationStatus: "verified_official",
      verificationMethod: "signed_hmac",
    };
  }

  const candidate = findIdentityCandidate(input.userAgent);
  if (!candidate) return input.genericAutomation ? otherAutomationIdentity() : null;
  if (!candidate.ruleSourceId || !input.clientIp) return fromCandidate(candidate, "declared_unverified", "ua_only");
  let ruleSet = await loadUsableRuleSet(db, candidate.ruleSourceId, now);
  if (!ruleSet) {
    await ensureOfficialRuleSource(db, candidate.ruleSourceId, ruleFetcher, now);
    ruleSet = await loadUsableRuleSet(db, candidate.ruleSourceId, now);
  }
  if (!ruleSet) return fromCandidate(candidate, "declared_unverified", "ua_only");
  return fromCandidate(
    candidate,
    isIpInPrefixes(input.clientIp, ruleSet.prefixes) ? "verified_official" : "suspected_spoof",
    "official_ip_range",
  );
}
