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
  DialogDescription,
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
      ? 'Add by hand'
      : mode.kind === 'selected'
        ? 'Confirm details'
        : 'Catalogue a volume';
  const desc =
    mode.kind === 'manual'
      ? 'No match in the stacks — write the entry yourself.'
      : mode.kind === 'selected'
        ? 'Verify the metadata before it is inscribed in the ledger.'
        : 'Search the world’s libraries. Pick one. Or write your own.';

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
          New entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogDescription>Form 07 · Acquisition</DialogDescription>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
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
              onBack={() => setMode({ kind: 'search' })}
              onDone={close}
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
