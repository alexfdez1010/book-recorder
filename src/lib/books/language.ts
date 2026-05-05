/**
 * Supported ISO 639-1 codes. Backend stores the code; UI shows the name.
 */
export const LANGUAGE_KEYS = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ru',
  'ja',
  'zh',
  'ar',
  'nl',
  'sv',
  'no',
  'da',
  'pl',
  'tr',
  'ko',
  'hi',
  'la',
  'el',
] as const;

export type LanguageCode = (typeof LANGUAGE_KEYS)[number];

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  zh: 'Chinese',
  ar: 'Arabic',
  nl: 'Dutch',
  sv: 'Swedish',
  no: 'Norwegian',
  da: 'Danish',
  pl: 'Polish',
  tr: 'Turkish',
  ko: 'Korean',
  hi: 'Hindi',
  la: 'Latin',
  el: 'Greek',
};

const ISO_639_2_TO_1: Record<string, LanguageCode> = {
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

function isKnownCode(code: string): code is LanguageCode {
  return (LANGUAGE_KEYS as readonly string[]).includes(code);
}

/**
 * Normalize language codes from Open Library (ISO 639-2/B, 3-letter) and
 * Google Books (ISO 639-1, 2-letter) to a known 2-letter code. Returns null
 * when the code cannot be mapped into our supported set.
 */
export function normalizeLanguage(
  code: string | null | undefined,
): LanguageCode | null {
  if (!code) return null;
  const lower = code.toLowerCase().trim();
  if (lower.length === 2) return isKnownCode(lower) ? lower : null;
  if (lower.length === 3) return ISO_639_2_TO_1[lower] ?? null;
  return null;
}

/** Human-readable name for a language code. Falls back to 'Unknown'. */
export function languageName(code: string | null | undefined): string {
  if (!code) return 'Unknown';
  const lower = code.toLowerCase();
  return (LANGUAGE_NAMES as Record<string, string>)[lower] ?? code;
}
