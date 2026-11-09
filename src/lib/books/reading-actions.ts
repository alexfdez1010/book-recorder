'use server';

import { revalidatePath } from 'next/cache';
import { isAuthenticated } from '@/lib/auth/session';
import {
  deleteReading,
  recordReread,
  setReadingRating,
  updateReading,
} from './readings-repository';
import { readingRequestIdSchema, readingSchema } from './reading-validation';
import { ratingValueSchema } from './validation';

type Result = { error?: string };

/** Revalidates all views of shared metadata and per-reading activity after a save. */
function refreshReadings() {
  for (const path of ['/books', '/authors', '/graphs', '/to-read'])
    revalidatePath(path);
}

/** Requires an authenticated owner before any mutation; failures are never swallowed. */
async function requireOwner() {
  if (!(await isAuthenticated())) throw new Error('Unauthorized');
}

/**
 * Validates a complete reading and persists it as a new reread or a focused edit.
 * @param bookId - Parent catalogue id, checked again by the repository.
 * @param form - Date, snapshots, optional rating/opinion and a create request id.
 * @param readingId - Existing reading id when editing; omitted when appending.
 * @returns A recoverable error or success after revalidating collection views.
 */
export async function saveReadingAction(
  bookId: string,
  form: FormData,
  readingId?: string,
): Promise<Result> {
  await requireOwner();
  const parsed = readingSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success)
    return {
      error: parsed.error.issues.map((issue) => issue.message).join('; '),
    };
  const request = readingRequestIdSchema.safeParse(form.get('requestId'));
  if (!readingId && !request.success)
    return { error: 'Reopen the form and try again' };
  const input = {
    ...parsed.data,
    finishedOn: new Date(parsed.data.finishedOn),
  };
  try {
    if (readingId) await updateReading(bookId, readingId, input);
    else await recordReread(bookId, request.data!, input);
  } catch {
    return {
      error:
        'Reading could not be saved. Your changes are still here; please try again.',
    };
  }
  refreshReadings();
  return {};
}

/** Saves one reading's half-star rating, preserving every other reading and field. */
export async function setReadingRatingAction(
  bookId: string,
  readingId: string,
  rating: number | null,
): Promise<Result> {
  await requireOwner();
  const parsed = ratingValueSchema.safeParse(rating);
  if (!parsed.success) return { error: 'Choose a rating from 0.5 to 5' };
  await setReadingRating(bookId, readingId, parsed.data);
  refreshReadings();
  return {};
}

/** Deletes one confirmed mistaken reading; the repository protects the final reading. */
export async function deleteReadingAction(
  bookId: string,
  readingId: string,
): Promise<Result> {
  await requireOwner();
  try {
    await deleteReading(bookId, readingId);
  } catch {
    return {
      error:
        'Reading could not be removed. Keep at least one reading and try again.',
    };
  }
  refreshReadings();
  return {};
}
