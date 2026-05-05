'use client';

import { useOptimistic, useTransition } from 'react';
import { setBookRatingAction } from '@/lib/books/actions';
import { StarRating } from './star-rating';

/**
 * Card-level rating control. Click a star to set; click the active star (or the X) to clear.
 * Uses an optimistic update so the UI snaps before the server action returns.
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

  function update(next: number | null) {
    start(async () => {
      setOptimistic(next);
      const result = await setBookRatingAction(id, next);
      if (result.error) console.error(result.error);
    });
  }

  return (
    <div data-pending={pending ? '' : undefined}>
      <StarRating
        value={optimistic}
        onChange={update}
        size="sm"
        ariaLabel="Book rating"
      />
    </div>
  );
}
