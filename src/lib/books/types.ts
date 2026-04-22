/**
 * Normalized book candidate returned by search adapters. Any field may be
 * missing from the remote source except title and author — those are required
 * for the user to make a sensible selection.
 */
export interface BookCandidate {
  source: 'openlibrary' | 'googlebooks';
  externalId: string;
  title: string;
  author: string;
  publicationDate: string | null;
  pages: number | null;
  coverUrl: string | null;
  category: string | null;
  language: string | null;
}
