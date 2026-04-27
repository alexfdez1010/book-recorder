'use client';

import { useState, useTransition } from 'react';
import { addBookAction } from '@/lib/books/actions';
import type { BookCandidate } from '@/lib/books/types';
import { BOOK_CATEGORIES } from '@/lib/books/categories';
import { LANGUAGE_KEYS, LANGUAGE_NAMES } from '@/lib/books/language';
import type { BookStatus } from '@/lib/books/status';
import { AuthorCombobox } from '@/components/author-combobox';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddBookForm({
  candidate,
  authors,
  status = 'finished',
  onCancel,
  onDone,
}: {
  candidate: BookCandidate | null;
  authors: string[];
  status?: BookStatus;
  onCancel: () => void;
  onDone: () => void;
}) {
  const source = candidate?.source ?? 'manual';
  const externalId = candidate?.externalId ?? '';
  const isFinished = status === 'finished';
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const result = await addBookAction(formData);
      if (result.error) setError(result.error);
      else onDone();
    });
  }

  return (
    <form action={submit} className="flex flex-col gap-5" data-testid="add-book-form">
      <input type="hidden" name="externalId" value={externalId} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="status" value={status} />

      <Field label="Title" name="title" defaultValue={candidate?.title ?? ''} required />
      <div className="lib-field">
        <Label htmlFor="author">Author</Label>
        <AuthorCombobox
          id="author"
          name="author"
          authors={authors}
          defaultValue={candidate?.author ?? ''}
          required
        />
      </div>

      <div className="lib-form-grid">
        <Field
          label="Publication date"
          name="publicationDate"
          type="date"
          defaultValue={candidate?.publicationDate ?? ''}
        />
        {isFinished ? (
          <Field
            label="Finished on"
            name="finishedOn"
            type="date"
            defaultValue={today()}
            required
          />
        ) : null}
        <Field
          label="Pages"
          name="pages"
          type="number"
          min={1}
          defaultValue={candidate?.pages ?? ''}
          required
        />
        <SelectField
          label="Language"
          name="language"
          defaultValue={candidate?.language ?? 'en'}
          options={LANGUAGE_KEYS.map((k) => ({ value: k, label: LANGUAGE_NAMES[k] }))}
        />
      </div>

      <SelectField
        label="Category"
        name="category"
        defaultValue={candidate?.category ?? 'Other'}
        options={BOOK_CATEGORIES.map((c) => ({ value: c, label: c }))}
      />
      <Field
        label="Cover URL"
        name="coverUrl"
        defaultValue={candidate?.coverUrl ?? ''}
        placeholder="https://…"
      />

      {error ? (
        <p role="alert" className="lib-field-error">
          ✕ {error}
        </p>
      ) : null}

      <div className="lib-form-actions">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </Button>
        </div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Saving…' : isFinished ? 'Save book' : 'Save to read'}
        </Button>
      </div>
    </form>
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
