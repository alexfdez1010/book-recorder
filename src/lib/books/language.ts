/**
 * Normalize language codes from Open Library (ISO 639-2/B, 3-letter) and
 * Google Books (ISO 639-1, 2-letter) to ISO 639-1 lowercase.
 */
const ISO_639_2_TO_1: Record<string, string> = {
  eng: 'en',
  spa: 'es',
  fre: 'fr',
  fra: 'fr',
  ger: 'de',
  deu: 'de',
  ita: 'it',
  por: 'pt',
  rus: 'ru',
  jpn: 'ja',
  chi: 'zh',
  zho: 'zh',
  ara: 'ar',
  dut: 'nl',
  nld: 'nl',
  swe: 'sv',
  nor: 'no',
  dan: 'da',
  pol: 'pl',
  tur: 'tr',
  kor: 'ko',
  hin: 'hi',
  lat: 'la',
  gre: 'el',
  ell: 'el',
};

export function normalizeLanguage(code: string | null | undefined): string | null {
  if (!code) return null;
  const lower = code.toLowerCase().trim();
  if (lower.length === 2) return lower;
  if (lower.length === 3) return ISO_639_2_TO_1[lower] ?? lower;
  return null;
}
