/**
 * Lifecycle of a recorded book. `finished` rows are surfaced on /books and feed
 * every stat aggregation. `to-read` rows live on /to-read and are not counted
 * until they are promoted via {@link markBookAsFinished}.
 */
export const BOOK_STATUSES = ['finished', 'to-read'] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export const DEFAULT_BOOK_STATUS: BookStatus = 'finished';

export function isBookStatus(v: unknown): v is BookStatus {
  return (
    typeof v === 'string' && (BOOK_STATUSES as readonly string[]).includes(v)
  );
}
