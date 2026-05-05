'use client';

import { useState, useTransition } from 'react';
import { BookCheck } from 'lucide-react';
import { markBookAsFinishedAction } from '@/lib/books/actions';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MarkAsFinishedButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(today);
  const [rating, setRating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function confirm() {
    setError(null);
    start(async () => {
      const result = await markBookAsFinishedAction(id, date, rating);
      if (result.error) setError(result.error);
      else {
        setOpen(false);
        setDate(today());
        setRating(null);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (pending) return;
        setOpen(o);
        if (!o) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <button className="lib-amend" type="button" disabled={pending}>
          <BookCheck className="h-3 w-3" strokeWidth={2.5} />
          {pending ? '…' : 'Mark finished'}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as finished</DialogTitle>
          <DialogDescription>
            “{title}” will move to your finished shelf.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-5">
            <div className="lib-field">
              <Label htmlFor={`finishedOn-${id}`}>Finished on</Label>
              <Input
                id={`finishedOn-${id}`}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="lib-field">
              <Label>Rating</Label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            {error ? (
              <p role="alert" className="lib-field-error">
                ✕ {error}
              </p>
            ) : null}
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
                disabled={pending || !date}
              >
                <BookCheck className="h-4 w-4" strokeWidth={2.5} />
                {pending ? '…' : 'Mark finished'}
              </Button>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
