'use client';

import { useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import { searchBooksAction } from '@/lib/books/actions';
import type { BookCandidate } from '@/lib/books/types';
import { languageName } from '@/lib/books/language';
import { BookCover } from '@/components/book-cover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const list = await searchBooksAction(query);
        setResults(list);
        if (list.length === 0) setError('No matches.');
      } catch {
        setError('Network error.');
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSearch} className="flex gap-3">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title…"
          aria-label="Book title"
          className="flex-1"
        />
        <Button type="submit" variant="primary" disabled={pending || !query.trim()}>
          <Search className="h-4 w-4" strokeWidth={2.5} />
          {pending ? '…' : 'Search'}
        </Button>
      </form>

      {error ? <p className="lib-field-error">✕ {error}</p> : null}

      <div className="lib-stacks-head">
        <span className="lib-meta">
          {results.length > 0 ? `${results.length} results` : ''}
        </span>
        <button type="button" onClick={onManual} className="lib-linkish">
          Add manually →
        </button>
      </div>

      <ul className="lib-stacks" data-testid="search-results">
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
                  <Badge variant={c.source === 'openlibrary' ? 'solid' : 'accent'}>
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
