'use client';

import { useRef } from 'react';
import { LayoutGrid, List, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CollectionView = 'grid' | 'list';
interface CollectionToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  view: CollectionView;
  onViewChange: (view: CollectionView) => void;
  resultCount: number;
  totalCount: number;
}

/**
 * Provides local collection search and persistent-in-session layout controls.
 * @param props - Controlled search/view values, change callbacks and result counts.
 * @returns Accessible search and pressed-state buttons; clear retains input focus.
 */
export function CollectionToolbar({
  query,
  onQueryChange,
  view,
  onViewChange,
  resultCount,
  totalCount,
}: CollectionToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  /** Clears the filter and returns keyboard focus to its input. */
  function clearSearch() {
    onQueryChange('');
    inputRef.current?.focus();
  }

  return (
    <div className="lib-collection-toolbar">
      <label className="lib-search-field">
        <Search size={17} aria-hidden="true" />
        <span className="sr-only">Search library</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Find a title, author or category"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onMouseDown={(event) => event.preventDefault()}
            onClick={clearSearch}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </label>
      <div className="flex items-center justify-between gap-4">
        <p
          className="lib-meta tabular-nums"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {query.trim()
            ? `${resultCount} of ${totalCount} books`
            : `${totalCount} ${totalCount === 1 ? 'book' : 'books'}`}
        </p>
        <div
          className="lib-view-switch"
          role="group"
          aria-label="Collection view"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            onClick={() => onViewChange('grid')}
          >
            <LayoutGrid size={17} aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="List view"
            aria-pressed={view === 'list'}
            onClick={() => onViewChange('list')}
          >
            <List size={18} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
