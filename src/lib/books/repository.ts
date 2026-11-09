import 'server-only';
import { prisma } from '@/lib/db/prisma';
import type { Book } from '../../../generated/prisma';
import type { BookStatus } from './status';
import { listFinishedReadings, lockReadingBook } from './readings-repository';
export type { FinishedBook } from './reading-types';

export interface NewBookInput {
  title: string;
  author: string;
  publicationDate: Date | null;
  pages: number;
  coverUrl: string | null;
  category: string;
  language: string;
  status: BookStatus;
  finishedOn: Date | null;
  externalId: string | null;
  source: string | null;
  rating: number | null;
  opinion?: string | null;
}

/**
 * Persist a new book.
 * @param input - Normalized metadata; an omitted opinion uses the database null default.
 * @returns The created database record.
 */
export async function createBook(input: NewBookInput): Promise<Book> {
  return prisma.book.create({ data: input });
}

/** Completed readings with historical snapshots, powering activity statistics. */
export async function listBooks() {
  return listFinishedReadings();
}

/** Books still on the to-read shelf, newest entries first. */
export async function listToReadBooks(): Promise<Book[]> {
  return prisma.book.findMany({
    where: { status: 'to-read' },
    orderBy: { createdAt: 'desc' },
  });
}

/** Distinct authors across both shelves, used to power the author combobox. */
export async function listAuthors(): Promise<string[]> {
  const rows = await prisma.book.findMany({
    distinct: ['author'],
    select: { author: true },
    orderBy: { author: 'asc' },
  });
  return rows.map((r) => r.author);
}

export async function deleteBook(id: string): Promise<void> {
  await prisma.book.delete({ where: { id } });
}

export type UpdateBookInput = Omit<NewBookInput, 'externalId' | 'source'>;

/**
 * Replace editable book metadata.
 * @param id - Database id of the book to update.
 * @param input - Normalized fields; omitted optional fields remain unchanged.
 * @param readingId - Optional explicit reading target; legacy callers edit the latest.
 * @returns The updated database record.
 */
export async function updateBook(
  id: string,
  input: UpdateBookInput,
  readingId?: string,
): Promise<Book> {
  return prisma.$transaction(async (tx) => {
    await lockReadingBook(tx, id);
    if (readingId) {
      const {
        pages,
        language,
        finishedOn,
        rating,
        opinion,
        status,
        ...metadata
      } = input;
      if (status !== 'finished' || !finishedOn)
        throw new Error('A reading needs a finish date');
      await tx.reading.findUniqueOrThrow({
        where: { id: readingId, bookId: id },
      });
      await tx.book.update({ where: { id }, data: metadata });
      await tx.reading.update({
        where: { id: readingId, bookId: id },
        data: {
          pages,
          language,
          finishedOn,
          rating,
          ...(opinion !== undefined ? { opinion } : {}),
        },
      });
    } else {
      await tx.book.update({ where: { id }, data: input });
    }
    return tx.book.findUniqueOrThrow({ where: { id } });
  });
}

/** Completes a queued title once; retried completions cannot overwrite existing history. */
export async function markBookAsFinished(
  id: string,
  finishedOn: Date,
  rating: number | null = null,
): Promise<Book> {
  return prisma.$transaction(async (tx) => {
    await lockReadingBook(tx, id);
    const book = await tx.book.findUniqueOrThrow({ where: { id } });
    if (book.status === 'finished') return book;
    return tx.book.update({
      where: { id },
      data: {
        status: 'finished',
        finishedOn,
        ...(rating !== null ? { rating } : {}),
      },
    });
  });
}

export async function setBookRating(
  id: string,
  rating: number | null,
): Promise<Book> {
  return prisma.book.update({ where: { id }, data: { rating } });
}

/**
 * Set or clear the reader's opinion for one book.
 * @param id - Database id of the book to update.
 * @param opinion - Normalized opinion text, or null to clear it.
 * @returns The updated database record.
 */
export async function setBookOpinion(
  id: string,
  opinion: string | null,
): Promise<Book> {
  return prisma.book.update({ where: { id }, data: { opinion } });
}
