'use client';

import { useId, useState, useTransition } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { searchBooksAction } from '@/lib/books/actions';
import type { BookCandidate } from '@/lib/books/types';
import { languageName } from '@/lib/books/language';
import { BookCover } from '@/components/book-cover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

/**
 * Searches catalogues and announces loading, results and recoverable failures.
 * @param props - Callbacks for selecting a candidate or entering details manually.
 * @returns Search controls and results; blank queries never issue a request.
 */
export function BookSearchPanel({
  onSelect,
  onManual,
}: {
  onSelect: (c: BookCandidate) => void;
  onManual: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [searched, setSearched] = useState(false);
  const inputId = useId();

  /** Queries the search action and displays empty or network error states. */
  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (pending || !query.trim()) return;
    setError(null);
    setResults([]);
    setSearched(false);
    start(async () => {
      try {
        const list = await searchBooksAction(query.trim());
        setResults(list);
        setSearched(true);
      } catch {
        setError(
          'Could not search for books. Try again or add the book manually.',
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSearch} className="flex flex-col gap-3">
        <Label htmlFor={inputId}>Book title</Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id={inputId}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title…"
            aria-label="Book title"
            disabled={pending}
            className="min-w-0 flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={pending || !query.trim()}
          >
            <Search className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            {pending ? 'Searching…' : 'Search'}
          </Button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="lib-field-error">
          {error}
        </p>
      ) : null}

      <div className="lib-stacks-head">
        <span className="lib-meta" role="status" aria-atomic="true">
          {pending
            ? 'Searching catalogues…'
            : searched
              ? `${results.length} results`
              : 'Search by title or add your own details.'}
        </span>
        <Button
          type="button"
          onClick={onManual}
          variant="link"
          className="shrink-0"
        >
          Add manually <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {searched && results.length === 0 ? (
        <p className="text-sm text-ink-soft">
          No matches. Try another title or add the book manually.
        </p>
      ) : null}

      <ul
        className="lib-stacks"
        data-testid="search-results"
        aria-label="Book search results"
        aria-busy={pending}
      >
        {results.map((c) => (
          <li key={`${c.source}-${c.externalId}`}>
            <button onClick={() => onSelect(c)} className="lib-result">
              <BookCover
                title={c.title}
                author={c.author}
                coverUrl={c.coverUrl}
                size="sm"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="lib-result__title">{c.title}</p>
                <p className="lib-result__author">by {c.author}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge>{c.publicationDate?.slice(0, 4) ?? '—'}</Badge>
                  <Badge variant="gilt">{c.pages ?? '?'} pp</Badge>
                  <Badge variant="moss">{languageName(c.language)}</Badge>
                  <Badge
                    variant={c.source === 'openlibrary' ? 'solid' : 'accent'}
                  >
                    {c.source === 'openlibrary' ? 'OL' : 'GB'}
                  </Badge>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
