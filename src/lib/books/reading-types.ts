import type { Book, Reading } from '../../../generated/prisma';

/** One catalogue record with its chronological reading history, newest first. */
export type LibraryBook = Book & { readings: Reading[] };

/** Queue records omit history; completed entries identify one specific reading. */
export type CollectionBook = Book & {
  readings?: Reading[];
  readingId?: string;
  readingNumber?: number;
};

export type FinishedBook = CollectionBook & {
  finishedOn: Date;
  readingId: string;
};

/** Shared snapshots accepted when recording or editing a completed reading. */
export interface ReadingInput {
  finishedOn: Date;
  pages: number;
  language: string;
  rating: number | null;
  opinion: string | null;
}
