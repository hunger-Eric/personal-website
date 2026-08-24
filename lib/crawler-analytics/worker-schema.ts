import { z } from "zod";

const count = z.number().int().nonnegative();
export const verificationStatusSchema = z.enum(["verified_official", "declared_unverified", "suspected_spoof", "other_automation"]);
export const verificationMethodSchema = z.enum(["official_ip_range", "signed_hmac", "ua_only", "generic_bot"]);
export const ruleSourceIdSchema = z.enum(["openai_gptbot", "openai_searchbot", "openai_chatgpt_user", "perplexity_bot", "perplexity_user"]);
const category = z.enum(["identified_ai_crawler", "open_geo_self_test", "other_automation"]);
const deviceType = z.enum(["desktop", "mobile", "tablet", "other"]);
const browser = z.enum(["chrome", "safari", "edge", "firefox", "wechat", "samsung_internet", "other"]);
const operatingSystem = z.enum(["windows", "macos", "ios", "android", "linux", "chromeos", "other"]);
const categorizedCounts = z.object({
  identifiedAiCrawler: count,
  openGeoSelfTest: count,
  otherAutomation: count,
}).strict();

const sumCategories = (value: z.infer<typeof categorizedCounts>) =>
  value.identifiedAiCrawler + value.openGeoSelfTest + value.otherAutomation;

export const crawlerAnalyticsWorkerSchema = z.object({
  meta: z.object({
    range: z.enum(["24h", "7d", "30d"]),
    start: z.string().datetime(),
    end: z.string().datetime(),
    generatedAt: z.string().datetime(),
    source: z.literal("cloudflare-worker-d1"),
    bucket: z.literal("hour"),
    retentionDays: z.literal(90),
    databaseInitializedAt: z.string().datetime(),
    requestedWindowComplete: z.boolean(),
    bestEffort: z.literal(true),
    classifier: z.object({
      aiCrawlerBots: z.literal("0.6.3"),
      otherBots: z.literal("isbot@5.2.1"),
    }).strict(),
  }).strict(),
  summary: z.object({ crawlerRequests: count }).merge(categorizedCounts).strict(),
  trend: z.array(z.object({ bucket: z.string().datetime() }).merge(categorizedCounts).strict()).max(2160),
  bots: z.array(z.object({
    id: z.string().min(1).max(80),
    name: z.string().min(1).max(120),
    category,
    requests: count,
  }).strict()).max(50),
  paths: z.array(z.object({
    path: z.string().min(1).max(2048).startsWith("/"),
    total: count,
  }).merge(categorizedCounts).strict()).max(100),
  statuses: z.array(z.object({ status: z.number().int().min(100).max(599), requests: count }).strict()),
  human: z.object({
    trackingStartedAt: z.string().datetime(),
    requestedWindowComplete: z.boolean(),
    pageViews: count,
    trend: z.array(z.object({ bucket: z.string().datetime(), pageViews: count }).strict()).max(2160),
    paths: z.array(z.object({ path: z.string().min(1).max(2048).startsWith("/"), pageViews: count }).strict()).max(100),
    statuses: z.array(z.object({ status: z.number().int().min(100).max(599), pageViews: count }).strict()),
    devices: z.array(z.object({ id: deviceType, pageViews: count }).strict()).max(deviceType.options.length).optional(),
    browsers: z.array(z.object({ id: browser, pageViews: count }).strict()).max(browser.options.length).optional(),
    operatingSystems: z.array(z.object({ id: operatingSystem, pageViews: count }).strict()).max(operatingSystem.options.length).optional(),
    countries: z.array(z.object({ countryCode: z.string().regex(/^(?:[A-Z]{2}|XX)$/), pageViews: count }).strict()).max(100).optional(),
    regions: z.array(z.object({ countryCode: z.string().regex(/^(?:[A-Z]{2}|XX)$/), regionCode: z.string().min(1).max(16), regionName: z.string().min(1).max(80), pageViews: count }).strict()).max(100).optional(),
  }).strict().optional(),
  identityPreview: z.object({
    mode: z.literal("shadow"),
    shadowStartedAt: z.string().datetime(),
    summary: z.object({ requests: count, verifiedOfficial: count, declaredUnverified: count, suspectedSpoof: count, otherAutomation: count }).strict(),
    bots: z.array(z.object({
      id: z.string().min(1).max(80), name: z.string().min(1).max(120), providerId: z.string().min(1).max(80), providerName: z.string().min(1).max(120),
      verificationStatus: verificationStatusSchema, verificationMethod: verificationMethodSchema, requests: count,
    }).strict()).max(100),
    rules: z.array(z.object({
      sourceId: ruleSourceIdSchema, lastAttemptAt: z.string().datetime().nullable(), lastSuccessAt: z.string().datetime().nullable(), state: z.enum(["fresh", "last_known_good", "unavailable"]),
    }).strict()).length(5),
  }).strict().optional(),
}).strict().superRefine((value, context) => {
  if (value.summary.crawlerRequests !== sumCategories(value.summary)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["summary", "crawlerRequests"], message: "crawler request total must equal category totals" });
  }
  value.paths.forEach((path, index) => {
    if (path.total !== sumCategories(path)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["paths", index, "total"], message: "path total must equal category totals" });
    }
  });
  if (value.identityPreview) {
    const identityTotal = value.identityPreview.summary.verifiedOfficial + value.identityPreview.summary.declaredUnverified + value.identityPreview.summary.suspectedSpoof + value.identityPreview.summary.otherAutomation;
    if (value.identityPreview.summary.requests !== identityTotal) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["identityPreview", "summary", "requests"], message: "identity preview total must equal verification status totals" });
    }
    const ruleIds = new Set(value.identityPreview.rules.map((rule) => rule.sourceId));
    if (ruleIds.size !== ruleSourceIdSchema.options.length || ruleSourceIdSchema.options.some((sourceId) => !ruleIds.has(sourceId))) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["identityPreview", "rules"], message: "identity preview rules must contain every rule source exactly once" });
    }
  }
});

export type CrawlerAnalyticsWorkerResponse = z.infer<typeof crawlerAnalyticsWorkerSchema>;
export type CrawlerIdentityPreview = NonNullable<CrawlerAnalyticsWorkerResponse["identityPreview"]>;
export type CrawlerVerificationStatus = z.infer<typeof verificationStatusSchema>;
export type CrawlerVerificationMethod = z.infer<typeof verificationMethodSchema>;
export type CrawlerRuleSourceId = z.infer<typeof ruleSourceIdSchema>;
