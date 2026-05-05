import {
  toDate,
  type BookLike,
  type CountEntry,
  type TimeseriesPoint,
} from './aggregate';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function validRating(r: number | null | undefined): r is number {
  return typeof r === 'number' && r >= 1 && r <= 5;
}

/** Distribution of ratings (1★..5★) plus an "Unrated" bucket. */
export function ratingDistribution(books: BookLike[]): CountEntry[] {
  const buckets: CountEntry[] = [
    { label: '1★', value: 0 },
    { label: '2★', value: 0 },
    { label: '3★', value: 0 },
    { label: '4★', value: 0 },
    { label: '5★', value: 0 },
    { label: 'Unrated', value: 0 },
  ];
  for (const b of books) {
    if (validRating(b.rating)) buckets[b.rating - 1].value++;
    else buckets[5].value++;
  }
  return buckets;
}

/**
 * Mean rating per category, restricted to categories with at least one rated
 * book. Sorted descending by rating.
 */
export function averageRatingByCategory(books: BookLike[]): CountEntry[] {
  const acc = new Map<string, { total: number; count: number }>();
  for (const b of books) {
    if (!validRating(b.rating)) continue;
    const key = b.category || 'Unknown';
    const cur = acc.get(key) ?? { total: 0, count: 0 };
    cur.total += b.rating;
    cur.count++;
    acc.set(key, cur);
  }
  return [...acc.entries()]
    .map(([label, { total, count }]) => ({
      label,
      value: Math.round((total / count) * 10) / 10,
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

/** Total pages read bucketed by UTC weekday (Sun→Sat). */
export function pagesPerWeekday(books: BookLike[]): CountEntry[] {
  const sums = Array(7).fill(0) as number[];
  for (const b of books) sums[toDate(b.finishedOn).getUTCDay()] += b.pages;
  return WEEKDAYS.map((d, i) => ({ label: d, value: sums[i] }));
}

/**
 * Books bucketed by publication decade. Skips books without publicationDate.
 * Sorted ascending by decade.
 */
export function publicationDecadeDistribution(books: BookLike[]): CountEntry[] {
  const counts = new Map<number, number>();
  for (const b of books) {
    if (!b.publicationDate) continue;
    const year = toDate(b.publicationDate).getUTCFullYear();
    if (!Number.isFinite(year)) continue;
    const decade = Math.floor(year / 10) * 10;
    counts.set(decade, (counts.get(decade) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([d, value]) => ({ label: `${d}s`, value }));
}

/**
 * Cumulative finished-book count over time. The `pages` field is reused as
 * the running total to stay compatible with TimeseriesPoint and LinePanel.
 */
export function cumulativeBooks(books: BookLike[]): TimeseriesPoint[] {
  if (books.length === 0) return [];
  const sorted = [...books].sort(
    (a, b) => toDate(a.finishedOn).getTime() - toDate(b.finishedOn).getTime(),
  );
  const points: TimeseriesPoint[] = [];
  let total = 0;
  for (const b of sorted) {
    total++;
    const date = toDate(b.finishedOn).toISOString().slice(0, 10);
    const last = points[points.length - 1];
    if (last && last.date === date) last.pages = total;
    else points.push({ date, pages: total });
  }
  return points;
}

export interface YearOverYearRow {
  month: string;
  [year: string]: number | string;
}

/**
 * Year-over-year monthly finishes. Each row covers a calendar month with one
 * column per year (e.g. `{ month: 'Jan', '2024': 3, '2025': 5 }`). Returns
 * the rows alongside the sorted list of years for charting.
 */
export function booksPerMonthByYear(books: BookLike[]): {
  rows: YearOverYearRow[];
  years: string[];
} {
  const byYear = new Map<string, number[]>();
  for (const b of books) {
    const d = toDate(b.finishedOn);
    const y = d.getUTCFullYear().toString();
    if (!byYear.has(y)) byYear.set(y, Array(12).fill(0) as number[]);
    byYear.get(y)![d.getUTCMonth()]++;
  }
  const years = [...byYear.keys()].sort();
  const rows: YearOverYearRow[] = MONTHS.map((month, i) => {
    const row: YearOverYearRow = { month };
    for (const y of years) row[y] = byYear.get(y)![i];
    return row;
  });
  return { rows, years };
}
