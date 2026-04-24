'use client';

import { useState, useTransition } from 'react';
import { Pencil } from 'lucide-react';
import { updateBookAction } from '@/lib/books/actions';
import { BOOK_CATEGORIES } from '@/lib/books/categories';
import { LANGUAGE_KEYS, LANGUAGE_NAMES } from '@/lib/books/language';
import { AuthorCombobox } from '@/components/author-combobox';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
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
  finishedOn: Date;
};

function dateInput(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : '';
}

export function EditBookDialog({ book, authors }: { book: BookLike; authors: string[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

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
          Amend
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogDescription>Form 08 · Emendation</DialogDescription>
          <DialogTitle>Amend entry</DialogTitle>
          <DialogDescription>Revise the particulars of this volume.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form action={submit} className="flex flex-col gap-5">
            <Field label="Title" name="title" defaultValue={book.title} required />
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
              <Field
                label="Finished on"
                name="finishedOn"
                type="date"
                defaultValue={dateInput(book.finishedOn)}
                required
              />
              <Field
                label="Pages"
                name="pages"
                type="number"
                min={1}
                defaultValue={book.pages}
                required
              />
              <SelectField
                label="Tongue"
                name="language"
                defaultValue={book.language}
                options={LANGUAGE_KEYS.map((k) => ({ value: k, label: LANGUAGE_NAMES[k] }))}
              />
            </div>
            <SelectField
              label="Shelf / category"
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
            {error ? (
              <p role="alert" className="lib-field-error">
                ✕ {error}
              </p>
            ) : null}
            <div className="lib-form-actions">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? 'Amending…' : 'Save changes ✎'}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  required,
  placeholder,
  min,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
}) {
  return (
    <div className="lib-field">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        min={min}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <div className="lib-field">
      <Label htmlFor={name}>{label}</Label>
      <Select id={name} name={name} defaultValue={defaultValue} required>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
