export const CRAWLER_RANGES = ["24h", "7d", "30d"] as const;
export type CrawlerRange = (typeof CRAWLER_RANGES)[number];

export type VisibleCrawlerCategory =
  | "identified_ai_crawler"
  | "open_geo_self_test"
  | "other_automation";

export type {
  CrawlerAnalyticsWorkerResponse as CrawlerAnalyticsResponse,
  CrawlerIdentityPreview,
  CrawlerRuleSourceId,
  CrawlerVerificationMethod,
  CrawlerVerificationStatus,
} from "./worker-schema";

export type CrawlerAnalyticsErrorCode =
  | "configuration_missing"
  | "observer_auth_invalid"
  | "observer_unavailable"
  | "invalid_range";

export class CrawlerAnalyticsError extends Error {
  constructor(
    public readonly code: CrawlerAnalyticsErrorCode,
    message: string,
    public readonly status = 500
  ) {
    super(message);
    this.name = "CrawlerAnalyticsError";
  }
}
