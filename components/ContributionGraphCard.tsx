// components/ContributionGraphCard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

interface ContributionGraphCardProps {
  title?: string;
  className?: string;
  /**
   * Optional GitHub username override.
   * If omitted, the API will use process.env.GITHUB_USERNAME.
   */
  username?: string;
}

type ContributionDay = {
  date: string; // ISO "YYYY-MM-DD" from the API (UTC-based)
  count: number;
};

type DayCell = {
  date: Date; // Always represents a UTC midnight date
  inRange: boolean; // true if within the actual period (year or rolling window)
  level: number; // 0–4
};

type GridResult = {
  cells: DayCell[];
  weekCount: number;
  monthLabelByWeek: Record<number, string>;
  approxTotal: number;
  summaryLabel: string;
};

function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(n)
    .toLowerCase();
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Create a date key in "YYYY-MM-DD" format using UTC methods.
 * GitHub API returns dates in UTC, so we must use UTC consistently
 * to avoid timezone-related misalignment of contribution squares.
 */
function makeDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // "YYYY-MM-DD"
}

/**
 * Create a UTC midnight date for the given year/month/day.
 * This ensures consistent date handling regardless of local timezone.
 */
function makeUTCDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

/**
 * Get the day of week (0=Sunday, 6=Saturday) in UTC.
 */
function getUTCDayOfWeek(d: Date): number {
  return d.getUTCDay();
}

/**
 * Add days to a date (in UTC).
 */
