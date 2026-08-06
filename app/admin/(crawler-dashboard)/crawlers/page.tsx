import type { Metadata } from "next";
import { CrawlerDashboard } from "@/components/admin/crawlers/CrawlerDashboard";
import { getCrawlerAnalytics, parseCrawlerRange } from "@/lib/crawler-analytics/service";
import {
  CrawlerAnalyticsError,
  type CrawlerAnalyticsErrorCode,
  type CrawlerAnalyticsResponse,
  type CrawlerRange,
} from "@/lib/crawler-analytics/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI 爬虫检测 | Admin", robots: { index: false, follow: false } };

type RangeResult = { range: CrawlerRange } | { errorCode: "invalid_range" };
type DashboardResult =
  | { range: CrawlerRange; data: CrawlerAnalyticsResponse }
  | { range: CrawlerRange; errorCode: CrawlerAnalyticsErrorCode };

function resolveRange(range: string | string[] | undefined): RangeResult {
  if (Array.isArray(range)) return { errorCode: "invalid_range" };
  try {
    return { range: parseCrawlerRange(range) };
  } catch {
    return { errorCode: "invalid_range" };
  }
}

async function loadDashboard(range: CrawlerRange): Promise<DashboardResult> {
  try {
    return { range, data: await getCrawlerAnalytics(range) };
  } catch (error) {
    return {
      range,
      errorCode: error instanceof CrawlerAnalyticsError ? error.code : "observer_unavailable",
    };
  }
}

export default async function CrawlerDashboardPage({ searchParams }: { searchParams: Promise<{ range?: string | string[] }> }) {
  const rangeResult = resolveRange((await searchParams).range);
  if ("errorCode" in rangeResult) return <CrawlerDashboard range="24h" errorCode={rangeResult.errorCode} />;

  const dashboardResult = await loadDashboard(rangeResult.range);
  if ("errorCode" in dashboardResult) return <CrawlerDashboard range={dashboardResult.range} errorCode={dashboardResult.errorCode} />;
  return <CrawlerDashboard range={dashboardResult.range} data={dashboardResult.data} />;
}
