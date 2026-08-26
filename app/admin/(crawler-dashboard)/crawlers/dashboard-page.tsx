import { CrawlerDashboard } from "@/components/admin/crawlers/CrawlerDashboard";
import { getCrawlerAnalytics, parseCrawlerRange, parseCrawlerSite } from "@/lib/crawler-analytics/service";
import { CrawlerAnalyticsError, type CrawlerAnalyticsErrorCode, type CrawlerAnalyticsResponse, type CrawlerRange, type CrawlerSite } from "@/lib/crawler-analytics/types";

type View = "human" | "machines";
type RangeResult = { range: CrawlerRange } | { errorCode: "invalid_range" };
type SiteResult = { site: CrawlerSite } | { errorCode: "invalid_site" };
type DashboardResult = { data: CrawlerAnalyticsResponse } | { errorCode: CrawlerAnalyticsErrorCode };

function resolveRange(range: string | string[] | undefined): RangeResult {
  if (Array.isArray(range)) return { errorCode: "invalid_range" };
  try {
    return { range: parseCrawlerRange(range) };
  } catch {
    return { errorCode: "invalid_range" };
  }
}

function resolveSite(site: string | string[] | undefined): SiteResult {
  try {
    return { site: parseCrawlerSite(site) };
  } catch {
    return { errorCode: "invalid_site" };
  }
}

async function loadDashboard(site: CrawlerSite, range: CrawlerRange): Promise<DashboardResult> {
  try {
    return { data: await getCrawlerAnalytics(site, range) };
  } catch (error) {
    return { errorCode: error instanceof CrawlerAnalyticsError ? error.code : "observer_unavailable" };
  }
}

export async function renderCrawlerDashboardPage(view: View, searchParams: Promise<{ site?: string | string[]; range?: string | string[] }>) {
  const requested = await searchParams;
  const siteResult = resolveSite(requested.site);
  if ("errorCode" in siteResult) return <CrawlerDashboard view={view} site="personal" range="24h" errorCode={siteResult.errorCode} />;
  const rangeResult = resolveRange(requested.range);
  if ("errorCode" in rangeResult) return <CrawlerDashboard view={view} site={siteResult.site} range="24h" errorCode={rangeResult.errorCode} />;
  const dashboardResult = await loadDashboard(siteResult.site, rangeResult.range);
  if ("errorCode" in dashboardResult) return <CrawlerDashboard view={view} site={siteResult.site} range={rangeResult.range} errorCode={dashboardResult.errorCode} />;
  return <CrawlerDashboard view={view} site={siteResult.site} range={rangeResult.range} data={dashboardResult.data} />;
}
