import { describe, expect, it } from 'vitest';
import {
  SEED_BOOK_CATEGORIES,
  normalizeCategory,
} from '@/lib/books/categories';

describe('SEED_BOOK_CATEGORIES', () => {
  it('covers every category the normalizer can return', () => {
    expect(SEED_BOOK_CATEGORIES).toContain('Other');
    expect(SEED_BOOK_CATEGORIES).toContain('Fiction');
    expect(SEED_BOOK_CATEGORIES).toContain('Science Fiction');
  });

  it('has no duplicates', () => {
    expect(new Set(SEED_BOOK_CATEGORIES).size).toBe(
      SEED_BOOK_CATEGORIES.length,
    );
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
    expect(normalizeCategory('Juvenile Fiction / Fantasy & Magic')).toBe(
      'Fantasy',
    );
    expect(normalizeCategory('Business & Economics / Leadership')).toBe(
      'Business',
    );
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
