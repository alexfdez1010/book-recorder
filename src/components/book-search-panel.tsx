'use client';

import { useState, useTransition } from 'react';
import { searchBooksAction } from '@/lib/books/actions';
import type { BookCandidate } from '@/lib/books/types';
import { languageName } from '@/lib/books/language';

export function BookSearchPanel({ onSelect }: { onSelect: (c: BookCandidate) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const list = await searchBooksAction(query);
        setResults(list);
        if (list.length === 0) setError('No results. Try a different title.');
      } catch {
        setError('Search failed. Check your connection.');
      }
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex gap-2">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title (partial is fine)"
          aria-label="Book title"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <button
          type="submit"
          disabled={pending || !query.trim()}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <ul className="max-h-[50vh] space-y-2 overflow-y-auto" data-testid="search-results">
        {results.map((c) => (
          <li key={`${c.source}-${c.externalId}`}>
            <button
              onClick={() => onSelect(c)}
              className="flex w-full gap-3 rounded-lg border border-neutral-200 p-3 text-left hover:border-neutral-400 hover:bg-neutral-50"
            >
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                {c.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.title}</p>
                <p className="truncate text-sm text-neutral-600">{c.author}</p>
                <p className="text-xs text-neutral-500">
                  {c.publicationDate?.slice(0, 4) ?? '—'} · {c.pages ?? '?'} pages ·{' '}
                  {languageName(c.language)} · {c.source}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
