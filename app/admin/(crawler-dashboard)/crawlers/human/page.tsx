import type { Metadata } from "next";
import { renderCrawlerDashboardPage } from "../dashboard-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "人类访问 | Admin", robots: { index: false, follow: false } };

export default function HumanTrafficPage({ searchParams }: { searchParams: Promise<{ range?: string | string[] }> }) {
  return renderCrawlerDashboardPage("human", searchParams);
}
