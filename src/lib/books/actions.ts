'use server';

import { revalidatePath } from 'next/cache';
import {
  createBook,
  deleteBook,
  markBookAsFinished,
  setBookRating,
  updateBook,
} from './repository';
import { createCategory } from './categories-repository';
import {
  markFinishedSchema,
  newBookSchema,
  ratingValueSchema,
} from './validation';
import { searchBooks } from './search';
import { isAuthenticated } from '@/lib/auth/session';
import type { BookCandidate } from './types';

async function ensureAuth() {
  if (!(await isAuthenticated())) throw new Error('Unauthorized');
}

function revalidateBookPaths() {
  revalidatePath('/books');
  revalidatePath('/to-read');
  revalidatePath('/authors');
  revalidatePath('/graphs');
}

export async function addBookAction(
  formData: FormData,
): Promise<{ error?: string }> {
  await ensureAuth();
  const raw = Object.fromEntries(formData.entries());
  const parsed = newBookSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join('; ') };
  }
  const d = parsed.data;
  const isFinished = d.status === 'finished';
  await createBook({
    title: d.title,
    author: d.author,
    publicationDate: d.publicationDate ? new Date(d.publicationDate) : null,
    pages: d.pages,
    coverUrl: d.coverUrl ? d.coverUrl : null,
    category: d.category,
    language: d.language,
    status: d.status,
    finishedOn: isFinished && d.finishedOn ? new Date(d.finishedOn) : null,
    externalId: d.externalId ? d.externalId : null,
    source: d.source ?? 'manual',
    rating: d.rating ?? null,
  });
  revalidateBookPaths();
  return {};
}

export async function updateBookAction(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  await ensureAuth();
  const raw = Object.fromEntries(formData.entries());
  const parsed = newBookSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join('; ') };
  }
  const d = parsed.data;
  const isFinished = d.status === 'finished';
  await updateBook(id, {
    title: d.title,
    author: d.author,
    publicationDate: d.publicationDate ? new Date(d.publicationDate) : null,
    pages: d.pages,
    coverUrl: d.coverUrl ? d.coverUrl : null,
    category: d.category,
    language: d.language,
    status: d.status,
    finishedOn: isFinished && d.finishedOn ? new Date(d.finishedOn) : null,
    rating: d.rating ?? null,
  });
  revalidateBookPaths();
  return {};
}

export async function deleteBookAction(id: string): Promise<void> {
  await ensureAuth();
  await deleteBook(id);
  revalidateBookPaths();
}

export async function markBookAsFinishedAction(
  id: string,
  finishedOn: string,
  rating?: number | null,
): Promise<{ error?: string }> {
  await ensureAuth();
  const parsed = markFinishedSchema.safeParse({
    finishedOn,
    rating: rating ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join('; ') };
  }
  await markBookAsFinished(
    id,
    new Date(parsed.data.finishedOn),
    parsed.data.rating ?? null,
  );
  revalidateBookPaths();
  return {};
}

export async function setBookRatingAction(
  id: string,
  rating: number | null,
): Promise<{ error?: string }> {
  await ensureAuth();
  const parsed = ratingValueSchema.safeParse(rating);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join('; ') };
  }
  await setBookRating(id, parsed.data);
  revalidateBookPaths();
  return {};
}

export async function searchBooksAction(
  query: string,
): Promise<BookCandidate[]> {
  await ensureAuth();
  return searchBooks(query, 10);
}

export async function createCategoryAction(
  name: string,
): Promise<{ name?: string; error?: string }> {
  await ensureAuth();
  const trimmed = (name ?? '').trim();
  if (!trimmed) return { error: 'Category name is required' };
  try {
    const created = await createCategory(trimmed);
    revalidateBookPaths();
    return { name: created };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to add category' };
  }
}
