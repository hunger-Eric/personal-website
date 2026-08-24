import Link from "next/link";
import type { ReactNode } from "react";
import { crawlerDashboardCopy as copy } from "@/config/copy/crawler-dashboard";
import type { CrawlerAnalyticsErrorCode, CrawlerAnalyticsResponse, CrawlerIdentityPreview, CrawlerRange } from "@/lib/crawler-analytics/types";
import { CrawlerTrendChart } from "./CrawlerTrendChart";

type DashboardView = "human" | "machines";
type Props = { view?: DashboardView; range: CrawlerRange; data?: CrawlerAnalyticsResponse; errorCode?: CrawlerAnalyticsErrorCode };

function DataTable({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border-t border-hairline pt-5"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4 overflow-x-auto">{children}</div></section>;
}

const tableClass = "w-full min-w-[560px] text-left text-sm";
const cellClass = "border-b border-hairline px-3 py-3";
const visibleRanges: readonly CrawlerRange[] = ["24h", "7d", "30d"];
const countryNames = new Intl.DisplayNames(["zh-CN"], { type: "region" });

function countryLabel(countryCode: string): string {
  if (countryCode === "XX") return copy.human.unknownLocation;
  return `${countryNames.of(countryCode) ?? countryCode} (${countryCode})`;
}

export function formatShare(numerator: number, denominator: number): string {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return "0%";
  return `${Number(((numerator / denominator) * 100).toFixed(1))}%`;
}

function DataProvenance({ data, view }: { data: CrawlerAnalyticsResponse; view: DashboardView }) {
  return <>
    <p>{copy.source}</p>
    <p>{copy.queryWindow}：{data.meta.start} 至 {data.meta.end}</p>
    <p>{copy.lastRefresh}：{data.meta.generatedAt}</p>
    <p>记录器初始化：{data.meta.databaseInitializedAt}</p>
    <p>{copy.bestEffort}</p>
    {!data.meta.requestedWindowComplete ? <p>{copy.incompleteWindow}</p> : null}
    {view === "machines" ? <p>{copy.identityDisclaimer}</p> : null}
  </>;
}

function IdentityPreview({ preview }: { preview: CrawlerIdentityPreview }) {
  const cards = [
    [copy.identityPreview.statuses.verified_official, preview.summary.verifiedOfficial],
    [copy.identityPreview.statuses.declared_unverified, preview.summary.declaredUnverified],
    [copy.identityPreview.statuses.suspected_spoof, preview.summary.suspectedSpoof],
    [copy.identityPreview.statuses.other_automation, preview.summary.otherAutomation],
  ] as const;
  return <section aria-labelledby="identity-preview-title" className="border-t border-hairline pt-5">
    <h2 id="identity-preview-title" className="text-lg font-semibold">{copy.identityPreview.title}</h2>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.identityPreview.description}</p>
    <div className="mt-4 grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([label, value]) => <section key={label} className="bg-surface-paper p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></section>)}
    </div>
    <DataTable title={copy.identityPreview.total}><table className={tableClass}><thead className="text-muted-foreground"><tr><th className={cellClass}>名称</th><th className={cellClass}>厂商</th><th className={cellClass}>身份</th><th className={cellClass}>验证方法</th><th className={cellClass}>{copy.requests}</th></tr></thead><tbody>{preview.bots.map((row) => <tr key={`${row.id}:${row.providerId}:${row.verificationStatus}:${row.verificationMethod}`}><td className={cellClass}>{row.name}</td><td className={cellClass}>{row.providerName}</td><td className={cellClass}>{copy.identityPreview.statuses[row.verificationStatus]}</td><td className={cellClass}>{copy.identityPreview.methods[row.verificationMethod]}</td><td className={cellClass}>{row.requests}</td></tr>)}</tbody></table></DataTable>
    <div className="mt-4 space-y-1 text-sm text-muted-foreground">
      {preview.rules.map((rule) => <p key={rule.sourceId}>{copy.identityPreview.ruleSources[rule.sourceId]}：{copy.identityPreview.rules[rule.state]}；{copy.identityPreview.ruleUpdatedAt}：{rule.lastSuccessAt ?? copy.identityPreview.neverSynced}</p>)}
    </div>
  </section>;
}

