import type { CollectionBook } from '@/lib/books/reading-types';
import { BookCover } from '@/components/book-cover';
import { BookOpinion } from '@/components/book-opinion';
import { DeleteBookButton } from '@/components/delete-book-button';
import { EditBookDialog } from '@/components/edit-book-dialog';
import { InlineRating } from '@/components/inline-rating';
import { MarkAsFinishedButton } from '@/components/mark-as-finished-button';
import { Badge } from '@/components/ui/badge';
import { RereadDialog } from '@/components/readings/reread-dialog';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { languageName } from '@/lib/books/language';

interface BookEntryProps {
  book: CollectionBook;
  authors: string[];
  categories: string[];
  showRating: boolean;
  priority?: boolean;
  onShowHistory: (trigger: HTMLButtonElement) => void;
}

/**
 * Presents one book with existing accessible editing, rating and queue actions.
 * @param props - Persisted metadata, selection options and optional cover priority.
 * @returns A collection list item; queued records expose the finish action.
 */
export function BookEntry({
  book,
  authors,
  categories,
  showRating,
  priority,
  onShowHistory,
}: BookEntryProps) {
  const queued = book.status === 'to-read';
  return (
    <li
      className="lib-card"
      data-reading-id={book.readingId}
      data-book-id={book.id}
    >
      <div className="lib-card__body">
        <BookCover
          title={book.title}
          author={book.author}
          coverUrl={book.coverUrl}
          priority={priority}
        />
        <div className="lib-card__text">
          <div className="mb-3">
            <Badge variant="accent">{book.category}</Badge>
            {(book.readingNumber ?? 0) > 1 && (
              <span className="ml-3 text-xs font-medium text-leather">
                Reread
              </span>
            )}
          </div>
          <h3 className="lib-card__title" title={book.title}>
            {book.title}
          </h3>
          <p className="lib-card__author" title={book.author}>
            {book.author}
          </p>
          <p className="mt-auto pt-4 text-xs text-ink-mute">
            {book.pages.toLocaleString('en-US')} pages{' '}
            <span className="ml-3">{languageName(book.language)}</span>
          </p>
        </div>
      </div>
      <div className="lib-card__context">
        {!queued && book.finishedOn && (
          <p className="mt-4 text-xs text-ink-mute">
            Finished{' '}
            <time
              dateTime={new Date(book.finishedOn).toISOString().slice(0, 10)}
            >
              {new Intl.DateTimeFormat('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                timeZone: 'UTC',
              }).format(new Date(book.finishedOn))}
            </time>
          </p>
        )}
        <BookOpinion opinion={book.opinion} />
        {!queued && !!book.readings?.length && (
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
            <RereadDialog
              book={{
                ...book,
                pages: book.readings[0].pages,
                language: book.readings[0].language,
              }}
            />
            <Button
              variant="link"
              className="lib-amend"
              type="button"
              data-book-history={book.id}
              onClick={(event) => {
                if (event.currentTarget instanceof HTMLButtonElement)
                  onShowHistory(event.currentTarget);
              }}
            >
              <History className="h-3.5 w-3.5" aria-hidden="true" />
              {book.readings.length}{' '}
              {book.readings.length === 1 ? 'reading' : 'readings'}
            </Button>
          </div>
        )}
      </div>
      <div className="lib-card__foot">
        {showRating && !queued && (
          <InlineRating
            id={book.id}
            readingId={book.readingId}
            rating={book.rating}
          />
        )}
        <div className="lib-card__actions ml-auto flex flex-wrap items-center gap-3">
          {queued && <MarkAsFinishedButton id={book.id} title={book.title} />}
          <EditBookDialog
            book={book}
            authors={authors}
            categories={categories}
            readingId={book.readingId}
          />
          <DeleteBookButton
            id={book.id}
            title={book.title}
            readingCount={book.readings?.length}
          />
        </div>
      </div>
    </li>
  );
}
