export interface BookLike {
  pages: number;
  category: string;
  language: string;
  finishedOn: Date | string;
  author?: string;
  publicationDate?: Date | string | null;
  title?: string;
}

export interface CountEntry {
  label: string;
  value: number;
}

export interface TimeseriesPoint {
  date: string;
  pages: number;
}

export function toDate(v: Date | string): Date {
  return v instanceof Date ? v : new Date(v);
}

export function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function yearMonth(d: Date): string {
  return d.toISOString().slice(0, 7);
}

/** Books finished per calendar month, sorted ascending by month. */
export function booksPerMonth(books: BookLike[]): CountEntry[] {
  const counts = new Map<string, number>();
  for (const b of books) {
    const key = yearMonth(toDate(b.finishedOn));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

export function distribution(books: BookLike[], key: 'category' | 'language'): CountEntry[] {
  const counts = new Map<string, number>();
  for (const b of books) {
    const k = b[key] || 'Unknown';
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value }));
}

/** Cumulative pages read across time, one point per distinct finished date. */
export function cumulativePages(books: BookLike[]): TimeseriesPoint[] {
  if (books.length === 0) return [];
  const sorted = [...books].sort(
    (a, b) => toDate(a.finishedOn).getTime() - toDate(b.finishedOn).getTime(),
  );
  const points: TimeseriesPoint[] = [];
  let total = 0;
  for (const b of sorted) {
    total += b.pages;
    const date = ymd(toDate(b.finishedOn));
    const last = points[points.length - 1];
    if (last && last.date === date) last.pages = total;
    else points.push({ date, pages: total });
  }
  return points;
}

/**
 * Mean pages read per day, spanning from the earliest to the latest finishedOn
 * date (inclusive). Returns 0 if there are fewer than two books or the span
 * collapses to a single day.
 */
export function meanPagesPerDay(books: BookLike[]): number {
  if (books.length === 0) return 0;
  const dates = books.map((b) => toDate(b.finishedOn).getTime());
  const span = Math.max(...dates) - Math.min(...dates);
  const days = Math.max(1, Math.round(span / 86_400_000));
  const totalPages = books.reduce((sum, b) => sum + b.pages, 0);
  return Math.round((totalPages / days) * 10) / 10;
}