function HumanTraffic({ human }: { human: NonNullable<CrawlerAnalyticsResponse["human"]> }) {
  const active = human.trend.filter((row) => row.pageViews > 0);
  const peaks = [...active].sort((left, right) => right.pageViews - left.pageViews || right.bucket.localeCompare(left.bucket)).slice(0, 6);
  const peak = peaks[0]?.pageViews ?? 0;
  const breakdowns = human.devices && human.browsers && human.operatingSystems ? [
    [copy.human.devices, human.devices, copy.human.deviceLabels],
    [copy.human.browsers, human.browsers, copy.human.browserLabels],
    [copy.human.operatingSystems, human.operatingSystems, copy.human.operatingSystemLabels],
  ] as const : [];
  return <section aria-labelledby="human-traffic-title" className="space-y-5 border-t border-hairline pt-5">
    <div>
      <h2 id="human-traffic-title" className="text-lg font-semibold">{copy.human.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{copy.human.disclaimer}</p>
      {!human.requestedWindowComplete ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy.human.trackingStartedAt} {human.trackingStartedAt} {copy.human.incompleteWindow}</p> : null}
    </div>
    <div className="grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-3">
      {[[copy.human.pageViews, human.pageViews], [copy.human.activePeriods, active.length], [copy.human.peakPageViews, peak]].map(([label, value]) => <section key={label} className="bg-surface-paper p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></section>)}
    </div>
    <DataTable title={copy.human.paths}><table aria-label={copy.human.paths} className="w-full min-w-[360px] text-left text-sm"><thead className="text-muted-foreground"><tr><th className={cellClass}>{copy.path}</th><th className={cellClass}>{copy.human.pageViews}</th></tr></thead><tbody>{human.paths.map((row) => <tr key={row.path}><td className={cellClass}>{row.path}</td><td className={cellClass}>{row.pageViews}</td></tr>)}</tbody></table></DataTable>
    <DataTable title={copy.human.peakPeriods}><table aria-label={copy.human.peakPeriods} className="w-full min-w-[360px] text-left text-sm"><thead className="text-muted-foreground"><tr><th className={cellClass}>{copy.time}</th><th className={cellClass}>{copy.human.pageViews}</th></tr></thead><tbody>{peaks.map((row) => <tr key={row.bucket}><td className={`${cellClass} font-mono text-xs`}>{row.bucket.slice(0, 16).replace("T", " ")} UTC</td><td className={cellClass}>{row.pageViews}</td></tr>)}</tbody></table></DataTable>
    <DataTable title={copy.human.status}><table aria-label={copy.human.status} className="w-full min-w-[320px] text-left text-sm"><thead className="text-muted-foreground"><tr><th className={cellClass}>{copy.status}</th><th className={cellClass}>{copy.human.pageViews}</th></tr></thead><tbody>{human.statuses.map((row) => <tr key={row.status}><td className={cellClass}>{row.status}</td><td className={cellClass}>{row.pageViews}</td></tr>)}</tbody></table></DataTable>
    {human.countries && human.regions ? <section className="border-t border-hairline pt-5"><h2 className="text-lg font-semibold">访问地区</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{copy.human.locationDisclaimer}</p><div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2"><div className="overflow-x-auto"><table aria-label={copy.human.countries} className="w-full min-w-[320px] text-left text-sm"><thead className="text-muted-foreground"><tr><th className={cellClass}>{copy.human.countries}</th><th className={cellClass}>{copy.human.pageViews}</th></tr></thead><tbody>{human.countries.map((row) => <tr key={row.countryCode}><td className={cellClass}>{countryLabel(row.countryCode)}</td><td className={cellClass}>{row.pageViews}</td></tr>)}</tbody></table></div><div className="overflow-x-auto"><table aria-label={copy.human.regions} className="w-full min-w-[320px] table-fixed text-left text-sm"><thead className="text-muted-foreground"><tr><th className={`${cellClass} w-[44%]`}>{copy.human.regions}</th><th className={`${cellClass} w-[36%]`}>{copy.human.countries}</th><th className={`${cellClass} w-[20%]`}>{copy.human.pageViews}</th></tr></thead><tbody>{human.regions.map((row) => <tr key={`${row.countryCode}:${row.regionCode}:${row.regionName}`}><td className={`${cellClass} break-words`}>{row.regionName === "Unknown" ? copy.human.unknownLocation : `${row.regionName} (${row.regionCode})`}</td><td className={`${cellClass} break-words`}>{countryLabel(row.countryCode)}</td><td className={cellClass}>{row.pageViews}</td></tr>)}</tbody></table></div></div></section> : null}
    {breakdowns.length > 0 ? <div className="grid grid-cols-1 gap-8 border-t border-hairline pt-5 lg:grid-cols-3">{breakdowns.map(([title, rows, labels]) => <section key={title}><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4 overflow-x-auto"><table aria-label={title} className="w-full min-w-[280px] text-left text-sm"><thead className="text-muted-foreground"><tr><th className={cellClass}>{title}</th><th className={cellClass}>{copy.human.pageViews}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td className={cellClass}>{labels[row.id]}</td><td className={cellClass}>{row.pageViews}</td></tr>)}</tbody></table></div></section>)}</div> : <p className="border-t border-hairline pt-5 text-sm text-muted-foreground">{copy.human.noClientData}</p>}
  </section>;
}

export function CrawlerDashboard({ view = "machines", range, data, errorCode }: Props) {
  const page = copy.views[view];
  const basePath = `/admin/crawlers/${view}`;
  return <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 sm:py-12"><div className="mx-auto max-w-6xl">
    <Link href="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">← {copy.backToSite}</Link>
    <header className="mt-6 border-y border-hairline py-7"><p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{copy.source}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{page.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{page.description}</p><nav aria-label="访问类型" className="mt-5 grid grid-cols-2 gap-px border border-hairline bg-hairline sm:max-w-sm">{(["human", "machines"] as const).map((value) => <Link key={value} href={`/admin/crawlers/${value}?range=${range}`} aria-current={view === value ? "page" : undefined} className={`px-4 py-3 text-center text-sm font-semibold ${view === value ? "bg-accent text-accent-foreground" : "bg-surface-paper hover:bg-surface-paper-elevated"}`}>{copy.views[value].label}</Link>)}</nav><nav aria-label="时间范围" className="mt-4 flex flex-wrap gap-2">{visibleRanges.map((value) => <Link key={value} href={`${basePath}?range=${value}`} aria-current={range === value ? "page" : undefined} className={`border px-3 py-2 text-sm font-semibold ${range === value ? "border-accent bg-accent text-accent-foreground" : "border-hairline bg-surface-paper hover:border-foreground"}`}>{copy.ranges[value]}</Link>)}</nav></header>
    {errorCode ? <section role="alert" className="mt-8 border border-hairline bg-surface-paper-elevated p-6"><h2 className="text-lg font-semibold">数据暂不可用</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.errors[errorCode]}</p></section> : data ? view === "human" ? <HumanDashboardData data={data} /> : <MachineDashboardData data={data} /> : null}
  </div></main>;
}

function HumanDashboardData({ data }: { data: CrawlerAnalyticsResponse }) {
  if (!data.human) return <section role="status" className="mt-8 border border-hairline bg-surface-paper-elevated p-6"><h2 className="text-lg font-semibold">人类访问统计尚未启用</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.human.noClientData}</p></section>;
  return <div className="mt-8 space-y-10"><HumanTraffic human={data.human} /><footer className="border-t border-hairline pt-5 text-sm leading-6 text-muted-foreground"><DataProvenance data={data} view="human" /></footer></div>;
}

function MachineDashboardData({ data }: { data: CrawlerAnalyticsResponse }) {
  const cards = [
    [copy.automationTotal, data.summary.crawlerRequests],
    [copy.categories.identified_ai_crawler, data.summary.identifiedAiCrawler, data.summary.crawlerRequests],
    [copy.categories.open_geo_self_test, data.summary.openGeoSelfTest, data.summary.crawlerRequests],
    [copy.categories.other_automation, data.summary.otherAutomation, data.summary.crawlerRequests],
  ] as const;
  if (data.summary.crawlerRequests === 0) return <div className="mt-8 space-y-10"><section className="border border-hairline bg-surface-paper-elevated p-6"><h2 className="text-lg font-semibold">暂无已识别自动化流量</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.empty}</p><div className="mt-4 space-y-1 text-sm text-muted-foreground"><DataProvenance data={data} view="machines" /></div></section>{data.identityPreview ? <IdentityPreview preview={data.identityPreview} /> : null}</div>;
  return <div className="mt-8 space-y-10">
    <div className="grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value, denominator]) => <section key={label} className="bg-surface-paper p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p>{denominator === undefined ? null : <p className="mt-2 text-sm text-muted-foreground">{copy.share}：{formatShare(value, denominator)}</p>}</section>)}</div>
    {data.identityPreview ? <IdentityPreview preview={data.identityPreview} /> : null}
    <section className="border-t border-hairline pt-5"><h2 className="text-lg font-semibold">{copy.trend}</h2><div className="mt-4"><CrawlerTrendChart trend={data.trend} /></div></section>
    <DataTable title={copy.bots}><table className={tableClass}><thead className="text-muted-foreground"><tr><th className={cellClass}>名称</th><th className={cellClass}>{copy.category}</th><th className={cellClass}>{copy.requests}</th></tr></thead><tbody>{data.bots.map((row) => <tr key={row.id}><td className={cellClass}>{row.name}</td><td className={cellClass}>{copy.categories[row.category]}</td><td className={cellClass}>{row.requests}</td></tr>)}</tbody></table></DataTable>
    <DataTable title={copy.paths}><table className={tableClass}><thead className="text-muted-foreground"><tr><th className={cellClass}>{copy.path}</th><th className={cellClass}>{copy.categories.identified_ai_crawler}</th><th className={cellClass}>{copy.categories.open_geo_self_test}</th><th className={cellClass}>{copy.categories.other_automation}</th><th className={cellClass}>{copy.total}</th></tr></thead><tbody>{data.paths.map((row) => <tr key={row.path}><td className={cellClass}>{row.path}</td><td className={cellClass}>{row.identifiedAiCrawler}</td><td className={cellClass}>{row.openGeoSelfTest}</td><td className={cellClass}>{row.otherAutomation}</td><td className={cellClass}>{row.total}</td></tr>)}</tbody></table></DataTable>
    <DataTable title={copy.statuses}><table className="w-full min-w-[320px] text-left text-sm"><thead className="text-muted-foreground"><tr><th className={cellClass}>{copy.status}</th><th className={cellClass}>{copy.requests}</th></tr></thead><tbody>{data.statuses.map((row) => <tr key={row.status}><td className={cellClass}>{row.status}</td><td className={cellClass}>{row.requests}</td></tr>)}</tbody></table></DataTable>
    <footer className="border-t border-hairline pt-5 text-sm leading-6 text-muted-foreground"><DataProvenance data={data} view="machines" /></footer>
  </div>;
}
