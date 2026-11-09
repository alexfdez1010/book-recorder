'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteBookAction } from '@/lib/books/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

/** Confirms deletion for the supplied book; disables controls while saving. */
export function DeleteBookButton({
  id,
  title,
  readingCount = 0,
}: {
  id: string;
  title: string;
  readingCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  /** Deletes the selected book and closes the confirmation after success. */
  function confirm() {
    start(async () => {
      await deleteBookAction(id);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
      <Button
        variant="link"
        className="lib-strike"
        type="button"
        disabled={pending}
      >
        <Trash2 className="h-3 w-3" strokeWidth={2.5} />
        {pending ? '…' : 'Delete'}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete book?</DialogTitle>
          <DialogDescription>
            “{title}”
            {readingCount > 1
              ? ` and all ${readingCount} readings, ratings and opinions`
              : ''}{' '}
            will be removed.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              type="button"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={confirm}
              disabled={pending}
            >
              <Trash2 className="h-4 w-4" strokeWidth={2.5} />
              {pending ? '…' : 'Delete'}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
