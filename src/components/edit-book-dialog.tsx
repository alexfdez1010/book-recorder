'use client';

import { useState, useTransition } from 'react';
import { Pencil } from 'lucide-react';
import { updateBookAction } from '@/lib/books/actions';
import { BOOK_CATEGORIES } from '@/lib/books/categories';
import { LANGUAGE_KEYS, LANGUAGE_NAMES } from '@/lib/books/language';
import { AuthorCombobox } from '@/components/author-combobox';
import { Field, SelectField } from '@/components/form-fields';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type BookLike = {
  id: string;
  title: string;
  author: string;
  publicationDate: Date | null;
  pages: number;
  coverUrl: string | null;
  category: string;
  language: string;
  status: string;
  finishedOn: Date | null;
  rating: number | null;
};

function dateInput(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : '';
}

export function EditBookDialog({
  book,
  authors,
}: {
  book: BookLike;
  authors: string[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const isFinished = book.status === 'finished';

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const result = await updateBookAction(book.id, formData);
      if (result.error) setError(result.error);
      else setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
      <DialogTrigger asChild>
        <button className="lib-amend" type="button">
          <Pencil className="h-3 w-3" strokeWidth={2.5} />
          Edit
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit book</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form action={submit} className="flex flex-col gap-5">
            <input type="hidden" name="status" value={book.status} />
            <Field
              label="Title"
              name="title"
              defaultValue={book.title}
              required
            />
            <div className="lib-field">
              <Label htmlFor={`author-${book.id}`}>Author</Label>
              <AuthorCombobox
                id={`author-${book.id}`}
                name="author"
                authors={authors}
                defaultValue={book.author}
                required
              />
            </div>
            <div className="lib-form-grid">
              <Field
                label="Publication date"
                name="publicationDate"
                type="date"
                defaultValue={dateInput(book.publicationDate)}
              />
              {isFinished ? (
                <Field
                  label="Finished on"
                  name="finishedOn"
                  type="date"
                  defaultValue={dateInput(book.finishedOn)}
                  required
                />
              ) : null}
              <Field
                label="Pages"
                name="pages"
                type="number"
                min={1}
                defaultValue={book.pages}
                required
              />
              <SelectField
                label="Language"
                name="language"
                defaultValue={book.language}
                options={LANGUAGE_KEYS.map((k) => ({
                  value: k,
                  label: LANGUAGE_NAMES[k],
                }))}
              />
            </div>
            <SelectField
              label="Category"
              name="category"
              defaultValue={book.category}
              options={BOOK_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <Field
              label="Cover URL"
              name="coverUrl"
              defaultValue={book.coverUrl ?? ''}
              placeholder="https://…"
            />
            {isFinished ? (
              <div className="lib-field">
                <Label htmlFor={`rating-${book.id}`}>Rating</Label>
                <StarRating name="rating" defaultValue={book.rating ?? null} />
              </div>
            ) : null}
            {error ? (
              <p role="alert" className="lib-field-error">
                ✕ {error}
              </p>
            ) : null}
            <div className="lib-form-actions">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
