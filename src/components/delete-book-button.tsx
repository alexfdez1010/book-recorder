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
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';

export function DeleteBookButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function confirm() {
    start(async () => {
      await deleteBookAction(id);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
      <DialogTrigger asChild>
        <button className="lib-strike" type="button" disabled={pending}>
          <Trash2 className="h-3 w-3" strokeWidth={2.5} />
          {pending ? '…' : 'Delete'}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete book?</DialogTitle>
          <DialogDescription>
            “{title}” will be removed.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="ghost" type="button" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
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
