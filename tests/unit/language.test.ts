import { describe, expect, it } from 'vitest';
import { normalizeLanguage } from '@/lib/books/language';

describe('normalizeLanguage', () => {
  it('returns null for empty input', () => {
    expect(normalizeLanguage(null)).toBeNull();
    expect(normalizeLanguage('')).toBeNull();
  });

  it('keeps ISO 639-1 codes lowercased', () => {
    expect(normalizeLanguage('EN')).toBe('en');
    expect(normalizeLanguage('es')).toBe('es');
  });

  it('maps common ISO 639-2 codes to ISO 639-1', () => {
    expect(normalizeLanguage('eng')).toBe('en');
    expect(normalizeLanguage('spa')).toBe('es');
    expect(normalizeLanguage('fre')).toBe('fr');
    expect(normalizeLanguage('ger')).toBe('de');
  });

  it('passes unknown 3-letter codes through', () => {
    expect(normalizeLanguage('xyz')).toBe('xyz');
  });
});
