import { BookCandidate } from './types';
import { normalizeLanguage } from './language';

const SEARCH_URL = 'https://www.googleapis.com/books/v1/volumes';

interface GoogleVolume {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    pageCount?: number;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    categories?: string[];
    language?: string;
  };
}

interface GoogleResponse {
  items?: GoogleVolume[];
}

function normalizePublishedDate(raw: string | undefined): string | null {
  if (!raw) return null;
  if (/^\d{4}$/.test(raw)) return `${raw}-01-01`;
  if (/^\d{4}-\d{2}$/.test(raw)) return `${raw}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return null;
}

function toCandidate(vol: GoogleVolume): BookCandidate | null {
  const info = vol.volumeInfo;
  if (!vol.id || !info?.title || !info.authors?.length) return null;
  const cover = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null;
  return {
    source: 'googlebooks',
    externalId: vol.id,
    title: info.title,
    author: info.authors[0],
    publicationDate: normalizePublishedDate(info.publishedDate),
    pages: typeof info.pageCount === 'number' && info.pageCount > 0 ? info.pageCount : null,
    coverUrl: cover ? cover.replace(/^http:\/\//, 'https://') : null,
    category: info.categories?.[0] ?? null,
    language: normalizeLanguage(info.language),
  };
}

export async function searchGoogleBooks(
  query: string,
  limit = 10,
  fetchImpl: typeof fetch = fetch,
): Promise<BookCandidate[]> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('maxResults', String(limit));
  const res = await fetchImpl(url.toString(), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`GoogleBooks error ${res.status}`);
  const data = (await res.json()) as GoogleResponse;
  return (data.items ?? []).map(toCandidate).filter((c): c is BookCandidate => c !== null);
}
