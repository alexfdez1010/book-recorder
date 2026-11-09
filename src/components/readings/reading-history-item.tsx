'use client';

import { useState, useTransition } from 'react';
import type { Reading } from '../../../generated/prisma';
import { deleteReadingAction } from '@/lib/books/reading-actions';
import { languageName } from '@/lib/books/language';
import { BookOpinion } from '@/components/book-opinion';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Shows one dated reading and a scoped, cancellable deletion confirmation. */
export function ReadingHistoryItem({
  reading,
  number,
  canDelete,
  onEdit,
  onRemoved,
}: {
  reading: Reading;
  number: number;
  canDelete: boolean;
  onEdit: () => void;
  onRemoved: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  /** Removes only this reading; failure keeps its confirmation available for retry. */
  function remove() {
    setError(null);
    start(async () => {
      try {
        const result = await deleteReadingAction(reading.bookId, reading.id);
        if (result.error) setError(result.error);
        else {
          setConfirming(false);
          onRemoved();
        }
      } catch {
        setError('Reading could not be removed. Please try again.');
      }
    });
  }

  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-xl bg-paper p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-medium">
          {number === 1 ? 'First reading' : `Reading ${number}`}
        </h3>
        <time
          dateTime={new Date(reading.finishedOn).toISOString().slice(0, 10)}
          className="text-sm text-ink-soft"
        >
          {dateFormat.format(new Date(reading.finishedOn))}
        </time>
      </div>
      <p className="text-sm text-ink-mute">
        {reading.pages.toLocaleString('en-US')} pages{' '}
        <span className="ml-3">{languageName(reading.language)}</span>
      </p>
      {reading.rating !== null ? (
        <StarRating
          value={reading.rating}
          readOnly
          ariaLabel={`Reading ${number} rating`}
          size="sm"
        />
      ) : (
        <p className="text-sm text-ink-mute">Unrated</p>
      )}
      <BookOpinion opinion={reading.opinion} />
      {confirming ? (
        <div
          className="flex flex-col gap-3"
          role="group"
          aria-label="Confirm reading removal"
        >
          <p className="text-sm text-ink">
            Remove this reading and its rating and opinion?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              type="button"
              disabled={pending}
              onClick={() => setConfirming(false)}
            >
              Keep reading
            </Button>
            <Button
              variant="destructive"
              type="button"
              disabled={pending}
              onClick={remove}
            >
              {pending ? 'Removing…' : 'Remove reading'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" type="button" onClick={onEdit}>
            Edit reading
          </Button>
          {canDelete && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => setConfirming(true)}
            >
              Remove reading
            </Button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="lib-field-error">
          {error}
        </p>
      )}
    </li>
  );
}
