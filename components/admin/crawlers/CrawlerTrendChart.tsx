import { crawlerDashboardCopy as copy } from "@/config/copy/crawler-dashboard";
import type { CrawlerAnalyticsResponse } from "@/lib/crawler-analytics/types";

type Trend = CrawlerAnalyticsResponse["trend"];
type Props = { trend: Trend };

const WIDTH = 720;
const HEIGHT = 240;
const PADDING = 32;

function formatBucket(bucket: string) {
  return `${bucket.slice(0, 10)} ${bucket.slice(11, 16)}`;
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

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={copy.trend} className="h-auto w-full border border-hairline bg-surface-paper-elevated">
        <title>{copy.trend}</title>
        {series.map((item) => <polyline key={item.key} fill="none" stroke={item.color} strokeWidth="3" points={points(trend.map((row) => row[item.key]), maximum)} />)}
      </svg>
      <div className="overflow-x-auto">
        <table aria-label={copy.trendData} className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-hairline text-muted-foreground"><tr><th className="px-3 py-2 font-medium">时间</th>{series.map((item) => <th key={item.key} className="px-3 py-2 font-medium">{item.label}</th>)}</tr></thead>
          <tbody>{trend.map((row) => <tr key={row.bucket} className="border-b border-hairline"><td className="px-3 py-2 font-mono text-xs">{formatBucket(row.bucket)}</td>{series.map((item) => <td key={item.key} className="px-3 py-2">{row[item.key]}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
