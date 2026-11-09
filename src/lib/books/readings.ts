import type {
  CollectionBook,
  FinishedBook,
  LibraryBook,
} from './reading-types';

/**
 * Expands books into completed readings without mutating catalogue or history.
 * Input histories must be newest first; ids remain book ids for legacy actions.
 * Reading ids provide stable collection keys and targets for focused edits.
 */
export function readingEntries(books: readonly LibraryBook[]): FinishedBook[] {
  return books
    .flatMap((book) =>
      book.readings.map((reading, index) => ({
        ...book,
        status: 'finished',
        finishedOn: reading.finishedOn,
        pages: reading.pages,
        language: reading.language,
        rating: reading.rating,
        opinion: reading.opinion,
        readingId: reading.id,
        readingNumber: book.readings.length - index,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.finishedOn).getTime() - new Date(a.finishedOn).getTime(),
    );
}

/**
 * Uses every reading in the monthly journal and only the latest per author card.
 * Queue records remain unchanged; catalogue metadata stays shared by reference.
 */
export function collectionEntries(
  books: readonly CollectionBook[],
  monthly: boolean,
): CollectionBook[] {
  return books.flatMap((book) => {
    if (!book.readings?.length) return [book];
    const entries = readingEntries([{ ...book, readings: book.readings }]);
    return monthly ? entries : entries.slice(0, 1);
  });
}
