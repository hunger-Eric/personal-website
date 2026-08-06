import { z } from "zod";

const count = z.number().int().nonnegative();
const category = z.enum(["identified_ai_crawler", "open_geo_self_test", "other_automation"]);
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
}).strict().superRefine((value, context) => {
  if (value.summary.crawlerRequests !== sumCategories(value.summary)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["summary", "crawlerRequests"], message: "crawler request total must equal category totals" });
  }
  value.paths.forEach((path, index) => {
    if (path.total !== sumCategories(path)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["paths", index, "total"], message: "path total must equal category totals" });
    }
  });
});

export type CrawlerAnalyticsWorkerResponse = z.infer<typeof crawlerAnalyticsWorkerSchema>;
