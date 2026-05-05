import { describe, expect, it } from 'vitest';
import { mergeCandidates } from '@/lib/books/search';
import type { BookCandidate } from '@/lib/books/types';

function make(over: Partial<BookCandidate>): BookCandidate {
  return {
    source: 'openlibrary',
    externalId: 'x',
    title: 'Dune',
    author: 'Frank Herbert',
    publicationDate: null,
    pages: null,
    coverUrl: null,
    category: 'Other',
    language: null,
    ...over,
  };
}

describe('mergeCandidates', () => {
  it('returns the primary list when secondary is empty', () => {
    const a = make({ externalId: 'a' });
    expect(mergeCandidates([a], [])).toEqual([a]);
  });

  it('dedupes on normalized title+author and fills missing fields', () => {
    const primary = make({
      source: 'openlibrary',
      externalId: 'ol1',
      pages: null,
      coverUrl: null,
    });
    const secondary = make({
      source: 'googlebooks',
      externalId: 'gb1',
      title: 'DUNE',
      pages: 688,
      coverUrl: 'https://example.com/c.jpg',
      language: 'en',
    });
    const merged = mergeCandidates([primary], [secondary]);
    expect(merged).toHaveLength(1);
    expect(merged[0].source).toBe('openlibrary');
    expect(merged[0].pages).toBe(688);
    expect(merged[0].coverUrl).toBe('https://example.com/c.jpg');
    expect(merged[0].language).toBe('en');
  });

  it('preserves disjoint entries in order (primary first)', () => {
    const a = make({ externalId: 'a', title: 'A', author: 'AA' });
    const b = make({
      source: 'googlebooks',
      externalId: 'b',
      title: 'B',
      author: 'BB',
    });
    expect(mergeCandidates([a], [b]).map((c) => c.title)).toEqual(['A', 'B']);
  });
});
