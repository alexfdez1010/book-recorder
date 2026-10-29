import { describe, expect, it } from 'vitest';
import { periodChange, recentPerformance } from '@/lib/stats/recent';

const now = new Date('2026-10-29T13:30:00Z');

/** Builds a minimal finished-book fixture with an explicit date and page count. */
function book(finishedOn: string | Date, pages = 100) {
  return { finishedOn, pages };
}

describe('recentPerformance', () => {
  it('includes today and the first day, with an immediately preceding equal window', () => {
    const result = recentPerformance(
      [
        book('2026-10-15', 999),
        book('2026-10-16', 100),
        book('2026-10-22T23:59:59.999Z', 200),
        book('2026-10-23', 300),
        book('2026-10-29T23:59:59.999Z', 400),
        book('2026-10-30', 999),
      ],
      7,
      now,
    );
    expect(result).toMatchObject({
      start: '2026-10-23',
      end: '2026-10-29',
      previousStart: '2026-10-16',
      previousEnd: '2026-10-22',
      current: { books: 2, pages: 700, pagesPerDay: 100, completionDays: 2 },
      previous: { books: 2, pages: 300, pagesPerDay: 42.9, completionDays: 2 },
    });
    expect(result.points).toHaveLength(7);
    expect(result.points.map((point) => point.pages)).toEqual([
      300, 0, 0, 0, 0, 0, 400,
    ]);
    expect(result.points.map((point) => point.cumulativePages)).toEqual([
      300, 300, 300, 300, 300, 300, 700,
    ]);
    expect(result.points.at(-1)?.previousCumulativePages).toBe(300);
  });

  it('returns complete zero-filled windows for empty data without inventing growth', () => {
    const result = recentPerformance([], 30, now);
    expect(result.start).toBe('2026-09-30');
    expect(result.previousStart).toBe('2026-08-31');
    expect(result.points).toHaveLength(30);
    expect(result.current).toEqual({
      books: 0,
      pages: 0,
      pagesPerDay: 0,
      completionDays: 0,
    });
    expect(result.previous).toEqual(result.current);
    expect(
      result.points.every(
        (point) => point.pages === 0 && point.previousPages === 0,
      ),
    ).toBe(true);
  });

  it('keeps the 30-day boundary and prior window disjoint across month ends', () => {
    const result = recentPerformance(
      [
        book('2026-08-30', 999),
        book('2026-08-31', 100),
        book('2026-09-29T23:59:59.999Z', 200),
        book('2026-09-30', 300),
        book('2026-10-29', 400),
        book('2026-10-30', 999),
      ],
      30,
      now,
    );
    expect(result.previous.pages).toBe(300);
    expect(result.current.pages).toBe(700);
    expect(result.points[0]).toMatchObject({
      date: '2026-09-30',
      previousDate: '2026-08-31',
      pages: 300,
      previousPages: 100,
    });
  });

  it('counts multiple finishes on one day as one completion day', () => {
    const result = recentPerformance(
      [book('2026-10-29', 75), book('2026-10-29', 125)],
      7,
      now,
    );
    expect(result.current).toEqual({
      books: 2,
      pages: 200,
      pagesPerDay: 28.6,
      completionDays: 1,
    });
    expect(result.points.at(-1)?.books).toBe(2);
  });

  it('normalizes offset timestamps and Date instances to UTC days', () => {
    const result = recentPerformance(
      [
        book('2026-10-23T00:30:00+02:00', 50),
        book('2026-10-22T23:30:00-02:00', 75),
        book(new Date('2026-10-29T00:00:00Z'), 100),
      ],
      7,
      new Date('2026-10-30T00:30:00+02:00'),
    );
    expect(result.current.pages).toBe(175);
    expect(result.previous.pages).toBe(50);
    expect(result.end).toBe('2026-10-29');
  });

  it('crosses leap days and year boundaries without changing window lengths', () => {
    const leap = recentPerformance(
      [book('2024-02-29', 150)],
      7,
      new Date('2024-03-03T12:00:00Z'),
    );
    expect(leap.start).toBe('2024-02-26');
    expect(leap.points[3].date).toBe('2024-02-29');
    expect(leap.current.pages).toBe(150);
    const year = recentPerformance(
      [book('2025-12-31', 220)],
      30,
      new Date('2026-01-03T12:00:00Z'),
    );
    expect(year.start).toBe('2025-12-05');
    expect(year.points).toHaveLength(30);
    expect(year.current.pages).toBe(220);
  });

  it('is independent of input order and does not mutate books or dates', () => {
    const books = [book(new Date('2026-10-29'), 200), book('2026-10-23', 300)];
    const before = structuredClone(books);
    expect(recentPerformance(books, 7, now)).toEqual(
      recentPerformance([...books].reverse(), 7, now),
    );
    expect(books).toEqual(before);
    expect(now.toISOString()).toBe('2026-10-29T13:30:00.000Z');
  });

  it('ignores malformed finish dates and rejects malformed reference dates', () => {
    expect(recentPerformance([book('invalid')], 7, now).current.books).toBe(0);
    expect(() => recentPerformance([], 7, new Date('invalid'))).toThrow(
      RangeError,
    );
    expect(() => recentPerformance([], 14 as 7, now)).toThrow(RangeError);
  });
});

describe('periodChange', () => {
  it('handles zero baselines, growth, decline and unchanged totals', () => {
    expect(periodChange(0, 0)).toBe(0);
    expect(periodChange(100, 0)).toBeNull();
    expect(periodChange(300, 200)).toBe(50);
    expect(periodChange(50, 200)).toBe(-75);
    expect(periodChange(0, 200)).toBe(-100);
    expect(periodChange(200, 200)).toBe(0);
  });
});
