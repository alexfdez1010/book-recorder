import 'server-only';
import { prisma } from '@/lib/db/prisma';
import type { Book } from '../../../generated/prisma';
import type { BookStatus } from './status';

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

export type FinishedBook = Book & { finishedOn: Date };

/** Finished books, most recent first. Powers /books, /authors, and stats. */
export async function listBooks(): Promise<FinishedBook[]> {
  const rows = await prisma.book.findMany({
    where: { status: 'finished', finishedOn: { not: null } },
    orderBy: { finishedOn: 'desc' },
  });
  return rows as FinishedBook[];
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
 * @returns The updated database record.
 */
export async function updateBook(
  id: string,
  input: UpdateBookInput,
): Promise<Book> {
  return prisma.book.update({ where: { id }, data: input });
}

export async function markBookAsFinished(
  id: string,
  finishedOn: Date,
  rating: number | null = null,
): Promise<Book> {
  return prisma.book.update({
    where: { id },
    data: {
      status: 'finished',
      finishedOn,
      ...(rating !== null ? { rating } : {}),
    },
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
