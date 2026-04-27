import { describe, expect, it } from 'vitest';
import { newBookSchema, markFinishedSchema } from '@/lib/books/validation';
import { BOOK_STATUSES, isBookStatus } from '@/lib/books/status';

const finished = {
  title: 'Dune',
  author: 'Frank Herbert',
  pages: '688',
  category: 'Science Fiction' as const,
  language: 'en' as const,
  status: 'finished' as const,
  finishedOn: '2026-04-20',
};

const toRead = {
  title: 'Project Hail Mary',
  author: 'Andy Weir',
  pages: '496',
  category: 'Science Fiction' as const,
  language: 'en' as const,
  status: 'to-read' as const,
};

describe('BOOK_STATUSES', () => {
  it('exposes finished and to-read', () => {
    expect([...BOOK_STATUSES]).toEqual(['finished', 'to-read']);
  });

  it('isBookStatus accepts only known values', () => {
    expect(isBookStatus('finished')).toBe(true);
    expect(isBookStatus('to-read')).toBe(true);
    expect(isBookStatus('reading')).toBe(false);
    expect(isBookStatus(undefined)).toBe(false);
  });
});

describe('newBookSchema status handling', () => {
  it('defaults status to finished and accepts a finished book with finishedOn', () => {
    const parsed = newBookSchema.safeParse({ ...finished, status: undefined });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe('finished');
      expect(parsed.data.finishedOn).toBe('2026-04-20');
    }
  });

  it('rejects a finished book without finishedOn', () => {
    const parsed = newBookSchema.safeParse({ ...finished, finishedOn: '' });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((i) => i.path.includes('finishedOn'))).toBe(true);
    }
  });

  it('accepts a to-read book with no finishedOn', () => {
    const parsed = newBookSchema.safeParse(toRead);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe('to-read');
      expect(parsed.data.finishedOn ?? '').toBe('');
    }
  });

  it('still validates page count and category for to-read books', () => {
    const parsed = newBookSchema.safeParse({ ...toRead, pages: '0' });
    expect(parsed.success).toBe(false);
  });
});

describe('markFinishedSchema', () => {
  it('accepts a YYYY-MM-DD date', () => {
    expect(markFinishedSchema.safeParse({ finishedOn: '2026-04-27' }).success).toBe(true);
  });

  it('rejects malformed dates', () => {
    expect(markFinishedSchema.safeParse({ finishedOn: '27/04/2026' }).success).toBe(false);
    expect(markFinishedSchema.safeParse({ finishedOn: '' }).success).toBe(false);
  });
});
