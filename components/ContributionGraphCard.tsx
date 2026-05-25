"use client";

import { useMemo, useState } from "react";

import { blogPosts } from "@/config/articles";
import photographyData from "@/config/photography.json";

interface ContributionGraphCardProps {
  title?: string;
  className?: string;
}

type ActivityDay = {
  date: string;
  count: number;
};

type DayCell = {
  date: Date;
  inRange: boolean;
  level: number;
};

type GridResult = {
  cells: DayCell[];
  weekCount: number;
  monthLabelByWeek: Record<number, string>;
  approxTotal: number;
  summaryLabel: string;
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(n)
    .toLowerCase();
}

function makeDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateKey(value?: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return makeDateKey(parsed);
}

function makeUTCDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

function getUTCDayOfWeek(d: Date): number {
  return d.getUTCDay();
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function buildActivityDays(): ActivityDay[] {
  const map = new Map<string, number>();
  const bump = (date?: string, weight = 1) => {
    const key = parseDateKey(date);
    if (!key) return;
    map.set(key, (map.get(key) ?? 0) + weight);
  };

  for (const post of blogPosts) {
    bump(post.date, 1);
  }

  const photographyProjects = Array.isArray((photographyData as any)?.projects)
    ? (photographyData as any).projects
    : [];

  for (const project of photographyProjects) {
    bump(project?.date, 1);
    for (const photo of project?.photos ?? []) {
      bump(photo?.date, 1);
    }
  }

  return [...map.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildContributionMap(activityDays?: ActivityDay[]) {
  const map = new Map<string, number>();
  if (activityDays && activityDays.length > 0) {
    for (const day of activityDays) {
      map.set(day.date, day.count);
    }
  }
  let total = 0;
  for (const count of map.values()) total += count;
  return { map, total, hasData: map.size > 0 };
}

function buildYearGrid(year: number, activityDays?: ActivityDay[]): GridResult {
  const jan1 = makeUTCDate(year, 0, 1);
  const dec31 = makeUTCDate(year, 11, 31);
  const gridStart = addDays(jan1, -getUTCDayOfWeek(jan1));
  const gridEnd = addDays(dec31, 6 - getUTCDayOfWeek(dec31));
  const { map: activityMap, hasData } = buildContributionMap(activityDays);

  const cells: DayCell[] = [];
  let cursor = new Date(gridStart);
  let yearTotal = 0;

  while (cursor <= gridEnd) {
    const d = new Date(cursor);
    const inRange = d >= jan1 && d <= dec31;
    let level = 0;

    if (inRange && hasData) {
      const key = makeDateKey(d);
      const count = activityMap.get(key) ?? 0;
      yearTotal += count;
      if (count === 0) level = 0;
      else if (count < 2) level = 1;
      else if (count < 4) level = 2;
      else if (count < 7) level = 3;
      else level = 4;
    }

    cells.push({ date: d, inRange, level });
    cursor = addDays(cursor, 1);
  }

  const rawDays = cells.length;
  const weekCount = Math.ceil(rawDays / 7);
  const needed = weekCount * 7 - rawDays;
  if (needed > 0) {
    for (let i = 0; i < needed; i++) {
      cells.push({
        date: addDays(gridEnd, i + 1),
        inRange: false,
        level: 0,
      });
    }
  }

  type MonthSpan = { minWeek: number; maxWeek: number };
  const monthSpans: Array<MonthSpan | undefined> = new Array(12).fill(undefined);

  cells.forEach((cell, idx) => {
    if (!cell.inRange || cell.date.getUTCFullYear() !== year) return;
    const m = cell.date.getUTCMonth();
    const weekIndex = Math.floor(idx / 7);
    let span = monthSpans[m];
    if (!span) {
      monthSpans[m] = { minWeek: weekIndex, maxWeek: weekIndex };
      return;
    }
    if (weekIndex < span.minWeek) span.minWeek = weekIndex;
    if (weekIndex > span.maxWeek) span.maxWeek = weekIndex;
  });

  const monthLabelByWeek: Record<number, string> = {};
  let lastLabeledWeek = -9999;
  const MIN_LABEL_GAP_WEEKS = 4;

  for (let m = 0; m < 12; m++) {
    const span = monthSpans[m];
    if (!span) continue;

    const second = span.minWeek + 1;
    let labelWeek = second <= span.maxWeek ? second : span.maxWeek;

    if (labelWeek - lastLabeledWeek < MIN_LABEL_GAP_WEEKS) {
      let shifted = labelWeek;
      while (shifted - lastLabeledWeek < MIN_LABEL_GAP_WEEKS && shifted < span.maxWeek) {
        shifted += 1;
      }
      if (shifted - lastLabeledWeek < MIN_LABEL_GAP_WEEKS) continue;
      labelWeek = shifted;
    }

    if (monthLabelByWeek[labelWeek] == null) {
      monthLabelByWeek[labelWeek] = MONTH_LABELS[m];
      lastLabeledWeek = labelWeek;
    }
  }

  const approxTotal = hasData ? yearTotal : 0;
  const summaryLabel =
    approxTotal > 0
      ? `${formatCompact(approxTotal)}+ outputs in ${year}`
      : `No outputs recorded in ${year}`;

  return { cells, weekCount, monthLabelByWeek, approxTotal, summaryLabel };
}

function buildRollingGrid(endDate: Date, activityDays?: ActivityDay[]): GridResult {
  const end = makeUTCDate(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
  const rangeStart = addDays(end, -364);
  const gridStart = addDays(rangeStart, -getUTCDayOfWeek(rangeStart));
  const gridEnd = addDays(end, 6 - getUTCDayOfWeek(end));
  const { map: activityMap, hasData } = buildContributionMap(activityDays);

  const cells: DayCell[] = [];
  let cursor = new Date(gridStart);
  let windowTotal = 0;

  while (cursor <= gridEnd) {
    const d = new Date(cursor);
    const inRange = d >= rangeStart && d <= end;
    let level = 0;

    if (inRange && hasData) {
      const key = makeDateKey(d);
      const count = activityMap.get(key) ?? 0;
      windowTotal += count;
      if (count === 0) level = 0;
      else if (count < 2) level = 1;
      else if (count < 4) level = 2;
      else if (count < 7) level = 3;
      else level = 4;
    }

    cells.push({ date: d, inRange, level });
    cursor = addDays(cursor, 1);
  }

  const rawDays = cells.length;
  const weekCount = Math.ceil(rawDays / 7);
  const needed = weekCount * 7 - rawDays;
  if (needed > 0) {
    for (let i = 0; i < needed; i++) {
      cells.push({
        date: addDays(gridEnd, i + 1),
        inRange: false,
        level: 0,
      });
    }
  }

  type MonthSpan = {
    year: number;
    month: number;
    minWeek: number;
    maxWeek: number;
    inRangeDays: number;
  };

  const spans = new Map<number, MonthSpan>();
  const trailingKey = end.getUTCFullYear() * 12 + end.getUTCMonth();

  cells.forEach((cell, idx) => {
    if (!cell.inRange) return;
    const y = cell.date.getUTCFullYear();
    const m = cell.date.getUTCMonth();
    const weekIndex = Math.floor(idx / 7);
    const key = y * 12 + m;
    const existing = spans.get(key);

    if (!existing) {
      spans.set(key, {
        year: y,
        month: m,
        minWeek: weekIndex,
        maxWeek: weekIndex,
        inRangeDays: 1,
      });
      return;
    }

    existing.inRangeDays += 1;
    if (weekIndex < existing.minWeek) existing.minWeek = weekIndex;
    if (weekIndex > existing.maxWeek) existing.maxWeek = weekIndex;
  });

  const monthLabelByWeek: Record<number, string> = {};
  const presentSpans = Array.from(spans.entries())
    .map(([key, span]) => ({ key, span }))
    .sort((a, b) => a.span.minWeek - b.span.minWeek);

  let lastLabeledWeek = -9999;
  const MIN_LABEL_GAP_WEEKS = 4;

  for (const { key, span } of presentSpans) {
    const isTrailing = key === trailingKey;
    let labelWeek: number;

    if (isTrailing && span.inRangeDays > 0 && span.inRangeDays < 14) {
      labelWeek = span.minWeek;
    } else {
      const second = span.minWeek + 1;
      labelWeek = second <= span.maxWeek ? second : span.maxWeek;
    }

    if (labelWeek - lastLabeledWeek < MIN_LABEL_GAP_WEEKS) {
      let shifted = labelWeek;
      while (shifted - lastLabeledWeek < MIN_LABEL_GAP_WEEKS && shifted < span.maxWeek) {
        shifted += 1;
      }
      if (shifted - lastLabeledWeek < MIN_LABEL_GAP_WEEKS) continue;
      labelWeek = shifted;
    }

    if (monthLabelByWeek[labelWeek] == null) {
      monthLabelByWeek[labelWeek] = MONTH_LABELS[span.month];
      lastLabeledWeek = labelWeek;
    }
  }

  const approxTotal = hasData ? windowTotal : 0;
  const summaryLabel =
    approxTotal > 0
      ? `${formatCompact(approxTotal)}+ outputs in the last year`
      : "No outputs recorded in the last year";

  return { cells, weekCount, monthLabelByWeek, approxTotal, summaryLabel };
}

export function ContributionGraphCard({
  title = "Work Rhythm",
  className,
}: ContributionGraphCardProps) {
  const [today] = useState(() => {
    const now = new Date();
    return makeUTCDate(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  });

  const currentYear = today.getUTCFullYear();
  const [year, setYear] = useState(currentYear);
  const [rollingCurrentYear, setRollingCurrentYear] = useState(true);

  const years = [
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
    currentYear - 4,
  ];

  const activityByYear = useMemo(() => {
    const buckets: Record<number, ActivityDay[]> = {};
    for (const day of buildActivityDays()) {
      const yearKey = new Date(`${day.date}T00:00:00Z`).getUTCFullYear();
      (buckets[yearKey] ??= []).push(day);
    }
    return buckets;
  }, []);

  const useRolling = rollingCurrentYear && year === currentYear;
  const { cells, weekCount, monthLabelByWeek, summaryLabel } = useMemo(() => {
    if (useRolling) {
      const thisYear = activityByYear[year] ?? [];
      const prevYear = activityByYear[year - 1] ?? [];
      return buildRollingGrid(today, [...prevYear, ...thisYear]);
    }
    return buildYearGrid(year, activityByYear[year]);
  }, [year, useRolling, today, activityByYear]);

  return (
    <section className={`mt-10 ${className ?? ""}`}>
      <div className="flex items-center gap-4">
        <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
          ~/{title}
        </h2>
        <div className="hidden h-px w-40 bg-border sm:block sm:w-72" aria-hidden />
      </div>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-stretch md:gap-8">
        <div className="text-foreground">
          <div className="overflow-x-auto pb-2 lg:overflow-x-visible lg:pb-0">
            <div className="inline-block pt-1">
              <div className="flex justify-start gap-[2px] text-[0.65rem] leading-tight text-muted-foreground/70 sm:gap-[3.5px] sm:text-[0.85rem]">
                {Array.from({ length: weekCount }).map((_, weekIndex) => {
                  const label = monthLabelByWeek[weekIndex] ?? "";
                  return (
                    <div
                      key={`month-${weekIndex}`}
                      className="flex min-h-[1.1rem] w-[8px] items-end justify-start pb-0.5 sm:min-h-[1.35rem] sm:w-[12px]"
                    >
                      {label && <span className="translate-x-[1px]">{label}</span>}
                    </div>
                  );
                })}
              </div>

              <div className="mt-1 flex gap-[2px] sm:gap-[3.5px]">
                {Array.from({ length: weekCount }).map((_, weekIndex) => (
                  <div
                    key={`week-${weekIndex}`}
                    className="flex flex-col gap-[2px] sm:gap-[3.5px]"
                  >
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const idx = weekIndex * 7 + dayIndex;
                      const cell = cells[idx];

                      if (!cell || !cell.inRange) {
                        return (
                          <div
                            key={`cell-${weekIndex}-${dayIndex}`}
                            className="h-[8px] w-[8px] rounded-[2px] bg-slate-300/70 sm:h-[12px] sm:w-[12px] sm:rounded-[3px]"
                          />
                        );
                      }

                      let color = "bg-slate-300";
                      if (cell.level === 1) color = "bg-indigo-200";
                      if (cell.level === 2) color = "bg-indigo-300";
                      if (cell.level === 3) color = "bg-indigo-400";
                      if (cell.level === 4) color = "bg-indigo-500";

                      return (
                        <div
                          key={`cell-${weekIndex}-${dayIndex}`}
                          className={`h-[8px] w-[8px] rounded-[2px] sm:h-[12px] sm:w-[12px] sm:rounded-[3px] ${color}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-col items-center gap-2 text-[0.75rem] text-muted-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <span>{summaryLabel}</span>
            <div className="hidden items-center gap-2 sm:flex">
              <span>Less</span>
              <div className="flex items-center gap-[3.5px]">
                <span className="h-[12px] w-[12px] rounded-[3px] bg-slate-300" />
                <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-200" />
                <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-300" />
                <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-400" />
                <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-500" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-row justify-between gap-3 text-xs text-muted-foreground md:w-[4.75rem] md:flex-col md:gap-2 md:text-sm">
          {years.map((y) => {
            const isActive = y === year;
            const isCurrent = y === currentYear;

            return (
              <button
                key={y}
                type="button"
                onClick={() => {
                  if (isCurrent) {
                    if (year === currentYear && isActive) {
                      setRollingCurrentYear((prev) => !prev);
                    } else {
                      setYear(currentYear);
                      setRollingCurrentYear(true);
                    }
                  } else {
                    setYear(y);
                    setRollingCurrentYear(false);
                  }
                }}
                className={`flex-1 px-1 py-1 text-center font-medium transition-colors md:text-left ${
                  isActive ? "text-indigo-500" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
