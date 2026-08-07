import { crawlerDashboardCopy as copy } from "@/config/copy/crawler-dashboard";
import type { CrawlerAnalyticsResponse } from "@/lib/crawler-analytics/types";

type Trend = CrawlerAnalyticsResponse["trend"];
type Props = { trend: Trend };

const WIDTH = 720;
const HEIGHT = 240;
const PADDING = 32;

function formatBucket(bucket: string) {
  return `${bucket.slice(0, 10)} ${bucket.slice(11, 16)} UTC`;
}

function rowTotal(row: Trend[number]) {
  return row.identifiedAiCrawler + row.openGeoSelfTest + row.otherAutomation;
}

function points(values: number[], maximum: number) {
  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = HEIGHT - PADDING * 2;
  const divisor = Math.max(1, values.length - 1);
  return values
    .map((value, index) => `${PADDING + (index / divisor) * innerWidth},${HEIGHT - PADDING - (value / maximum) * innerHeight}`)
    .join(" ");
}

export function CrawlerTrendChart({ trend }: Props) {
  if (trend.length === 0) {
    return <p className="border border-hairline bg-surface-paper-elevated p-5 text-sm text-muted-foreground">{copy.emptyTrend}</p>;
  }

  const series = [
    { key: "identifiedAiCrawler", label: copy.categories.identified_ai_crawler, color: "var(--accent)" },
    { key: "openGeoSelfTest", label: copy.categories.open_geo_self_test, color: "var(--warning, var(--accent))" },
    { key: "otherAutomation", label: copy.categories.other_automation, color: "var(--muted, var(--foreground))" },
  ] as const;
  const maximum = Math.max(1, ...trend.flatMap((row) => series.map((item) => row[item.key])));
  const activeRows = trend.filter((row) => rowTotal(row) > 0);
  const peakRows = [...activeRows]
    .sort((left, right) => rowTotal(right) - rowTotal(left) || right.bucket.localeCompare(left.bucket))
    .slice(0, 6);
  const peak = peakRows[0];

  return (
    <div className="space-y-4">
      <ul aria-label={copy.legend} className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {series.map((item) => <li key={item.key} className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5" style={{ backgroundColor: item.color }} />{item.label}</li>)}
      </ul>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={copy.trend} className="h-auto w-full border border-hairline bg-surface-paper-elevated">
        <title>{copy.trend}</title>
        {series.map((item) => <polyline key={item.key} fill="none" stroke={item.color} strokeWidth="3" points={points(trend.map((row) => row[item.key]), maximum)} />)}
      </svg>
      <div className="grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-3">
        <section className="bg-surface-paper p-4"><p className="text-sm text-muted-foreground">{copy.activePeriods}</p><p className="mt-2 text-2xl font-semibold">{activeRows.length}</p></section>
        <section className="bg-surface-paper p-4"><p className="text-sm text-muted-foreground">{copy.peakRequests}</p><p className="mt-2 text-2xl font-semibold">{peak ? rowTotal(peak) : 0}</p></section>
        <section className="bg-surface-paper p-4"><p className="text-sm text-muted-foreground">{copy.peakTime}</p><p className="mt-2 font-mono text-sm font-semibold">{peak ? formatBucket(peak.bucket) : copy.noPeak}</p></section>
      </div>
      <div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><h3 className="font-semibold">{copy.peakPeriods}</h3><p className="text-sm text-muted-foreground">{copy.peakPeriodsHelp}</p></div>
        <div className="mt-3 overflow-x-auto">
        <table aria-label={copy.trendData} className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-hairline text-muted-foreground"><tr><th className="px-3 py-2 font-medium">{copy.time}</th>{series.map((item) => <th key={item.key} className="px-3 py-2 font-medium">{item.label}</th>)}<th className="px-3 py-2 font-medium">{copy.total}</th></tr></thead>
          <tbody>{peakRows.map((row) => <tr key={row.bucket} className="border-b border-hairline"><td className="px-3 py-2 font-mono text-xs">{formatBucket(row.bucket)}</td>{series.map((item) => <td key={item.key} className="px-3 py-2">{row[item.key]}</td>)}<td className="px-3 py-2 font-semibold">{rowTotal(row)}</td></tr>)}</tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