function addDays(d: Date, days: number): Date {
  const result = new Date(d.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function buildContributionMap(contributionDays?: ContributionDay[]) {
  const map = new Map<string, number>();
  if (contributionDays && contributionDays.length > 0) {
    // Dedupe by date key — two fetches that overlap on calendar weeks
    // could otherwise double-count the same day.
    for (const d of contributionDays) {
      const key = d.date.slice(0, 10); // "YYYY-MM-DD"
      map.set(key, d.count);
    }
  }
  let total = 0;
  for (const count of map.values()) total += count;
  return { map, total, hasData: map.size > 0 };
}

/**
 * Calendar-year grid: Jan 1 → Dec 31 for `year`.
 * Month labels are placed roughly on the "second column" of that month.
 * All date operations use UTC to match GitHub's date format.
 */
function buildYearGrid(
  year: number,
  contributionDays?: ContributionDay[]
): GridResult {
  const jan1 = makeUTCDate(year, 0, 1);
  const dec31 = makeUTCDate(year, 11, 31);

  // Sunday on/before Jan 1 (using UTC day of week)
  const gridStart = addDays(jan1, -getUTCDayOfWeek(jan1));

  // Saturday on/after Dec 31 (using UTC day of week)
  const gridEnd = addDays(dec31, 6 - getUTCDayOfWeek(dec31));

  const { map: contribMap, hasData } =
    buildContributionMap(contributionDays);

  const cells: DayCell[] = [];
  let cursor = new Date(gridStart);
  let yearTotal = 0;

  while (cursor <= gridEnd) {
    const d = new Date(cursor);
    const inRange = d >= jan1 && d <= dec31;

    let level = 0;
    if (inRange && hasData) {
      const key = makeDateKey(d);
      const count = contribMap.get(key) ?? 0;
      yearTotal += count;

      if (count === 0) level = 0;
      else if (count < 3) level = 1;
      else if (count < 6) level = 2;
      else if (count < 10) level = 3;
      else level = 4;
    }

    cells.push({ date: d, inRange, level });
    cursor = addDays(cursor, 1);
  }

  // Ensure full weeks: pad with out-of-range filler cells so every column has 7 squares
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

  // Month spans in this year: compute min/max week index per month.
  type MonthSpan = { minWeek: number; maxWeek: number };
  const monthSpans: Array<MonthSpan | undefined> = new Array(12).fill(
    undefined
  );

  cells.forEach((cell, idx) => {
    if (!cell.inRange || cell.date.getUTCFullYear() !== year) return;
    const m = cell.date.getUTCMonth();
    const weekIndex = Math.floor(idx / 7);
    let span = monthSpans[m];
    if (!span) {
      span = { minWeek: weekIndex, maxWeek: weekIndex };
      monthSpans[m] = span;
    } else {
      if (weekIndex < span.minWeek) span.minWeek = weekIndex;
      if (weekIndex > span.maxWeek) span.maxWeek = weekIndex;
    }
  });

  const monthLabelByWeek: Record<number, string> = {};

  const MIN_LABEL_GAP_WEEKS = 4;
  let lastLabeledWeek = -9999;

  for (let m = 0; m < 12; m++) {
    const span = monthSpans[m];
    if (!span) continue;

    // "Second column" logic: shift one week to the right if possible.
    const second = span.minWeek + 1;
    let labelWeek = second <= span.maxWeek ? second : span.maxWeek;

    // Avoid overlap with prior label by shifting right within this month's span.
    if (labelWeek - lastLabeledWeek < MIN_LABEL_GAP_WEEKS) {
      let shifted = labelWeek;
      while (
        shifted - lastLabeledWeek < MIN_LABEL_GAP_WEEKS &&
        shifted < span.maxWeek
      ) {
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
      ? `${formatCompact(approxTotal)}+ contributions in ${year}`
      : `No contributions recorded in ${year}`;

  return { cells, weekCount, monthLabelByWeek, approxTotal, summaryLabel };
}

/**
 * Rolling grid: last ~365 days ending at `endDate`.
 *
 * Fix: month labels are computed by year-month (YYYY-MM), not just month name,
 * so labels remain chronologically ordered (no "Dec" after "Jan").
 * All date operations use UTC to match GitHub's date format.
 */
function buildRollingGrid(
  endDate: Date,
  contributionDays?: ContributionDay[]
): GridResult {
  // Normalize endDate to UTC midnight
  const end = makeUTCDate(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate()
  );

  // Start of rolling window (365 days including end)
  const rangeStart = addDays(end, -364);

  // Align to full weeks (Sunday..Saturday) using UTC day of week
  const gridStart = addDays(rangeStart, -getUTCDayOfWeek(rangeStart));
  const gridEnd = addDays(end, 6 - getUTCDayOfWeek(end));

  const { map: contribMap, hasData } =
    buildContributionMap(contributionDays);

  const cells: DayCell[] = [];
  let cursor = new Date(gridStart);
  let windowTotal = 0;

  while (cursor <= gridEnd) {
    const d = new Date(cursor);
    const inRange = d >= rangeStart && d <= end;

    let level = 0;
    if (inRange && hasData) {
      const key = makeDateKey(d);
      const count = contribMap.get(key) ?? 0;
      windowTotal += count;

      if (count === 0) level = 0;
      else if (count < 3) level = 1;
      else if (count < 6) level = 2;
      else if (count < 10) level = 3;
      else level = 4;
    }

    cells.push({ date: d, inRange, level });
    cursor = addDays(cursor, 1);
  }

  // Ensure full weeks: pad with out-of-range filler cells so every column has 7 squares
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

  // Month spans by *year-month* across the rolling window.
  // This fixes out-of-order labels (e.g. "Dec" after "Jan") when the 365-day window
  // contains two Decembers across a year boundary.
  type MonthSpan = {
    year: number;
    month: number; // 0–11
    minWeek: number;
    maxWeek: number;
    inRangeDays: number;
  };

  const spans = new Map<number, MonthSpan>(); // key = year * 12 + month
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
    } else {
      existing.inRangeDays += 1;
      if (weekIndex < existing.minWeek) existing.minWeek = weekIndex;
      if (weekIndex > existing.maxWeek) existing.maxWeek = weekIndex;
    }
  });

  const monthLabelByWeek: Record<number, string> = {};

  // Sort spans by their left edge so labels always appear left → right correctly.
  const presentSpans = Array.from(spans.entries())
    .map(([key, span]) => ({ key, span }))
    .sort((a, b) => a.span.minWeek - b.span.minWeek);

  // Prevent visual overlap: ensure month labels aren't placed too close together.
  const MIN_LABEL_GAP_WEEKS = 4;
  let lastLabeledWeek = -9999;

  for (const { key, span } of presentSpans) {
    const isTrailing = key === trailingKey;

    // Placement rule:
    // - trailing month with < 14 in-range days → earliest week
    // - otherwise "second column" if possible
    let labelWeek: number;
    if (isTrailing && span.inRangeDays > 0 && span.inRangeDays < 14) {
      labelWeek = span.minWeek;
    } else {
      const second = span.minWeek + 1;
      labelWeek = second <= span.maxWeek ? second : span.maxWeek;
    }

    // If it's too close to the previous label, try shifting right within the same month span.
    if (labelWeek - lastLabeledWeek < MIN_LABEL_GAP_WEEKS) {
      let shifted = labelWeek;
      while (
        shifted - lastLabeledWeek < MIN_LABEL_GAP_WEEKS &&
        shifted < span.maxWeek
      ) {
        shifted += 1;
      }

      // If we still can't get enough spacing, skip this label (prevents overlap).
      if (shifted - lastLabeledWeek < MIN_LABEL_GAP_WEEKS) continue;

      labelWeek = shifted;
    }

    // If that week already has a label, keep the first one (do not overwrite).
    if (monthLabelByWeek[labelWeek] == null) {
      monthLabelByWeek[labelWeek] = MONTH_LABELS[span.month];
      lastLabeledWeek = labelWeek;
    }
  }

  const approxTotal = hasData ? windowTotal : 0;
  const summaryLabel =
    approxTotal > 0
      ? `${formatCompact(approxTotal)}+ contributions in the last year`
      : "No contributions recorded in the last year";

  return { cells, weekCount, monthLabelByWeek, approxTotal, summaryLabel };
}

export function ContributionGraphCard({
  title = "Contribution Graph",
  className,
  username,
}: ContributionGraphCardProps) {
  // Memoize "today" as a stable UTC date to prevent unnecessary re-renders.
  // This is initialized once when the component mounts and represents the
  // current day in UTC at the time of mount.
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

  const [dataByYear, setDataByYear] = useState<
    Record<number, ContributionDay[] | undefined>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [loadingYear, setLoadingYear] = useState<number | null>(null);

  // In rolling mode we need data for both the current year AND the previous year,
  // because the "last 365 days" window crosses a year boundary.
  const useRolling = rollingCurrentYear && year === currentYear;
  const yearsToFetch = useMemo(
    () => (useRolling ? [year, year - 1] : [year]),
    [year, useRolling]
  );

  // Fetch data for every year we still need.
  useEffect(() => {
    let cancelled = false;

    const missing = yearsToFetch.filter(
      (y) => !Object.prototype.hasOwnProperty.call(dataByYear, y)
    );

    if (missing.length === 0) {
      return;
    }

    setLoadingYear(year);

    async function loadYear(y: number) {
      try {
        const params = new URLSearchParams();
        params.set("year", String(y));
        if (username) params.set("username", username);

        const res = await fetch(
          `/api/github-contributions?${params.toString()}`,
          {
            headers: {
              "Cache-Control":
                "public, max-age=3600, stale-while-revalidate=86400",
            },
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        const days: ContributionDay[] = json.days ?? [];
        if (!cancelled) {
          setDataByYear((prev) => ({ ...prev, [y]: days }));
        }
      } catch (err) {
        console.error("Failed to fetch GitHub contributions:", err);
        if (!cancelled) {
          setError(
            "Could not load GitHub data. Showing an empty grid for now."
          );
          setDataByYear((prev) => ({ ...prev, [y]: [] }));
        }
      }
    }

    Promise.all(missing.map(loadYear)).then(() => {
      if (!cancelled) {
        setError(null);
        setLoadingYear(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [yearsToFetch, year, username, dataByYear]);

  const { cells, weekCount, monthLabelByWeek, summaryLabel } = useMemo(() => {
    if (useRolling) {
      // Merge current + previous year so the rolling window has every day.
      const thisYear = dataByYear[year] ?? [];
      const prevYear = dataByYear[year - 1] ?? [];
      const merged = [...prevYear, ...thisYear];
      return buildRollingGrid(today, merged);
    }
    return buildYearGrid(year, dataByYear[year]);
  }, [year, useRolling, today, dataByYear]);

  const cardClass = "text-slate-50";

  // Loading skeleton component
  const ContributionSkeleton = () => (
    <div className="inline-block pt-1">
      {/* Month labels skeleton */}
      <div className="flex justify-start gap-[3.5px] text-[0.8rem] leading-tight text-slate-300 sm:text-[0.85rem]">
        {Array.from({ length: 53 }).map((_, weekIndex) => (
          <div
            key={`skeleton-month-${weekIndex}`}
            className="flex min-h-[1.35rem] w-[12px] items-end justify-start pb-0.5"
          >
            {weekIndex % 5 === 0 && (
              <div className="h-3 w-6 skeleton rounded-sm" />
            )}
          </div>
        ))}
      </div>

      {/* Heatmap skeleton */}
      <div className="mt-1 flex gap-[3.5px]">
        {Array.from({ length: 53 }).map((_, weekIndex) => (
          <div
            key={`skeleton-week-${weekIndex}`}
            className="flex flex-col gap-[3.5px]"
          >
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div
                key={`skeleton-cell-${weekIndex}-${dayIndex}`}
                className="h-[12px] w-[12px] rounded-[3px] skeleton"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const isLoading = loadingYear === year;

  return (
    <section className={`mt-10 ${className ?? ""}`}>
      <div className="flex items-center gap-4">
        <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-lg">
          ~/{title}
        </h2>
        <div className="hidden h-px w-40 bg-white/15 sm:block sm:w-72" aria-hidden />
      </div>

      {/* Graph + year buttons */}
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-stretch md:gap-8">
        {/* Graph */}
        <div className={cardClass}>
          <div>
            {/* Scrollable graph on small screens */}
            <div className="overflow-x-auto pb-2 lg:overflow-x-visible lg:pb-0">
              {isLoading ? (
                <ContributionSkeleton />
              ) : (
                <div className="inline-block pt-1">
                  {/* Month labels row – aligned to the chosen week column */}
                  <div className="flex justify-start gap-[2px] text-[0.65rem] leading-tight text-muted-foreground/70 sm:gap-[3.5px] sm:text-[0.85rem]">
                    {Array.from({ length: weekCount }).map((_, weekIndex) => {
                      const label = monthLabelByWeek[weekIndex] ?? "";
                      return (
                        <div
                          key={`month-${weekIndex}`}
                          className="flex min-h-[1.1rem] w-[8px] items-end justify-start pb-0.5 sm:min-h-[1.35rem] sm:w-[12px]"
                        >
                          {label && (
                            <span className="translate-x-[1px]">{label}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Heatmap: weeks (columns) × 7 days (rows) */}
                  <div className="mt-1 flex gap-[2px] sm:gap-[3.5px]">
                    {Array.from({ length: weekCount }).map((_, weekIndex) => (
                      <div
                        key={`week-${weekIndex}`}
                        className="flex flex-col gap-[2px] sm:gap-[3.5px]"
                      >
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                          const idx = weekIndex * 7 + dayIndex;
                          const cell = cells[idx];

                          // Out-of-range filler cells (always light gray blocks)
                          if (!cell || !cell.inRange) {
                            return (
                              <div
                                key={`cell-${weekIndex}-${dayIndex}`}
                                className="h-[8px] w-[8px] rounded-[2px] bg-slate-900/20 sm:h-[12px] sm:w-[12px] sm:rounded-[3px]"
                              />
                            );
                          }

                          // In-range cells: 0-level still visible (old "less" color)
                          const level = cell.level;
                          let color = "bg-slate-800";
                          if (level === 1) color = "bg-indigo-950";
                          if (level === 2) color = "bg-indigo-900";
                          if (level === 3) color = "bg-indigo-700";
                          if (level === 4) color = "bg-indigo-500";

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
              )}
            </div>

            {/* Summary + legend (legend hidden on mobile, summary muted) */}
            <div className="mt-2 flex flex-col items-center gap-2 text-[0.75rem] text-muted-foreground/60 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
              {isLoading ? (
                <>
                  <div className="skeleton h-4 w-48 rounded-md" />
                  <div className="hidden items-center gap-2 sm:flex">
                    <span>Less</span>
                    <div className="flex items-center gap-[3.5px]">
                      <span className="h-[12px] w-[12px] rounded-[3px] bg-slate-800" />
                      <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-950" />
                      <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-900" />
                      <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-700" />
                      <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-500" />
                    </div>
                    <span>More</span>
                  </div>
                </>
              ) : (
                <>
                  <span>{summaryLabel}</span>
                  <div className="hidden items-center gap-2 sm:flex">
                    <span>Less</span>
                    <div className="flex items-center gap-[3.5px]">
                      <span className="h-[12px] w-[12px] rounded-[3px] bg-slate-800" />
                      <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-950" />
                      <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-900" />
                      <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-700" />
                      <span className="h-[12px] w-[12px] rounded-[3px] bg-indigo-500" />
                    </div>
                    <span>More</span>
                  </div>
                </>
              )}
            </div>

            {error && (
              <p className="mt-1 text-xs text-amber-300/80 sm:text-[0.8rem]">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Year selector */}
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
                  isActive
                    ? "text-indigo-300"
                    : "text-muted-foreground hover:text-slate-200"
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
