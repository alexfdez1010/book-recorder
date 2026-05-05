import { BookCandidate } from './types';
import { normalizeLanguage } from './language';
import { normalizeCategory } from './categories';

const SEARCH_URL = 'https://openlibrary.org/search.json';

interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  cover_i?: number;
  subject?: string[];
  language?: string[];
}

interface OpenLibraryResponse {
  docs?: OpenLibraryDoc[];
}

function coverUrlFromId(id: number | undefined): string | null {
  return typeof id === 'number'
    ? `https://covers.openlibrary.org/b/id/${id}-L.jpg`
    : null;
}

function toCandidate(doc: OpenLibraryDoc): BookCandidate | null {
  if (!doc.title || !doc.author_name?.length || !doc.key) return null;
  return {
    source: 'openlibrary',
    externalId: doc.key,
    title: doc.title,
    author: doc.author_name[0],
    publicationDate: doc.first_publish_year
      ? `${doc.first_publish_year}-01-01`
      : null,
    pages:
      typeof doc.number_of_pages_median === 'number'
        ? doc.number_of_pages_median
        : null,
    coverUrl: coverUrlFromId(doc.cover_i),
    category: normalizeCategory(doc.subject?.[0]),
    language: normalizeLanguage(doc.language?.[0]),
  };
}

interface OpenLibraryEdition {
  number_of_pages?: number;
  pagination?: string;
}

interface OpenLibraryEditionsResponse {
  entries?: OpenLibraryEdition[];
}

function parsePagination(raw: string | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/(\d{2,5})/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Fallback: fetch editions for a work and return the first known page count.
 * OL search results frequently omit `number_of_pages_median`; edition records
 * carry `number_of_pages` (or a textual `pagination` field like "384 p.").
 */
export async function fetchOpenLibraryPages(
  workKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<number | null> {
  if (!workKey.startsWith('/works/')) return null;
  const url = `https://openlibrary.org${workKey}/editions.json?limit=10`;
  const res = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const data = (await res.json()) as OpenLibraryEditionsResponse;
  for (const e of data.entries ?? []) {
    if (typeof e.number_of_pages === 'number' && e.number_of_pages > 0) {
      return e.number_of_pages;
    }
    const fromText = parsePagination(e.pagination);
    if (fromText) return fromText;
  }
  return null;
}

export async function searchOpenLibrary(
  query: string,
  limit = 10,
  fetchImpl: typeof fetch = fetch,
): Promise<BookCandidate[]> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  const res = await fetchImpl(url.toString(), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`OpenLibrary error ${res.status}`);
  const data = (await res.json()) as OpenLibraryResponse;
  return (data.docs ?? [])
    .map(toCandidate)
    .filter((c): c is BookCandidate => c !== null);
}
