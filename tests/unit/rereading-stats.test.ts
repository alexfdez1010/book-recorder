import { describe, expect, it } from 'vitest';
import { rereadsByYear } from '@/lib/stats/rereading';

describe('annual first reading and reread counts', () => {
  it('counts every later reading, including multiple rereads within the same year', () => {
    const readings = [
      { finishedOn: '2026-11-09', readingNumber: 3 },
      { finishedOn: '2020-01-10', readingNumber: 1 },
      { finishedOn: '2026-02-05', readingNumber: 2 },
      { finishedOn: '2026-04-01', readingNumber: 1 },
    ];
    const before = structuredClone(readings);
    expect(rereadsByYear(readings)).toEqual([
      { year: '2020', firstReads: 1, rereads: 0 },
      { year: '2026', firstReads: 1, rereads: 2 },
    ]);
    expect(readings).toEqual(before);
  });

  it('uses existing ordinals even when the first reading is outside the year of its reread', () => {
    expect(
      rereadsByYear([{ finishedOn: new Date('2026-01-01'), readingNumber: 2 }]),
    ).toEqual([{ year: '2026', firstReads: 0, rereads: 1 }]);
  });

  it('counts distinct first readings separately without title-based deduplication', () => {
    expect(
      rereadsByYear([
        { finishedOn: '2026-01-01', readingNumber: 1 },
        { finishedOn: '2026-01-01', readingNumber: 1 },
      ]),
    ).toEqual([{ year: '2026', firstReads: 2, rereads: 0 }]);
  });

  it('groups using UTC years and skips invalid dates', () => {
    expect(
      rereadsByYear([
        { finishedOn: '2025-12-31T23:30:00-02:00', readingNumber: 1 },
        { finishedOn: 'invalid', readingNumber: 2 },
      ]),
    ).toEqual([{ year: '2026', firstReads: 1, rereads: 0 }]);
  });

  it('returns no invented years for an empty history', () => {
    expect(rereadsByYear([])).toEqual([]);
  });
});
