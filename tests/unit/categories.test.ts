import { describe, expect, it } from 'vitest';
import { BOOK_CATEGORIES, normalizeCategory } from '@/lib/books/categories';

describe('BOOK_CATEGORIES', () => {
  it('has between 10 and 15 entries', () => {
    expect(BOOK_CATEGORIES.length).toBeGreaterThanOrEqual(10);
    expect(BOOK_CATEGORIES.length).toBeLessThanOrEqual(15);
  });

  it('includes Other as the fallback bucket', () => {
    expect(BOOK_CATEGORIES).toContain('Other');
  });
});

describe('normalizeCategory', () => {
  it('returns Other for empty input', () => {
    expect(normalizeCategory(null)).toBe('Other');
    expect(normalizeCategory('')).toBe('Other');
  });

  it('maps science fiction before the generic Fiction rule', () => {
    expect(normalizeCategory('Science Fiction')).toBe('Science Fiction');
    expect(normalizeCategory('sci-fi dystopia')).toBe('Science Fiction');
  });

  it('recognises Google Books compound labels', () => {
    expect(normalizeCategory('Juvenile Fiction / Fantasy & Magic')).toBe('Fantasy');
    expect(normalizeCategory('Business & Economics / Leadership')).toBe('Business');
  });

  it('maps common Open Library subjects', () => {
    expect(normalizeCategory('Biography')).toBe('Biography & Memoir');
    expect(normalizeCategory('History -- 20th century')).toBe('History');
    expect(normalizeCategory('Mystery fiction')).toBe('Mystery & Thriller');
    expect(normalizeCategory('Poetry')).toBe('Poetry');
  });

  it('falls back to Other for unmatched subjects', () => {
    expect(normalizeCategory('Cooking')).toBe('Other');
  });
});
