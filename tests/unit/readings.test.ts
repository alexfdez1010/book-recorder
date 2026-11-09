import { describe, expect, it } from 'vitest';
import { collectionEntries, readingEntries } from '@/lib/books/readings';
import {
  readingDateSchema,
  readingSchema,
} from '@/lib/books/reading-validation';
import { cumulativePages, booksPerMonth } from '@/lib/stats/aggregate';
import type { LibraryBook } from '@/lib/books/reading-types';

const book: LibraryBook = {
  id: 'book',
  title: 'A book',
  author: 'Author',
  pages: 400,
  language: 'es',
  category: 'Fiction',
  status: 'finished',
  finishedOn: new Date('2026-11-09'),
  rating: 5,
  opinion: 'Again',
  publicationDate: null,
  coverUrl: null,
  externalId: null,
  source: 'manual',
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2026-11-09'),
  readings: [
    {
      id: 'second',
      bookId: 'book',
      finishedOn: new Date('2026-11-09'),
      pages: 400,
      language: 'es',
      rating: 5,
      opinion: 'Again',
      createdAt: new Date('2026-11-09'),
      updatedAt: new Date('2026-11-09'),
    },
    {
      id: 'first',
      bookId: 'book',
      finishedOn: new Date('2020-02-01'),
      pages: 300,
      language: 'en',
      rating: 3,
      opinion: 'First',
      createdAt: new Date('2020-02-01'),
      updatedAt: new Date('2020-02-01'),
    },
  ],
};

describe('reading snapshots and collection views', () => {
  it('orders interleaved histories globally by completion date', () => {
    const other = {
      ...book,
      id: 'other-book',
      readings: [
        {
          ...book.readings[0],
          id: 'middle',
          bookId: 'other-book',
          finishedOn: new Date('2024-01-01'),
        },
      ],
    };
    expect(
      readingEntries([book, other]).map((entry) => entry.readingId),
    ).toEqual(['second', 'middle', 'first']);
  });
  it('keeps the book identity but uses each reading’s own data and key', () => {
    const original = structuredClone(book);
    const entries = readingEntries([book]);
    expect(
      entries.map(
        ({
          id,
          readingId,
          readingNumber,
          pages,
          language,
          rating,
          opinion,
        }) => ({
          id,
          readingId,
          readingNumber,
          pages,
          language,
          rating,
          opinion,
        }),
      ),
    ).toEqual([
      {
        id: 'book',
        readingId: 'second',
        readingNumber: 2,
        pages: 400,
        language: 'es',
        rating: 5,
        opinion: 'Again',
      },
      {
        id: 'book',
        readingId: 'first',
        readingNumber: 1,
        pages: 300,
        language: 'en',
        rating: 3,
        opinion: 'First',
      },
    ]);
    expect(book).toEqual(original);
    expect(cumulativePages(entries).at(-1)?.pages).toBe(700);
    expect(booksPerMonth(entries)).toEqual([
      { label: '2020-02', value: 1 },
      { label: '2026-11', value: 1 },
    ]);
  });

  it('shows every finish in the journal and one title in the author collection', () => {
    expect(collectionEntries([book], true)).toHaveLength(2);
    expect(collectionEntries([book], false)).toMatchObject([
      { readingId: 'second' },
    ]);
    expect(collectionEntries([], true)).toEqual([]);
    const queue = {
      ...book,
      readings: undefined,
      status: 'to-read',
      finishedOn: null,
    };
    expect(collectionEntries([queue], true)).toEqual([queue]);
  });
});

describe('reading validation', () => {
  const input = { finishedOn: '2026-11-09', pages: '300', language: 'es' };
  it('starts blank personal fields and normalizes whitespace without inheriting them', () => {
    expect(readingSchema.parse(input)).toMatchObject({
      pages: 300,
      rating: null,
      opinion: null,
    });
    expect(
      readingSchema.parse({
        ...input,
        rating: '4.5',
        opinion: '  Otra mirada\n  ',
      }),
    ).toMatchObject({ rating: 4.5, opinion: 'Otra mirada' });
    expect(
      readingSchema.parse({ ...input, rating: '', opinion: '   ' }),
    ).toMatchObject({ rating: null, opinion: null });
  });
  it.each([
    '2026-02-30',
    '2026-13-01',
    '2026-00-10',
    '2026-11-00',
    'invalid',
    '2026-1-1',
  ])('rejects invalid calendar date %s', (value) => {
    expect(readingDateSchema.safeParse(value).success).toBe(false);
  });
  it('accepts leap days and rejects invalid ratings, pages and oversized opinions', () => {
    expect(readingDateSchema.parse('2024-02-29')).toBe('2024-02-29');
    for (const changes of [
      { pages: 0 },
      { pages: 1.5 },
      { rating: 0 },
      { rating: 4.2 },
      { opinion: 'x'.repeat(10001) },
      { language: 'zz' },
    ]) {
      expect(readingSchema.safeParse({ ...input, ...changes }).success).toBe(
        false,
      );
    }
  });
});
