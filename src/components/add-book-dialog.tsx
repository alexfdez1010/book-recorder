'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { BookSearchPanel } from './book-search-panel';
import { AddBookForm } from './add-book-form';
import type { BookCandidate } from '@/lib/books/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Mode =
  | { kind: 'search' }
  | { kind: 'selected'; candidate: BookCandidate }
  | { kind: 'manual' };

export function AddBookDialog({ authors }: { authors: string[] }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>({ kind: 'search' });

  function close() {
    setOpen(false);
    setMode({ kind: 'search' });
  }

  const title =
    mode.kind === 'manual'
      ? 'Add manually'
      : mode.kind === 'selected'
        ? 'Confirm details'
        : 'Add book';

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setMode({ kind: 'search' });
      }}
    >
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add book
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {mode.kind === 'search' ? (
            <BookSearchPanel
              onSelect={(c) => setMode({ kind: 'selected', candidate: c })}
              onManual={() => setMode({ kind: 'manual' })}
            />
          ) : (
            <AddBookForm
              candidate={mode.kind === 'selected' ? mode.candidate : null}
              authors={authors}
              onCancel={close}
              onDone={close}
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
