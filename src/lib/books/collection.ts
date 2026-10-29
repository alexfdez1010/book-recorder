/** Minimum searchable book metadata; adapters may supply additional fields. */
export interface SearchableBook {
  title: string;
  author: string;
  category: string;
}

/** Minimum grouping metadata; queued books may have no completion date. */
export interface GroupableBook {
  author: string;
  finishedOn: Date | null;
}

export type CollectionGrouping = 'month' | 'author' | 'none';
export interface CollectionGroup<T> {
  key: string;
  label: string | null;
  books: T[];
}

const MONTH_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Normalizes accents and case for forgiving local search; has no side effects. */
function normalize(value: string): string {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
}

/**
 * Returns books matching every query word across title, author and category.
 * @param books - Source order is retained and never mutated.
 * @param query - Blank or whitespace-only queries return all books.
 */
export function filterCollection<T extends SearchableBook>(
  books: readonly T[],
  query: string,
): T[] {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return books.filter((book) => {
    const searchable = normalize(
      `${book.title} ${book.author} ${book.category}`,
    );
    return words.every((word) => searchable.includes(word));
  });
}

/** Returns the UTC completion timestamp, with unfinished records sorted last. */
function finishTime(book: GroupableBook): number {
  return book.finishedOn ? new Date(book.finishedOn).getTime() : 0;
}

/**
 * Groups books by UTC month or author; none preserves the supplied queue order.
 * Author groups rank by count then name; dated groups and entries are newest first.
 * @returns New arrays without changing source records; empty input yields no groups.
 */
export function groupCollection<T extends GroupableBook>(
  books: readonly T[],
  grouping: CollectionGrouping,
): CollectionGroup<T>[] {
  if (books.length === 0) return [];
  if (grouping === 'none')
    return [{ key: 'all', label: null, books: [...books] }];
  const groups = new Map<string, CollectionGroup<T>>();
  for (const book of books) {
    const date = book.finishedOn ? new Date(book.finishedOn) : null;
    const key =
      grouping === 'author'
        ? book.author
        : (date?.toISOString().slice(0, 7) ?? 'undated');
    const label =
      grouping === 'author'
        ? book.author
        : date
          ? MONTH_FORMAT.format(date)
          : 'Undated';
    const group = groups.get(key) ?? { key, label, books: [] };
    group.books.push(book);
    groups.set(key, group);
  }
  const result = [...groups.values()];
  for (const group of result)
    group.books.sort((a, b) => finishTime(b) - finishTime(a));
  return result.sort((a, b) =>
    grouping === 'author'
      ? b.books.length - a.books.length || a.key.localeCompare(b.key, 'en-US')
      : b.key.localeCompare(a.key, 'en-US'),
  );
}
