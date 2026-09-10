import type { BookCandidate } from './types';

export type BookCoverCandidate = Pick<BookCandidate, 'title' | 'author'> & {
  coverUrl: string;
};

/**
 * Selects distinct, usable HTTP(S) cover URLs in catalogue order.
 * @param candidates - Search results, including entries without cover images.
 * @returns Preview metadata only; missing, malformed and duplicate URLs are omitted.
 * Does not mutate the supplied results.
 */
export function selectBookCovers(
  candidates: BookCandidate[],
): BookCoverCandidate[] {
  const seen = new Set<string>();
  return candidates.flatMap(({ title, author, coverUrl }) => {
    if (!coverUrl) return [];
    try {
      const url = new URL(coverUrl);
      if (!['http:', 'https:'].includes(url.protocol) || seen.has(url.href))
        return [];
      seen.add(url.href);
      return [{ title, author, coverUrl: url.href }];
    } catch {
      return [];
    }
  });
}
