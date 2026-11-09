'use client';

import { useRef, useState } from 'react';
import type { Reading } from '../../../generated/prisma';
import { saveReadingAction } from '@/lib/books/reading-actions';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReadingForm } from './reading-form';
import { ReadingHistoryItem } from './reading-history-item';

/**
 * Exposes the shared history from every occurrence of a book in the journal.
 * Focused edits use the selected reading's snapshots; closing resets the selection.
 */
export function ReadingHistoryDialog({
  title,
  readings,
  onClose,
}: {
  title: string;
  readings: Reading[];
  onClose: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const selected = readings.find((reading) => reading.id === editing);

  /** Keeps a pending form mounted and resets history navigation on dismissal. */
  function changeOpen(next: boolean) {
    if (pending) return;
    if (!next) onClose();
  }

  /** Announces the changed dialog content without opening a mobile keyboard. */
  function showReading(id: string | null) {
    setEditing(id);
    requestAnimationFrame(() => heading.current?.focus());
  }

  return (
    <Dialog open onOpenChange={changeOpen}>
      <DialogContent>
        <DialogHeader className="border-0 pb-3">
          <DialogTitle ref={heading} tabIndex={-1}>
            {selected ? 'Edit reading' : 'Reading history'}
          </DialogTitle>
          <DialogDescription className="line-clamp-2 break-words" title={title}>
            {title}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {selected ? (
            <ReadingForm
              key={selected.id}
              initial={{
                ...selected,
                finishedOn: new Date(selected.finishedOn)
                  .toISOString()
                  .slice(0, 10),
              }}
              saveLabel="Save reading"
              onSave={(form) =>
                saveReadingAction(selected.bookId, form, selected.id)
              }
              onSaved={() => showReading(null)}
              onCancel={() => showReading(null)}
              onPendingChange={setPending}
            />
          ) : (
            <ol
              className="flex min-w-0 flex-col gap-5"
              aria-label="Reading history"
            >
              {readings.map((reading, index) => (
                <ReadingHistoryItem
                  key={reading.id}
                  reading={reading}
                  number={readings.length - index}
                  canDelete={readings.length > 1}
                  onEdit={() => showReading(reading.id)}
                  onRemoved={() => heading.current?.focus()}
                />
              ))}
            </ol>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
