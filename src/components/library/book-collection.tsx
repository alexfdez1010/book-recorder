'use client';

import { useDeferredValue, useMemo, useRef, useState } from 'react';
import { BookOpen, SearchX } from 'lucide-react';
import type { CollectionBook } from '@/lib/books/reading-types';
import { collectionEntries } from '@/lib/books/readings';
import {
  filterCollection,
  groupCollection,
  type CollectionGrouping,
} from '@/lib/books/collection';
import { Button } from '@/components/ui/button';
import { BookEntry } from './book-entry';
import { ReadingHistoryDialog } from '@/components/readings/reading-history-dialog';
import { CollectionToolbar, type CollectionView } from './collection-toolbar';

interface BookCollectionProps {
  books: CollectionBook[];
  authors: string[];
  categories: string[];
  grouping: CollectionGrouping;
  showRating?: boolean;
  emptyTitle: string;
  emptyDescription: string;
}

/**
 * Keeps local search and layout state separate from server-owned book loading.
 * @param props - Persisted books, action options, grouping and first-use guidance.
 * @returns Grouped cards or an actionable empty state; filtering never changes data.
 */
export function BookCollection({
  books,
  authors,
  categories,
  grouping,
  showRating = false,
  emptyTitle,
  emptyDescription,
}: BookCollectionProps) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<CollectionView>('grid');
  const [historyId, setHistoryId] = useState<string | null>(null);
  const historyTrigger = useRef<HTMLButtonElement | null>(null);
  const collection = useRef<HTMLDivElement>(null);
  const historyBook = books.find((book) => book.id === historyId);
  const deferredQuery = useDeferredValue(query);
  const entries = useMemo(
    () => collectionEntries(books, grouping === 'month'),
    [books, grouping],
  );
  const filtered = useMemo(
    () => filterCollection(entries, deferredQuery),
    [entries, deferredQuery],
  );
  const groups = useMemo(
    () => groupCollection(filtered, grouping),
    [filtered, grouping],
  );
  /** Restores focus even when removing a reading also removes its original card. */
  function closeHistory() {
    setHistoryId(null);
    requestAnimationFrame(() => {
      if (historyTrigger.current?.isConnected) historyTrigger.current.focus();
      else
        (
          collection.current?.querySelector<HTMLButtonElement>(
            `[data-book-history="${CSS.escape(historyId ?? '')}"]`,
          ) ??
          collection.current?.querySelector<HTMLInputElement>(
            'input[type="search"]',
          )
        )?.focus();
    });
  }
  if (books.length === 0) {
    return (
      <div className="lib-empty">
        <BookOpen
          size={34}
          strokeWidth={1.25}
          className="mx-auto mb-5 text-leather"
          aria-hidden="true"
        />
        <p className="lib-empty__title">{emptyTitle}</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
          {emptyDescription}
        </p>
      </div>
    );
  }
  return (
    <div ref={collection} className="flex min-w-0 flex-col gap-8">
      {historyBook?.readings && (
        <ReadingHistoryDialog
          title={historyBook.title}
          readings={historyBook.readings}
          onClose={closeHistory}
        />
      )}
      <CollectionToolbar
        query={query}
        onQueryChange={setQuery}
        view={view}
        onViewChange={setView}
        resultCount={filtered.length}
        totalCount={entries.length}
        readings={grouping === 'month'}
      />
      <div
        className="flex min-w-0 flex-col gap-10"
        aria-busy={query !== deferredQuery}
      >
        {groups.length === 0 ? (
          <div className="lib-empty">
            <SearchX
              size={30}
              strokeWidth={1.5}
              className="mx-auto mb-4 text-ink-mute"
              aria-hidden="true"
            />
            <p className="lib-empty__title">No matching books</p>
            <p className="mt-3 text-sm text-ink-soft">
              Try another title, author or category.
            </p>
            <Button
              className="mt-5"
              variant="default"
              onClick={() => setQuery('')}
            >
              Show all books
            </Button>
          </div>
        ) : (
          groups.map((group, groupIndex) => (
            <section key={group.key} className="flex min-w-0 flex-col gap-5">
              {group.label && (
                <header className="lib-month-head">
                  <h2 className="lib-month-head__title">{group.label}</h2>
                  <span className="lib-meta">
                    {group.books.length}{' '}
                    {grouping === 'month'
                      ? group.books.length === 1
                        ? 'reading'
                        : 'readings'
                      : group.books.length === 1
                        ? 'book'
                        : 'books'}
                  </span>
                </header>
              )}
              <ul
                className={view === 'grid' ? 'lib-book-grid' : 'lib-book-list'}
              >
                {group.books.map((book, index) => (
                  <BookEntry
                    key={book.readingId ?? book.id}
                    book={book}
                    authors={authors}
                    categories={categories}
                    showRating={showRating}
                    priority={groupIndex === 0 && index < 4}
                    onShowHistory={(trigger) => {
                      historyTrigger.current = trigger;
                      setHistoryId(book.id);
                    }}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
