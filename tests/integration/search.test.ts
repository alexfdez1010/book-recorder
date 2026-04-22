import { describe, expect, it } from 'vitest';
import { searchBooks } from '@/lib/books/search';

describe('searchBooks (live, combined)', () => {
  it('returns merged candidates from both sources', async () => {
    const results = await searchBooks('1984 George Orwell', 10);
    expect(results.length).toBeGreaterThan(0);
    for (const c of results) {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.author.length).toBeGreaterThan(0);
    }
  }, 20000);

  it('returns [] for an empty query', async () => {
    expect(await searchBooks('   ')).toEqual([]);
  });
});
