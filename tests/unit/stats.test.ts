import { describe, expect, it } from 'vitest';
import {
  booksPerMonth,
  cumulativePages,
  distribution,
  meanPagesPerDay,
} from '@/lib/stats/aggregate';

const sample = [
  { pages: 100, category: 'Sci-Fi', language: 'en', finishedOn: '2026-01-10' },
  { pages: 200, category: 'Sci-Fi', language: 'en', finishedOn: '2026-01-20' },
  { pages: 150, category: 'History', language: 'es', finishedOn: '2026-02-05' },
];

describe('booksPerMonth', () => {
  it('buckets by year-month and sorts ascending', () => {
    expect(booksPerMonth(sample)).toEqual([
      { label: '2026-01', value: 2 },
      { label: '2026-02', value: 1 },
    ]);
  });

  it('returns [] for empty input', () => {
    expect(booksPerMonth([])).toEqual([]);
  });
});

describe('distribution', () => {
  it('counts categories and sorts descending by count', () => {
    expect(distribution(sample, 'category')).toEqual([
      { label: 'Sci-Fi', value: 2 },
      { label: 'History', value: 1 },
    ]);
  });

  it('counts languages', () => {
    expect(distribution(sample, 'language')).toEqual([
      { label: 'en', value: 2 },
      { label: 'es', value: 1 },
    ]);
  });
});

describe('cumulativePages', () => {
  it('produces a monotonic cumulative series', () => {
    const pts = cumulativePages(sample);
    expect(pts.map((p) => p.pages)).toEqual([100, 300, 450]);
    expect(pts[0].date).toBe('2026-01-10');
  });
});

describe('meanPagesPerDay', () => {
  it('divides total pages by day span', () => {
    // Jan 10 → Feb 5 = 26 days, 450 pages
    expect(meanPagesPerDay(sample)).toBeCloseTo(450 / 26, 1);
  });

  it('returns 0 when empty', () => {
    expect(meanPagesPerDay([])).toBe(0);
  });
});
