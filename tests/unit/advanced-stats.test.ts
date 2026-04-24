import { describe, expect, it } from 'vitest';
import {
  ageWhenReadHistogram,
  averageDaysBetweenFinishes,
  averagePagesPerBook,
  booksPerYear,
  favoriteAuthor,
  longestBook,
  pageLengthHistogram,
  pagesByCategory,
  pagesPerMonth,
  rolling30DayPages,
  topAuthors,
  weekdayFinishes,
} from '@/lib/stats/advanced';

const sample = [
  {
    title: 'Alpha',
    pages: 100,
    category: 'Sci-Fi',
    language: 'en',
    author: 'Asimov',
    publicationDate: '2024-01-01',
    finishedOn: '2026-01-10', // Sat
  },
  {
    title: 'Beta',
    pages: 200,
    category: 'Sci-Fi',
    language: 'en',
    author: 'Asimov',
    publicationDate: '2020-06-01',
    finishedOn: '2026-01-20', // Tue
  },
  {
    title: 'Gamma',
    pages: 900,
    category: 'History',
    language: 'es',
    author: 'Herodotus',
    publicationDate: '1900-01-01',
    finishedOn: '2026-02-05', // Thu
  },
];

describe('booksPerYear', () => {
  it('buckets by year, ascending', () => {
    expect(booksPerYear(sample)).toEqual([{ label: '2026', value: 3 }]);
  });
  it('returns [] on empty', () => {
    expect(booksPerYear([])).toEqual([]);
  });
});

describe('pagesPerMonth', () => {
  it('sums pages by year-month', () => {
    expect(pagesPerMonth(sample)).toEqual([
      { label: '2026-01', value: 300 },
      { label: '2026-02', value: 900 },
    ]);
  });
});

describe('weekdayFinishes', () => {
  it('buckets finishes by UTC day of week', () => {
    const r = weekdayFinishes(sample);
    expect(r.find((e) => e.label === 'Sat')?.value).toBe(1);
    expect(r.find((e) => e.label === 'Tue')?.value).toBe(1);
    expect(r.find((e) => e.label === 'Thu')?.value).toBe(1);
    expect(r.find((e) => e.label === 'Mon')?.value).toBe(0);
  });
});

describe('pageLengthHistogram', () => {
  it('buckets by length', () => {
    const r = pageLengthHistogram(sample);
    expect(r.find((e) => e.label === '<200')?.value).toBe(1);
    expect(r.find((e) => e.label === '200-400')?.value).toBe(1);
    expect(r.find((e) => e.label === '800+')?.value).toBe(1);
    expect(r.find((e) => e.label === '400-600')?.value).toBe(0);
  });
});

describe('rolling30DayPages', () => {
  it('sums trailing 30d pages at each finish', () => {
    const r = rolling30DayPages(sample);
    expect(r).toHaveLength(3);
    // Jan 10 alone
    expect(r[0]).toEqual({ date: '2026-01-10', pages: 100 });
    // Jan 20 trails include Jan 10
    expect(r[1]).toEqual({ date: '2026-01-20', pages: 300 });
    // Feb 5: 26d back includes both Jan 10 and Jan 20
    expect(r[2]).toEqual({ date: '2026-02-05', pages: 1200 });
  });

  it('returns [] on empty', () => {
    expect(rolling30DayPages([])).toEqual([]);
  });
});

describe('pagesByCategory', () => {
  it('totals pages grouped by category, descending', () => {
    expect(pagesByCategory(sample)).toEqual([
      { label: 'History', value: 900 },
      { label: 'Sci-Fi', value: 300 },
    ]);
  });
});

describe('topAuthors', () => {
  it('ranks by book count', () => {
    expect(topAuthors(sample)).toEqual([
      { label: 'Asimov', value: 2 },
      { label: 'Herodotus', value: 1 },
    ]);
  });

  it('caps at n', () => {
    expect(topAuthors(sample, 1)).toEqual([{ label: 'Asimov', value: 2 }]);
  });
});

describe('ageWhenReadHistogram', () => {
  it('buckets years between publication and finish', () => {
    const r = ageWhenReadHistogram(sample);
    // Alpha 2024-01→2026-01 ~2y; Beta 2020-06→2026-01 ~5.6y; Gamma 1900→2026 ~126y
    expect(r.find((e) => e.label === '<1y')?.value).toBe(0);
    expect(r.find((e) => e.label === '1-5y')?.value).toBe(1);
    expect(r.find((e) => e.label === '5-20y')?.value).toBe(1);
    expect(r.find((e) => e.label === '50y+')?.value).toBe(1);
  });

  it('ignores books without publicationDate', () => {
    const r = ageWhenReadHistogram([
      { ...sample[0], publicationDate: null },
    ]);
    expect(r.every((e) => e.value === 0)).toBe(true);
  });
});

describe('averagePagesPerBook', () => {
  it('rounds to int', () => {
    expect(averagePagesPerBook(sample)).toBe(400); // 1200/3
  });
  it('returns 0 when empty', () => {
    expect(averagePagesPerBook([])).toBe(0);
  });
});

describe('averageDaysBetweenFinishes', () => {
  it('mean gap across consecutive finishes', () => {
    // Gaps: 10d (Jan10→Jan20), 16d (Jan20→Feb5). Mean = 13.
    expect(averageDaysBetweenFinishes(sample)).toBe(13);
  });
  it('returns 0 with <2 books', () => {
    expect(averageDaysBetweenFinishes([sample[0]])).toBe(0);
  });
});

describe('longestBook', () => {
  it('returns biggest by pages', () => {
    expect(longestBook(sample)).toEqual({ title: 'Gamma', pages: 900 });
  });
  it('null when empty', () => {
    expect(longestBook([])).toBeNull();
  });
});

describe('favoriteAuthor', () => {
  it('returns most-read author', () => {
    expect(favoriteAuthor(sample)).toEqual({ author: 'Asimov', count: 2 });
  });
  it('null when empty', () => {
    expect(favoriteAuthor([])).toBeNull();
  });
});
