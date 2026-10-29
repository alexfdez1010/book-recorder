import type { BookLike } from './aggregate';

export type RecentPeriod = 7 | 30;

export interface PeriodTotals {
  books: number;
  pages: number;
  pagesPerDay: number;
  completionDays: number;
}

export interface RecentDay {
  date: string;
  previousDate: string;
  day: number;
  books: number;
  pages: number;
  previousPages: number;
  cumulativePages: number;
  previousCumulativePages: number;
}

export interface RecentPerformance {
  days: RecentPeriod;
  start: string;
  end: string;
  previousStart: string;
  previousEnd: string;
  current: PeriodTotals;
  previous: PeriodTotals;
  points: RecentDay[];
}

const DAY = 86_400_000;

/** Converts a UTC day index to an ISO calendar date without local-time effects. */
function isoDay(day: number): string {
  return new Date(day * DAY).toISOString().slice(0, 10);
}

/** Sums daily bins; calendar days, including zero-activity days, define the average. */
function totals(bins: { books: number; pages: number }[]): PeriodTotals {
  const books = bins.reduce((sum, bin) => sum + bin.books, 0);
  const pages = bins.reduce((sum, bin) => sum + bin.pages, 0);
  return {
    books,
    pages,
    pagesPerDay: Math.round((pages / bins.length) * 10) / 10,
    completionDays: bins.filter((bin) => bin.books > 0).length,
  };
}

/**
 * Compares the last 7 or 30 UTC calendar days, including today, to the preceding
 * equal window. Pages belong to finish dates, not reading sessions. No I/O or
 * mutation; invalid finish dates and dates after today are ignored.
 * @param books Finished books; callers exclude queued books before aggregation.
 * @param days Supported calendar window length.
 * @param now Explicit reference instant, so server and tests share one clock.
 * @returns Zero-filled daily bins, aligned cumulative series and period totals.
 * @throws RangeError for an invalid reference date or unsupported window.
 */
export function recentPerformance(
  books: Pick<BookLike, 'pages' | 'finishedOn'>[],
  days: RecentPeriod,
  now: Date,
): RecentPerformance {
  if (!Number.isFinite(now.getTime()) || (days !== 7 && days !== 30)) {
    throw new RangeError(
      'Recent performance requires a valid date and 7 or 30 days.',
    );
  }
  const end = Math.floor(now.getTime() / DAY);
  const start = end - days + 1;
  const previousStart = start - days;
  const bins = Array.from({ length: days * 2 }, () => ({ books: 0, pages: 0 }));
  for (const book of books) {
    const day = Math.floor(new Date(book.finishedOn).getTime() / DAY);
    if (!Number.isFinite(day) || day < previousStart || day > end) continue;
    const bin = bins[day - previousStart];
    bin.books += 1;
    bin.pages += book.pages;
  }
  const previousBins = bins.slice(0, days);
  const currentBins = bins.slice(days);
  let cumulativePages = 0;
  let previousCumulativePages = 0;
  const points = currentBins.map((bin, index) => {
    cumulativePages += bin.pages;
    previousCumulativePages += previousBins[index].pages;
    return {
      date: isoDay(start + index),
      previousDate: isoDay(previousStart + index),
      day: index + 1,
      ...bin,
      previousPages: previousBins[index].pages,
      cumulativePages,
      previousCumulativePages,
    };
  });
  return {
    days,
    start: isoDay(start),
    end: isoDay(end),
    previousStart: isoDay(previousStart),
    previousEnd: isoDay(start - 1),
    current: totals(currentBins),
    previous: totals(previousBins),
    points,
  };
}

/** Returns percentage change; null means a positive total has no prior baseline. */
export function periodChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}
