'use client';

import { useState, useTransition } from 'react';
import { addBookAction } from '@/lib/books/actions';
import type { BookCandidate } from '@/lib/books/types';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddBookForm({
  candidate,
  onBack,
  onDone,
}: {
  candidate: BookCandidate;
  onBack: () => void;
  onDone: () => void;
}) {
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
    <form action={submit} className="space-y-3 text-sm" data-testid="add-book-form">
      <input type="hidden" name="externalId" value={candidate.externalId} />
      <input type="hidden" name="source" value={candidate.source} />

      <Field label="Title" name="title" defaultValue={candidate.title} required />
      <Field label="Author" name="author" defaultValue={candidate.author} required />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Publication date"
          name="publicationDate"
          type="date"
          defaultValue={candidate.publicationDate ?? ''}
        />
        <Field
          label="Finished on"
          name="finishedOn"
          type="date"
          defaultValue={today()}
          required
        />
        <Field
          label="Pages"
          name="pages"
          type="number"
          min={1}
          defaultValue={candidate.pages ?? ''}
          required
        />
        <Field
          label="Language"
          name="language"
          defaultValue={candidate.language ?? 'en'}
          required
          placeholder="en"
        />
      </div>
      <Field
        label="Category"
        name="category"
        defaultValue={candidate.category ?? ''}
        required
      />
      <Field
        label="Cover URL"
        name="coverUrl"
        defaultValue={candidate.coverUrl ?? ''}
        placeholder="https://…"
      />

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save book'}
        </button>
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
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        min={min}
        className="rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900"
      />
    </label>
  );
}
