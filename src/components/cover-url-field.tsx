'use client';

import { useId, useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import { searchBooksAction } from '@/lib/books/actions';
import { selectBookCovers, type BookCoverCandidate } from '@/lib/books/covers';
import { BookCover } from '@/components/book-cover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Edits a cover URL and searches using the enclosing form's current title.
 * @param defaultValue - Saved URL; null initializes an empty field.
 * @returns A URL field with selectable previews. Selection changes only this field;
 * the enclosing form persists it on save. Blank titles never issue a search.
 */
export function CoverUrlField({
  defaultValue,
}: {
  defaultValue: string | null;
}) {
  const id = useId();
  const [url, setUrl] = useState(defaultValue ?? '');
  const [results, setResults] = useState<BookCoverCandidate[]>([]);
  const [message, setMessage] = useState('');
  const [pending, start] = useTransition();

  /** Reads the current title and searches without submitting or changing book metadata. */
  function search(form: HTMLFormElement | null) {
    const title = form
      ? String(new FormData(form).get('title') ?? '').trim()
      : '';
    setResults([]);
    if (!title) {
      setMessage('Enter a book title first.');
      return;
    }
    setMessage('Searching for covers…');
    start(async () => {
      try {
        const covers = selectBookCovers(await searchBooksAction(title));
        setResults(covers);
        setMessage(
          covers.length
            ? 'Choose a cover to fill its URL.'
            : 'No covers found. You can paste a URL or try again.',
        );
      } catch {
        setMessage('Could not search for covers. Please try again.');
      }
    });
  }

  /** Copies the selected image URL into the form, leaving persistence to Save. */
  function select(coverUrl: string) {
    setUrl(coverUrl);
    setResults([]);
    setMessage('Cover URL selected. Save the book to apply it.');
  }

  return (
    <div className="lib-field min-w-0">
      <Label htmlFor={id}>Cover URL</Label>
      <Input
        id={id}
        name="coverUrl"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://…"
      />
      <Button
        type="button"
        variant="default"
        size="sm"
        className="self-start"
        onClick={(event) => search(event.currentTarget.closest('form'))}
        disabled={pending}
      >
        <Search className="h-4 w-4" aria-hidden />
        {pending ? 'Searching…' : 'Find cover by title'}
      </Button>
      <p role="status" className="text-sm text-ink-soft">
        {message}
      </p>
      {results.length > 0 ? (
        <ul
          aria-label="Cover search results"
          className="flex max-h-72 flex-col gap-2 overflow-y-auto"
        >
          {results.map((cover) => (
            <li key={cover.coverUrl}>
              <button
                type="button"
                onClick={() => select(cover.coverUrl)}
                className="flex w-full items-center gap-3 border border-paper-edge p-2 text-left hover:bg-paper-dark focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <BookCover
                  title={cover.title}
                  author={cover.author}
                  coverUrl={cover.coverUrl}
                  size="sm"
                />
                <span className="min-w-0 text-sm">
                  <span className="block break-words font-semibold">
                    {cover.title}
                  </span>
                  <span className="block break-words text-ink-soft">
                    {cover.author}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
