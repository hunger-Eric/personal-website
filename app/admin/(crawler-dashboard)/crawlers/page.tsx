import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { parseCrawlerRange, parseCrawlerSite } from "@/lib/crawler-analytics/service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "访问检测 | Admin", robots: { index: false, follow: false } };

export default async function CrawlerDashboardPage({ searchParams }: { searchParams: Promise<{ site?: string | string[]; range?: string | string[] }> }) {
  const requestedParams = await searchParams;
  const requested = requestedParams.range;
  let range = "24h";
  let site = "personal";
  if (!Array.isArray(requested)) {
    try {
      range = parseCrawlerRange(requested);
    } catch {
      range = "24h";
    }
  }
  try {
    site = parseCrawlerSite(requestedParams.site);
  } catch {
    site = "personal";
  }
  redirect(`/admin/crawlers/human?site=${site}&range=${range}`);
}
