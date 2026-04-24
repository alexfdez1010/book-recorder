import { toDate, yearMonth, type BookLike, type CountEntry, type TimeseriesPoint } from './aggregate';

const DAY_MS = 86_400_000;
const YEAR_MS = 365.25 * DAY_MS;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** Books finished per calendar year, ascending. */
export function booksPerYear(books: BookLike[]): CountEntry[] {
  const m = new Map<string, number>();
  for (const b of books) {
    const k = toDate(b.finishedOn).toISOString().slice(0, 4);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

/** Total pages finished per calendar month. */
export function pagesPerMonth(books: BookLike[]): CountEntry[] {
  const m = new Map<string, number>();
  for (const b of books) {
    const k = yearMonth(toDate(b.finishedOn));
    m.set(k, (m.get(k) ?? 0) + b.pages);
  }
  return [...m.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

/** Finishes bucketed by day-of-week (UTC, Sun→Sat). */
export function weekdayFinishes(books: BookLike[]): CountEntry[] {
  const counts = Array(7).fill(0) as number[];
  for (const b of books) counts[toDate(b.finishedOn).getUTCDay()]++;
  return WEEKDAYS.map((d, i) => ({ label: d, value: counts[i] }));
}

/** Count of books bucketed by page length. */
export function pageLengthHistogram(books: BookLike[]): CountEntry[] {
  const edges = [0, 200, 400, 600, 800, Infinity];
  const labels = ['<200', '200-400', '400-600', '600-800', '800+'];
  return labels.map((label, i) => ({
    label,
    value: books.filter((b) => b.pages >= edges[i] && b.pages < edges[i + 1]).length,
  }));
}

/**
 * Rolling 30-day page velocity, sampled at every finish date.
 * Each point is the sum of pages finished in the trailing 30 days ending on that date.
 */
export function rolling30DayPages(books: BookLike[]): TimeseriesPoint[] {
  if (books.length === 0) return [];
  const sorted = [...books].sort(
    (a, b) => toDate(a.finishedOn).getTime() - toDate(b.finishedOn).getTime(),
  );
  return sorted.map((_, i) => {
    const end = toDate(sorted[i].finishedOn).getTime();
    const start = end - 30 * DAY_MS;
    let sum = 0;
    for (let j = 0; j <= i; j++) {
      const t = toDate(sorted[j].finishedOn).getTime();
      if (t >= start && t <= end) sum += sorted[j].pages;
    }
    return { date: toDate(sorted[i].finishedOn).toISOString().slice(0, 10), pages: sum };
  });
}

/** Total pages by category, descending. */
export function pagesByCategory(books: BookLike[]): CountEntry[] {
  const m = new Map<string, number>();
  for (const b of books) {
    const k = b.category || 'Unknown';
    m.set(k, (m.get(k) ?? 0) + b.pages);
  }
  return [...m.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value }));
}

/** Top-N authors by book count, descending. */
export function topAuthors(books: BookLike[], n = 8): CountEntry[] {
  const m = new Map<string, number>();
  for (const b of books) {
    const a = (b.author ?? '').trim() || 'Unknown';
    m.set(a, (m.get(a) ?? 0) + 1);
  }
  return [...m.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([label, value]) => ({ label, value }));
}

/** Distribution of book age at time of reading (years between publication and finish). */
export function ageWhenReadHistogram(books: BookLike[]): CountEntry[] {
  const edges = [0, 1, 5, 20, 50, Infinity];
  const labels = ['<1y', '1-5y', '5-20y', '20-50y', '50y+'];
  const aged = books
    .filter((b) => b.publicationDate)
    .map((b) => ({
      age: (toDate(b.finishedOn).getTime() - toDate(b.publicationDate!).getTime()) / YEAR_MS,
    }))
    .filter((e) => e.age >= 0);
  return labels.map((label, i) => ({
    label,
    value: aged.filter((e) => e.age >= edges[i] && e.age < edges[i + 1]).length,
  }));
}

/** Mean pages per book, rounded. 0 when empty. */
export function averagePagesPerBook(books: BookLike[]): number {
  if (books.length === 0) return 0;
  return Math.round(books.reduce((s, b) => s + b.pages, 0) / books.length);
}

/** Mean days between consecutive finishes. 0 when fewer than 2 books. */
export function averageDaysBetweenFinishes(books: BookLike[]): number {
  if (books.length < 2) return 0;
  const sorted = [...books]
    .map((b) => toDate(b.finishedOn).getTime())
    .sort((a, b) => a - b);
  let total = 0;
  for (let i = 1; i < sorted.length; i++) total += sorted[i] - sorted[i - 1];
  return Math.round((total / (sorted.length - 1) / DAY_MS) * 10) / 10;
}

/** Longest book in the corpus (by pages). Null when empty. */
export function longestBook(books: BookLike[]): { title: string; pages: number } | null {
  if (books.length === 0) return null;
  const winner = books.reduce((a, b) => (b.pages > a.pages ? b : a));
  return { title: winner.title ?? 'Untitled', pages: winner.pages };
}

/** Most-read author (by count). Null when empty. */
export function favoriteAuthor(books: BookLike[]): { author: string; count: number } | null {
  const ranked = topAuthors(books, 1);
  if (ranked.length === 0) return null;
  return { author: ranked[0].label, count: ranked[0].value };
}
