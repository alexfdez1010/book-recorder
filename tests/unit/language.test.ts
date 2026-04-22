import { describe, expect, it } from 'vitest';
import { languageName, normalizeLanguage } from '@/lib/books/language';

describe('normalizeLanguage', () => {
  it('returns null for empty input', () => {
    expect(normalizeLanguage(null)).toBeNull();
    expect(normalizeLanguage('')).toBeNull();
  });

  it('keeps known ISO 639-1 codes lowercased', () => {
    expect(normalizeLanguage('EN')).toBe('en');
    expect(normalizeLanguage('es')).toBe('es');
  });

  it('maps common ISO 639-2 codes to ISO 639-1', () => {
    expect(normalizeLanguage('eng')).toBe('en');
    expect(normalizeLanguage('spa')).toBe('es');
    expect(normalizeLanguage('fre')).toBe('fr');
    expect(normalizeLanguage('ger')).toBe('de');
  });

  it('returns null for unknown codes', () => {
    expect(normalizeLanguage('xyz')).toBeNull();
    expect(normalizeLanguage('zz')).toBeNull();
  });
});

describe('languageName', () => {
  it('returns the human name for known codes', () => {
    expect(languageName('en')).toBe('English');
    expect(languageName('es')).toBe('Spanish');
    expect(languageName('JA')).toBe('Japanese');
  });

  it('returns Unknown for empty input', () => {
    expect(languageName(null)).toBe('Unknown');
    expect(languageName('')).toBe('Unknown');
  });

  it('passes unknown codes through unchanged', () => {
    expect(languageName('xx')).toBe('xx');
  });
});
