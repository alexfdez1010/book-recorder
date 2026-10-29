import type { Book } from '../../../generated/prisma';
import { BookCover } from '@/components/book-cover';
import { BookOpinion } from '@/components/book-opinion';
import { DeleteBookButton } from '@/components/delete-book-button';
import { EditBookDialog } from '@/components/edit-book-dialog';
import { InlineRating } from '@/components/inline-rating';
import { MarkAsFinishedButton } from '@/components/mark-as-finished-button';
import { Badge } from '@/components/ui/badge';
import { languageName } from '@/lib/books/language';

interface BookEntryProps {
  book: Book;
  authors: string[];
  categories: string[];
  showRating: boolean;
  priority?: boolean;
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
}: BookEntryProps) {
  const queued = book.status === 'to-read';
  return (
    <li className="lib-card">
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
          </div>
          <h3 className="lib-card__title" title={book.title}>
            {book.title}
          </h3>
          <p className="lib-card__author" title={book.author}>
            {book.author}
          </p>
          <p className="mt-auto pt-4 text-xs text-ink-mute">
            {book.pages.toLocaleString('en-US')} pages{' '}
            <span aria-hidden="true" className="px-1">
              ·
            </span>{' '}
            {languageName(book.language)}
          </p>
        </div>
      </div>
      <BookOpinion opinion={book.opinion} />
      <div className="lib-card__foot">
        {showRating && !queued && (
          <InlineRating id={book.id} rating={book.rating} />
        )}
        <div className="lib-card__actions ml-auto flex flex-wrap items-center gap-3">
          {queued && <MarkAsFinishedButton id={book.id} title={book.title} />}
          <EditBookDialog
            book={book}
            authors={authors}
            categories={categories}
          />
          <DeleteBookButton id={book.id} title={book.title} />
        </div>
      </div>
    </li>
  );
}
