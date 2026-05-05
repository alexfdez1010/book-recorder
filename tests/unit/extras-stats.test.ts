import { describe, expect, it } from 'vitest';
import {
  averageRatingByCategory,
  booksPerMonthByYear,
  cumulativeBooks,
  pagesPerWeekday,
  publicationDecadeDistribution,
  ratingDistribution,
} from '@/lib/stats/extras';

const sample = [
  {
    title: 'Alpha',
    pages: 100,
    category: 'Sci-Fi',
    language: 'en',
    author: 'Asimov',
    publicationDate: '2024-01-01',
    finishedOn: '2025-01-10', // Fri
    rating: 5,
  },
  {
    title: 'Beta',
    pages: 200,
    category: 'Sci-Fi',
    language: 'en',
    author: 'Asimov',
    publicationDate: '2018-06-01',
    finishedOn: '2025-01-20', // Mon
    rating: 3,
  },
  {
    title: 'Gamma',
    pages: 900,
    category: 'History',
    language: 'es',
    author: 'Herodotus',
    publicationDate: '1962-01-01',
    finishedOn: '2026-02-05', // Thu
    rating: null,
  },
  {
    title: 'Delta',
    pages: 300,
    category: 'History',
    language: 'es',
    author: 'Tucídides',
    publicationDate: null,
    finishedOn: '2026-02-12', // Thu
    rating: 4,
  },
];

describe('ratingDistribution', () => {
  it('counts each star bucket and Unrated', () => {
    const r = ratingDistribution(sample);
    expect(r).toEqual([
      { label: '1★', value: 0 },
      { label: '2★', value: 0 },
      { label: '3★', value: 1 },
      { label: '4★', value: 1 },
      { label: '5★', value: 1 },
      { label: 'Unrated', value: 1 },
    ]);
  });

  it('returns six zero buckets on empty input', () => {
    const r = ratingDistribution([]);
    expect(r).toHaveLength(6);
    expect(r.every((e) => e.value === 0)).toBe(true);
  });
});

describe('averageRatingByCategory', () => {
  it('averages rated books per category, descending', () => {
    expect(averageRatingByCategory(sample)).toEqual([
      { label: 'History', value: 4 }, // only Delta is rated in History
      { label: 'Sci-Fi', value: 4 }, // (5+3)/2
    ]);
  });

  it('skips categories with no rated books', () => {
    const r = averageRatingByCategory([
      { ...sample[0], rating: null },
      { ...sample[2], rating: null },
    ]);
    expect(r).toEqual([]);
  });
});

describe('pagesPerWeekday', () => {
  it('sums pages by UTC weekday', () => {
    const r = pagesPerWeekday(sample);
    expect(r.find((e) => e.label === 'Fri')?.value).toBe(100); // Alpha
    expect(r.find((e) => e.label === 'Mon')?.value).toBe(200); // Beta
    expect(r.find((e) => e.label === 'Thu')?.value).toBe(1200); // Gamma + Delta
    expect(r.find((e) => e.label === 'Sun')?.value).toBe(0);
  });
});

describe('publicationDecadeDistribution', () => {
  it('buckets by decade ascending and skips missing dates', () => {
    expect(publicationDecadeDistribution(sample)).toEqual([
      { label: '1960s', value: 1 },
      { label: '2010s', value: 1 },
      { label: '2020s', value: 1 },
    ]);
  });

  it('returns [] when no books have publicationDate', () => {
    expect(
      publicationDecadeDistribution([{ ...sample[0], publicationDate: null }]),
    ).toEqual([]);
  });
});

describe('cumulativeBooks', () => {
  it('counts running total of books over time', () => {
    const r = cumulativeBooks(sample);
    expect(r).toEqual([
      { date: '2025-01-10', pages: 1 },
      { date: '2025-01-20', pages: 2 },
      { date: '2026-02-05', pages: 3 },
      { date: '2026-02-12', pages: 4 },
    ]);
  });

  it('collapses same-day finishes to a single point', () => {
    const r = cumulativeBooks([
      { ...sample[0], finishedOn: '2025-01-10' },
      { ...sample[1], finishedOn: '2025-01-10' },
    ]);
    expect(r).toEqual([{ date: '2025-01-10', pages: 2 }]);
  });

  it('returns [] on empty', () => {
    expect(cumulativeBooks([])).toEqual([]);
  });
});

describe('booksPerMonthByYear', () => {
  it('returns 12 rows with one column per year', () => {
    const { rows, years } = booksPerMonthByYear(sample);
    expect(years).toEqual(['2025', '2026']);
    expect(rows).toHaveLength(12);
    const jan = rows.find((r) => r.month === 'Jan')!;
    expect(jan['2025']).toBe(2);
    expect(jan['2026']).toBe(0);
    const feb = rows.find((r) => r.month === 'Feb')!;
    expect(feb['2025']).toBe(0);
    expect(feb['2026']).toBe(2);
  });

  it('handles empty input', () => {
    const { rows, years } = booksPerMonthByYear([]);
    expect(years).toEqual([]);
    expect(rows).toHaveLength(12);
  });
});
