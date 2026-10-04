import { describe, expect, it, vi } from 'vitest';
import { localDate } from '@/lib/books/local-date';

describe('localDate', () => {
  it.each([
    [new Date(2026, 9, 4, 0, 15), '2026-10-04'],
    [new Date(2027, 0, 1, 0, 1), '2027-01-01'],
    [new Date(2024, 1, 29, 23, 59), '2024-02-29'],
  ])('formats the local calendar with zero padding', (date, expected) => {
    expect(localDate(date)).toBe(expected);
  });

  it('uses now when no date is supplied', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(2026, 9, 4, 0, 15));
      expect(localDate()).toBe('2026-10-04');
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects invalid dates', () => {
    expect(() => localDate(new Date('invalid'))).toThrow(RangeError);
  });

  it.each([
    ['Europe/Madrid', '2026-10-03T22:15:00Z', '2026-10-04'],
    ['America/Los_Angeles', '2027-01-01T07:15:00Z', '2026-12-31'],
  ])(
    'uses the reader calendar in %s at midnight',
    (zone, instant, expected) => {
      vi.stubEnv('TZ', zone);
      try {
        expect(localDate(new Date(instant))).toBe(expected);
      } finally {
        vi.unstubAllEnvs();
      }
    },
  );
});
