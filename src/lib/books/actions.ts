'use server';

import { revalidatePath } from 'next/cache';
import { createBook, deleteBook } from './repository';
import { newBookSchema } from './validation';
import { searchBooks } from './search';
import { isAuthenticated } from '@/lib/auth/session';
import type { BookCandidate } from './types';

async function ensureAuth() {
  if (!(await isAuthenticated())) throw new Error('Unauthorized');
}

export async function addBookAction(formData: FormData): Promise<{ error?: string }> {
  await ensureAuth();
  const raw = Object.fromEntries(formData.entries());
  const parsed = newBookSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join('; ') };
  }
  const d = parsed.data;
  await createBook({
    title: d.title,
    author: d.author,
    publicationDate: d.publicationDate ? new Date(d.publicationDate) : null,
    pages: d.pages,
    coverUrl: d.coverUrl ? d.coverUrl : null,
    category: d.category,
    language: d.language,
    finishedOn: new Date(d.finishedOn),
    externalId: d.externalId ? d.externalId : null,
    source: d.source ?? 'manual',
  });
  revalidatePath('/books');
  revalidatePath('/graphs');
  return {};
}

export async function deleteBookAction(id: string): Promise<void> {
  await ensureAuth();
  await deleteBook(id);
  revalidatePath('/books');
  revalidatePath('/graphs');
}

export async function searchBooksAction(query: string): Promise<BookCandidate[]> {
  await ensureAuth();
  return searchBooks(query, 10);
}
