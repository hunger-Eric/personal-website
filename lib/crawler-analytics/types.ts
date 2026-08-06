export const CRAWLER_RANGES = ["24h", "7d", "30d"] as const;
export type CrawlerRange = (typeof CRAWLER_RANGES)[number];

export type CrawlerCategory =
  | "identified_ai_crawler"
  | "open_geo_self_test"
  | "other_automation"
  | "unclassified";

export type VisibleCrawlerCategory = Exclude<CrawlerCategory, "unclassified">;

export type CrawlerIdentity = {
  id: string;
  name: string;
  category: CrawlerCategory;
};

export type CloudflareRequestGroup = {
  count: number;
  avg?: { sampleInterval?: number | null } | null;
  dimensions?: {
    datetimeHour?: string | null;
    userAgent?: string | null;
    clientRequestPath?: string | null;
    edgeResponseStatus?: number | null;
  } | null;
};

export type CloudflareWindowResult = {
  total: CloudflareRequestGroup[];
  byAgent: CloudflareRequestGroup[];
  byTrend: CloudflareRequestGroup[];
  byPath: CloudflareRequestGroup[];
  byStatus: CloudflareRequestGroup[];
};

export type CrawlerAnalyticsResponse = {
  meta: {
    range: CrawlerRange;
    start: string;
    end: string;
    generatedAt: string;
    source: "cloudflare-graphql";
    sampled: boolean;
    sampleInterval: number;
  };
  summary: {
    totalRequests: number;
    crawlerRequests: number;
    identifiedAiCrawler: number;
    openGeoSelfTest: number;
    otherAutomation: number;
  };
  trend: Array<{
    bucket: string;
    identifiedAiCrawler: number;
    openGeoSelfTest: number;
    otherAutomation: number;
  }>;
  agents: Array<{
    category: VisibleCrawlerCategory;
    name: string;
    userAgent: string;
    requests: number;
  }>;
  paths: Array<{
    path: string;
    identifiedAiCrawler: number;
    openGeoSelfTest: number;
    otherAutomation: number;
    total: number;
  }>;
  statuses: Array<{ status: number; requests: number }>;
};

export type CrawlerAnalyticsErrorCode =
  | "configuration_missing"
  | "cloudflare_auth_invalid"
  | "cloudflare_permission_denied"
  | "cloudflare_rate_limited"
  | "cloudflare_unavailable"
  | "unsupported_dataset"
  | "result_truncated"
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
