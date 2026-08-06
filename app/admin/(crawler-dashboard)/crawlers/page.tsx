import type { Metadata } from "next";
import { CrawlerDashboard } from "@/components/admin/crawlers/CrawlerDashboard";
import { getCrawlerAnalytics, parseCrawlerRange } from "@/lib/crawler-analytics/service";
import { CrawlerAnalyticsError, type CrawlerAnalyticsErrorCode } from "@/lib/crawler-analytics/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI 爬虫检测 | Admin", robots: { index: false, follow: false } };

export default async function CrawlerDashboardPage({ searchParams }: { searchParams: Promise<{ range?: string | string[] }> }) {
  const requestedRange = (await searchParams).range;
  if (Array.isArray(requestedRange)) return <CrawlerDashboard range="24h" errorCode="invalid_range" />;
  let range;
  try { range = parseCrawlerRange(requestedRange); } catch { return <CrawlerDashboard range="24h" errorCode="invalid_range" />; }
  try { return <CrawlerDashboard range={range} data={await getCrawlerAnalytics(range)} />; } catch (error) {
    const errorCode: CrawlerAnalyticsErrorCode = error instanceof CrawlerAnalyticsError ? error.code : "cloudflare_unavailable";
    return <CrawlerDashboard range={range} errorCode={errorCode} />;
  }
}
