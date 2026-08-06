import Link from "next/link";
import type { ReactNode } from "react";
import { crawlerDashboardCopy as copy } from "@/config/copy/crawler-dashboard";
import type { CrawlerAnalyticsErrorCode, CrawlerAnalyticsResponse, CrawlerRange } from "@/lib/crawler-analytics/types";
import { CrawlerTrendChart } from "./CrawlerTrendChart";

type Props = { range: CrawlerRange; data?: CrawlerAnalyticsResponse; errorCode?: CrawlerAnalyticsErrorCode };

function DataTable({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border-t border-hairline pt-5"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4 overflow-x-auto">{children}</div></section>;
}

const tableClass = "w-full min-w-[560px] text-left text-sm";
const cellClass = "border-b border-hairline px-3 py-3";
const visibleRanges: readonly CrawlerRange[] = ["24h", "7d", "30d"];

export function formatShare(numerator: number, denominator: number): string {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return "0%";
  return `${Number(((numerator / denominator) * 100).toFixed(1))}%`;
}

function DataProvenance({ data }: { data: CrawlerAnalyticsResponse }) {
  return <>
    <p>{copy.source}</p>
    <p>{copy.queryWindow}：{data.meta.start} 至 {data.meta.end}</p>
    <p>{copy.lastRefresh}：{data.meta.generatedAt}</p>
    <p>记录器初始化：{data.meta.databaseInitializedAt}</p>
    <p>{copy.bestEffort}</p>
    {!data.meta.requestedWindowComplete ? <p>{copy.incompleteWindow}</p> : null}
    <p>{copy.identityDisclaimer}</p>
  </>;
}

export function CrawlerDashboard({ range, data, errorCode }: Props) {
  return <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 sm:py-12"><div className="mx-auto max-w-6xl">
    <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">← {copy.backToSite}</Link>
    <header className="mt-6 border-y border-hairline py-7"><p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{copy.source}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.description}</p><nav aria-label="时间范围" className="mt-5 flex flex-wrap gap-2">{visibleRanges.map((value) => <Link key={value} href={`?range=${value}`} aria-current={range === value ? "page" : undefined} className={`border px-3 py-2 text-sm font-semibold ${range === value ? "border-accent bg-accent text-accent-foreground" : "border-hairline bg-surface-paper hover:border-foreground"}`}>{copy.ranges[value]}</Link>)}</nav></header>
    {errorCode ? <section role="alert" className="mt-8 border border-hairline bg-surface-paper-elevated p-6"><h2 className="text-lg font-semibold">数据暂不可用</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.errors[errorCode]}</p></section> : data ? <DashboardData data={data} /> : null}
  </div></main>;
}

function DashboardData({ data }: { data: CrawlerAnalyticsResponse }) {
  const cards = [
    [copy.automationTotal, data.summary.crawlerRequests],
    [copy.categories.identified_ai_crawler, data.summary.identifiedAiCrawler, data.summary.crawlerRequests],
    [copy.categories.open_geo_self_test, data.summary.openGeoSelfTest, data.summary.crawlerRequests],
    [copy.categories.other_automation, data.summary.otherAutomation, data.summary.crawlerRequests],
  ] as const;
  if (data.summary.crawlerRequests === 0) return <section className="mt-8 border border-hairline bg-surface-paper-elevated p-6"><h2 className="text-lg font-semibold">暂无已识别自动化流量</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.empty}</p><div className="mt-4 space-y-1 text-sm text-muted-foreground"><DataProvenance data={data} /></div></section>;
  return <div className="mt-8 space-y-10">
    <div className="grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value, denominator]) => <section key={label} className="bg-surface-paper p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p>{denominator === undefined ? null : <p className="mt-2 text-sm text-muted-foreground">{copy.share}：{formatShare(value, denominator)}</p>}</section>)}</div>
    <section className="border-t border-hairline pt-5"><h2 className="text-lg font-semibold">{copy.trend}</h2><div className="mt-4"><CrawlerTrendChart trend={data.trend} /></div></section>
    <DataTable title={copy.bots}><table className={tableClass}><thead className="text-muted-foreground"><tr><th className={cellClass}>名称</th><th className={cellClass}>{copy.category}</th><th className={cellClass}>{copy.requests}</th></tr></thead><tbody>{data.bots.map((row) => <tr key={row.id}><td className={cellClass}>{row.name}</td><td className={cellClass}>{copy.categories[row.category]}</td><td className={cellClass}>{row.requests}</td></tr>)}</tbody></table></DataTable>
    <DataTable title={copy.paths}><table className={tableClass}><thead className="text-muted-foreground"><tr><th className={cellClass}>{copy.path}</th><th className={cellClass}>{copy.categories.identified_ai_crawler}</th><th className={cellClass}>{copy.categories.open_geo_self_test}</th><th className={cellClass}>{copy.categories.other_automation}</th><th className={cellClass}>{copy.total}</th></tr></thead><tbody>{data.paths.map((row) => <tr key={row.path}><td className={cellClass}>{row.path}</td><td className={cellClass}>{row.identifiedAiCrawler}</td><td className={cellClass}>{row.openGeoSelfTest}</td><td className={cellClass}>{row.otherAutomation}</td><td className={cellClass}>{row.total}</td></tr>)}</tbody></table></DataTable>
    <DataTable title={copy.statuses}><table className="w-full min-w-[320px] text-left text-sm"><thead className="text-muted-foreground"><tr><th className={cellClass}>{copy.status}</th><th className={cellClass}>{copy.requests}</th></tr></thead><tbody>{data.statuses.map((row) => <tr key={row.status}><td className={cellClass}>{row.status}</td><td className={cellClass}>{row.requests}</td></tr>)}</tbody></table></DataTable>
    <footer className="border-t border-hairline pt-5 text-sm leading-6 text-muted-foreground"><DataProvenance data={data} /></footer>
  </div>;
}
