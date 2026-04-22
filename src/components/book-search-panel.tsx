'use client';

import { useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import { searchBooksAction } from '@/lib/books/actions';
import type { BookCandidate } from '@/lib/books/types';
import { languageName } from '@/lib/books/language';
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
        if (list.length === 0) setError('No match found in the stacks.');
      } catch {
        setError('The wires failed us. Check your connection.');
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSearch} className="flex gap-3">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title — partial is fine…"
          aria-label="Book title"
          className="flex-1"
        />
        <Button type="submit" disabled={pending || !query.trim()}>
          <Search className="h-4 w-4" strokeWidth={3} />
          {pending ? 'Hunting…' : 'Hunt'}
        </Button>
      </form>

      {error ? (
        <p className="border-[3px] border-blood bg-paper px-3 py-2 font-mono text-xs text-blood uppercase tracking-[0.12em]">
          ✕ {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between border-b-2 border-dashed border-ink/40 pb-3 pt-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-mute">
          {results.length > 0 ? `${results.length} candidates` : 'Awaiting query'}
        </span>
        <button
          type="button"
          onClick={onManual}
          className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-ink underline decoration-2 underline-offset-4 hover:text-blood"
        >
          Can&apos;t find it? Write it yourself →
        </button>
      </div>

      <ul
        className="max-h-[46vh] space-y-4 overflow-y-auto pr-2 pb-1"
        data-testid="search-results"
      >
        {results.map((c) => (
          <li key={`${c.source}-${c.externalId}`}>
            <button
              onClick={() => onSelect(c)}
              className="flex w-full gap-4 border-[3px] border-ink bg-bone p-4 text-left brutal-press brutal-shadow-sm"
            >
              <div className="h-20 w-14 shrink-0 overflow-hidden border-[2px] border-ink bg-ink">
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
                <p className="truncate font-serif text-base font-bold leading-tight">
                  {c.title}
                </p>
                <p className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                  by {c.author}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge variant="ink">{c.publicationDate?.slice(0, 4) ?? '—'}</Badge>
                  <Badge variant="ochre">{c.pages ?? '?'} pp</Badge>
                  <Badge variant="moss">{languageName(c.language)}</Badge>
                  <Badge variant={c.source === 'openlibrary' ? 'solid' : 'blood'}>
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
