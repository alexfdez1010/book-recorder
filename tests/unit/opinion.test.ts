import { beforeEach, describe, expect, it, vi } from 'vitest';
import { newBookSchema, opinionSchema } from '@/lib/books/validation';

vi.mock('server-only', () => ({}));

const { update } = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: { book: { update } },
}));

const finishedBook = {
  title: 'The Left Hand of Darkness',
  author: 'Ursula K. Le Guin',
  pages: 304,
  category: 'Science Fiction',
  language: 'en' as const,
  status: 'finished' as const,
  finishedOn: '2026-09-10',
};

describe('opinionSchema', () => {
  it('accepts and trims an optional opinion', () => {
    expect(opinionSchema.parse('  A thoughtful reread.  ')).toBe(
      'A thoughtful reread.',
    );
  });

  it.each(['', '   ', null, undefined])(
    'normalizes blank value %j to undefined',
    (value) => {
      expect(opinionSchema.parse(value)).toBeUndefined();
    },
  );

  it('rejects opinions longer than 10,000 characters', () => {
    expect(opinionSchema.safeParse('x'.repeat(10_001)).success).toBe(false);
  });
});

describe('newBookSchema opinion handling', () => {
  it('includes a normalized opinion in book input', () => {
    const parsed = newBookSchema.parse({
      ...finishedBook,
      opinion: '  Beautiful world-building. ',
    });

    expect(parsed.opinion).toBe('Beautiful world-building.');
  });
});

describe('setBookOpinion', () => {
  beforeEach(() => update.mockReset());

  it.each(['A lasting impression', null])(
    'persists the opinion value %j for one id',
    async (opinion) => {
      update.mockResolvedValue({ id: 'book-1', opinion });
      const { setBookOpinion } = await import('@/lib/books/repository');

      await expect(setBookOpinion('book-1', opinion)).resolves.toEqual({
        id: 'book-1',
        opinion,
      });
      expect(update).toHaveBeenCalledWith({
        where: { id: 'book-1' },
        data: { opinion },
      });
    },
  );
});
