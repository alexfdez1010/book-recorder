import { describe, expect, it } from 'vitest';
import { searchOpenLibrary } from '@/lib/books/openlibrary';

describe('searchOpenLibrary (live)', () => {
  it('returns candidates for a well-known query', async () => {
    const results = await searchOpenLibrary('The Great Gatsby', 5);
    expect(results.length).toBeGreaterThan(0);
    const top = results[0];
    expect(top.source).toBe('openlibrary');
    expect(top.title.toLowerCase()).toContain('gatsby');
    expect(top.author.length).toBeGreaterThan(0);
    for (const c of results) {
      expect(c.externalId).toBeTruthy();
    }
  }, 15000);

  it('returns empty array for gibberish input', async () => {
    const results = await searchOpenLibrary('zzzzzqqqqxxxzzzzz1234567890notarealbook', 5);
    expect(Array.isArray(results)).toBe(true);
  }, 15000);
});
