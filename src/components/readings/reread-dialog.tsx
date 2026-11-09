'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { Book } from '../../../generated/prisma';
import { localDate } from '@/lib/books/local-date';
import { saveReadingAction } from '@/lib/books/reading-actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReadingForm } from './reading-form';

/**
 * Registers a finished reread using catalogue defaults and blank personal fields.
 * Opening refreshes the local date; a failed save retains its request id and values.
 */
export function RereadDialog({ book }: { book: Book }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [request, setRequest] = useState({ id: '', date: '' });

  /** Creates a new retry identity only when starting a new form session. */
  function changeOpen(next: boolean) {
    if (pending) return;
    if (next) setRequest({ id: crypto.randomUUID(), date: localDate() });
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <Button variant="link" className="lib-amend" type="button">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Register reread
      </Button>
      <DialogContent>
        <DialogHeader className="border-0 pb-3">
          <DialogTitle>Register reread</DialogTitle>
          <DialogDescription
            className="line-clamp-2 break-words"
            title={book.title}
          >
            {book.title}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <ReadingForm
            key={request.id}
            requestId={request.id}
            initial={{
              finishedOn: request.date,
              pages: book.pages,
              language: book.language,
              rating: null,
              opinion: null,
            }}
            saveLabel="Save reread"
            onSave={(form) => saveReadingAction(book.id, form)}
            onSaved={() => setOpen(false)}
            onCancel={() => setOpen(false)}
            onPendingChange={setPending}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
