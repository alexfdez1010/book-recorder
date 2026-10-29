import type { ReactNode } from 'react';

interface CollectionHeaderProps {
  title: string;
  description: string;
  count: number;
  pages: number;
  queued?: boolean;
  children?: ReactNode;
}

/**
 * Orients the reader with one collection heading, real totals and optional action.
 * @param props - Display copy, collection totals, queue context and action slot.
 * @returns A responsive page header; totals always describe the complete collection.
 */
export function CollectionHeader({
  title,
  description,
  count,
  pages,
  queued = false,
  children,
}: CollectionHeaderProps) {
  return (
    <div className="lib-section-head">
      <div className="min-w-0">
        <h1 className="lib-title">{title}</h1>
        <p className="lib-subtitle mt-3">{description}</p>
        <p className="lib-meta mt-4 tabular-nums">
          <span className="font-medium text-ink">
            {count.toLocaleString('en-US')}
          </span>{' '}
          {count === 1 ? 'book' : 'books'}
          <span aria-hidden="true" className="px-2.5">
            ·
          </span>
          <span className="font-medium text-ink">
            {pages.toLocaleString('en-US')}
          </span>{' '}
          pages{queued ? ' queued' : ' read'}
        </p>
      </div>
      {children}
    </div>
  );
}
