import { describe, expect, it } from 'vitest';
import { searchGoogleBooks } from '@/lib/books/googlebooks';

async function searchOrSkip(query: string, limit: number) {
  try {
    return {
      results: await searchGoogleBooks(query, limit),
      skipped: false as const,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('429')) return { results: null, skipped: true as const };
    throw err;
  }
}

describe('searchGoogleBooks (live)', () => {
  it('returns candidates for a well-known query', async () => {
    const { results, skipped } = await searchOrSkip('Dune Frank Herbert', 5);
    if (skipped) {
      console.warn('Google Books rate-limited (429); assertion skipped.');
      return;
    }
    expect(results!.length).toBeGreaterThan(0);
    const top = results![0];
    expect(top.source).toBe('googlebooks');
    expect(top.title.toLowerCase()).toContain('dune');
    expect(top.externalId).toBeTruthy();
  }, 20000);

  it('normalizes partial published dates to YYYY-MM-DD', async () => {
    const { results, skipped } = await searchOrSkip('Pride and Prejudice', 5);
    if (skipped) {
      console.warn('Google Books rate-limited (429); assertion skipped.');
      return;
    }
    for (const r of results!) {
      if (r.publicationDate) {
        expect(r.publicationDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  }, 20000);
});
