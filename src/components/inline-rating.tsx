'use client';

import { useOptimistic, useRef, useState, useTransition } from 'react';
import { setBookRatingAction } from '@/lib/books/actions';
import { StarRating } from './star-rating';

/**
 * Persists a book's rating optimistically; clicking the active value clears it.
 * Blocks overlapping saves and announces failures. An unsuccessful action rolls
 * back to the supplied server rating; thrown failures are also recoverable.
 */
export function InlineRating({
  id,
  rating,
}: {
  id: string;
  rating: number | null;
}) {
  const [optimistic, setOptimistic] = useOptimistic(rating);
  const [pending, start] = useTransition();
  const saving = useRef(false);
  const [error, setError] = useState<string | null>(null);

  /** Saves a value once, showing a retryable error if the server rejects it. */
  function update(next: number | null) {
    if (saving.current) return;
    saving.current = true;
    setError(null);
    start(async () => {
      setOptimistic(next);
      try {
        const result = await setBookRatingAction(id, next);
        if (result.error)
          setError('Rating could not be saved. Please try again.');
      } catch {
        setError('Rating could not be saved. Please try again.');
      } finally {
        saving.current = false;
      }
    });
  }

  return (
    <div
      className="min-w-0"
      data-pending={pending ? '' : undefined}
      aria-busy={pending}
    >
      <StarRating
        value={optimistic}
        onChange={update}
        disabled={pending}
        size="sm"
        ariaLabel="Book rating"
      />
      {error ? (
        <p role="alert" className="mt-1 text-sm text-oxblood">
          {error}
        </p>
      ) : null}
    </div>
  );
}
