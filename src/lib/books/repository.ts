import 'server-only';
import { prisma } from '@/lib/db/prisma';
import type { Book } from '../../../generated/prisma';

export interface NewBookInput {
  title: string;
  author: string;
  publicationDate: Date | null;
  pages: number;
  coverUrl: string | null;
  category: string;
  language: string;
  finishedOn: Date;
  externalId: string | null;
  source: string | null;
}

export async function createBook(input: NewBookInput): Promise<Book> {
  return prisma.book.create({ data: input });
}

export async function listBooks(): Promise<Book[]> {
  return prisma.book.findMany({ orderBy: { finishedOn: 'desc' } });
}

export async function deleteBook(id: string): Promise<void> {
  await prisma.book.delete({ where: { id } });
}
