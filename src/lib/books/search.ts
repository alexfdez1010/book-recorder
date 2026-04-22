import { BookCandidate } from './types';
import { searchOpenLibrary } from './openlibrary';
import { searchGoogleBooks } from './googlebooks';

function dedupeKey(c: BookCandidate): string {
  return `${c.title.toLowerCase().trim()}__${c.author.toLowerCase().trim()}`;
}

/**
 * Merge two candidate lists, preferring the entry with more complete data
 * for a given (title, author) pair. Preserves first-occurrence ordering.
 */
export function mergeCandidates(
  primary: BookCandidate[],
  secondary: BookCandidate[],
): BookCandidate[] {
  const byKey = new Map<string, BookCandidate>();
  const order: string[] = [];
  const consider = (c: BookCandidate) => {
    const key = dedupeKey(c);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, c);
      order.push(key);
      return;
    }
    byKey.set(key, mergeOne(existing, c));
  };
  primary.forEach(consider);
  secondary.forEach(consider);
  return order.map((k) => byKey.get(k)!);
}

function mergeOne(a: BookCandidate, b: BookCandidate): BookCandidate {
  return {
    source: a.source,
    externalId: a.externalId,
    title: a.title,
    author: a.author,
    publicationDate: a.publicationDate ?? b.publicationDate,
    pages: a.pages ?? b.pages,
    coverUrl: a.coverUrl ?? b.coverUrl,
    category: a.category ?? b.category,
    language: a.language ?? b.language,
  };
}

export async function searchBooks(query: string, limit = 10): Promise<BookCandidate[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const [ol, gb] = await Promise.allSettled([
    searchOpenLibrary(trimmed, limit),
    searchGoogleBooks(trimmed, limit),
  ]);
  const primary = ol.status === 'fulfilled' ? ol.value : [];
  const secondary = gb.status === 'fulfilled' ? gb.value : [];
  return mergeCandidates(primary, secondary).slice(0, limit);
}
