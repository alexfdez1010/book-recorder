import { describe, expect, it } from 'vitest';
import { selectBookCovers } from '@/lib/books/covers';
import type { BookCandidate } from '@/lib/books/types';

/** Creates a catalogue result without coupling fixtures to external services. */
function candidate(coverUrl: string | null, title = 'Book'): BookCandidate {
  return {
    title,
    author: 'Author',
    coverUrl,
    source: 'openlibrary',
    externalId: title,
    publicationDate: null,
    pages: 123,
    category: 'Fiction',
    language: 'en',
  };
}

describe('selectBookCovers', () => {
  it('ignores missing, malformed and non-HTTP image URLs', () => {
    expect(
      selectBookCovers(
        [
          null,
          '',
          'invalid',
          'javascript:alert(1)',
          'data:image/png;base64,abc',
        ].map((url) => candidate(url)),
      ),
    ).toEqual([]);
  });

  it('deduplicates normalized URLs, preserves order and exposes only preview fields', () => {
    const input = [
      candidate('https://covers.example/1', 'First'),
      candidate('https://covers.example/1', 'Duplicate'),
      candidate('http://covers.example/2', 'Second'),
    ];
    const original = structuredClone(input);
    expect(selectBookCovers(input)).toEqual([
      {
        title: 'First',
        author: 'Author',
        coverUrl: 'https://covers.example/1',
      },
      {
        title: 'Second',
        author: 'Author',
        coverUrl: 'http://covers.example/2',
      },
    ]);
    expect(input).toEqual(original);
  });

  it('handles an empty catalogue', () => {
    expect(selectBookCovers([])).toEqual([]);
  });
});
