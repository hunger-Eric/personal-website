import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { parseCrawlerRange } from "@/lib/crawler-analytics/service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "访问检测 | Admin", robots: { index: false, follow: false } };

export default async function CrawlerDashboardPage({ searchParams }: { searchParams: Promise<{ range?: string | string[] }> }) {
  const requested = (await searchParams).range;
  let range = "24h";
  if (!Array.isArray(requested)) {
    try {
      range = parseCrawlerRange(requested);
    } catch {
      range = "24h";
    }
  }
  redirect(`/admin/crawlers/human?range=${range}`);
}
