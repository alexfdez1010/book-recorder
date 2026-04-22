'use client';

import { useState } from 'react';
import { BookSearchPanel } from './book-search-panel';
import { AddBookForm } from './add-book-form';
import type { BookCandidate } from '@/lib/books/types';

export function AddBookDialog() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<BookCandidate | null>(null);

  function close() {
    setOpen(false);
    setSelected(null);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Add book
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add book"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
          onClick={close}
        >
          <div
            className="mt-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {selected ? 'Confirm details' : 'Search for a book'}
              </h2>
              <button
                onClick={close}
                aria-label="Close"
                className="rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>
            {selected ? (
              <AddBookForm
                candidate={selected}
                onBack={() => setSelected(null)}
                onDone={close}
              />
            ) : (
              <BookSearchPanel onSelect={setSelected} />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
