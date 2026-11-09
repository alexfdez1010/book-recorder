import 'server-only';
import { prisma } from '@/lib/db/prisma';
import type { Prisma, Reading } from '../../../generated/prisma';
import type { LibraryBook, ReadingInput } from './reading-types';
import { readingEntries } from './readings';

/** Stable chronology also resolves multiple readings completed on the same day. */
export const readingOrder = [
  { finishedOn: 'desc' },
  { createdAt: 'desc' },
  { id: 'desc' },
] satisfies Prisma.ReadingOrderByWithRelationInput[];

/** Loads each finished title once with full history; queue records are excluded. */
export async function listLibraryBooks(): Promise<LibraryBook[]> {
  return prisma.book.findMany({
    where: { readings: { some: {} } },
    include: { readings: { orderBy: readingOrder } },
    orderBy: [{ finishedOn: 'desc' }, { id: 'desc' }],
  });
}

/** Returns flat completed readings with historical page/language snapshots for stats. */
export async function listFinishedReadings() {
  return readingEntries(await listLibraryBooks());
}

/** Locks the parent before any history write, serializing it with legacy Book writes. */
export async function lockReadingBook(
  tx: Prisma.TransactionClient,
  bookId: string,
) {
  const rows = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "Book" WHERE "id" = ${bookId} FOR UPDATE
  `;
  if (!rows.length) throw new Error('Book no longer exists');
}

/**
 * Appends a reread atomically, preserving earlier snapshots and legacy projections.
 * A repeated request id returns its original result, even after a lost response.
 * Requires an existing completed reading; backdated and same-day rereads are valid.
 */
export async function recordReread(
  bookId: string,
  requestId: string,
  input: ReadingInput,
): Promise<Reading> {
  return prisma.$transaction(async (tx) => {
    await lockReadingBook(tx, bookId);
    const existing = await tx.reading.findUnique({ where: { id: requestId } });
    if (existing) {
      if (existing.bookId !== bookId)
        throw new Error('Reading belongs to another book');
      return existing;
    }
    if (!(await tx.reading.count({ where: { bookId } })))
      throw new Error('Finish the first reading before registering a reread');
    return tx.reading.create({ data: { id: requestId, bookId, ...input } });
  });
}

/** Updates exactly one reading, including explicit clearing, without altering its siblings. */
export async function updateReading(
  bookId: string,
  id: string,
  input: ReadingInput,
) {
  return prisma.$transaction(async (tx) => {
    await lockReadingBook(tx, bookId);
    return tx.reading.update({ where: { id, bookId }, data: input });
  });
}

/** Sets one historical rating; other fields and the latest unrelated rating are preserved. */
export async function setReadingRating(
  bookId: string,
  id: string,
  rating: number | null,
) {
  return prisma.$transaction(async (tx) => {
    await lockReadingBook(tx, bookId);
    return tx.reading.update({ where: { id, bookId }, data: { rating } });
  });
}

/** Removes one mistaken reading; the last is retained unless the entire book is deleted. */
export async function deleteReading(bookId: string, id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await lockReadingBook(tx, bookId);
    if ((await tx.reading.count({ where: { bookId } })) < 2)
      throw new Error(
        'Keep at least one reading, or delete the book and its history',
      );
    await tx.reading.delete({ where: { id, bookId } });
  });
}
