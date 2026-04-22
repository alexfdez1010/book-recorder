'use client';

import { useState, useTransition } from 'react';
import { addBookAction } from '@/lib/books/actions';
import type { BookCandidate } from '@/lib/books/types';
import { BOOK_CATEGORIES } from '@/lib/books/categories';
import { LANGUAGE_KEYS, LANGUAGE_NAMES } from '@/lib/books/language';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AddBookForm({
  candidate,
  onBack,
  onDone,
}: {
  candidate: BookCandidate | null;
  onBack: () => void;
  onDone: () => void;
}) {
  const source = candidate?.source ?? 'manual';
  const externalId = candidate?.externalId ?? '';
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
    <form action={submit} className="space-y-6" data-testid="add-book-form">
      <input type="hidden" name="externalId" value={externalId} />
      <input type="hidden" name="source" value={source} />

      <Field label="Title" name="title" defaultValue={candidate?.title ?? ''} required />
      <Field label="Author" name="author" defaultValue={candidate?.author ?? ''} required />

      <div className="grid grid-cols-2 gap-5">
        <Field
          label="Publication date"
          name="publicationDate"
          type="date"
          defaultValue={candidate?.publicationDate ?? ''}
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
          defaultValue={candidate?.pages ?? ''}
          required
        />
        <SelectField
          label="Tongue"
          name="language"
          defaultValue={candidate?.language ?? 'en'}
          options={LANGUAGE_KEYS.map((k) => ({ value: k, label: LANGUAGE_NAMES[k] }))}
        />
      </div>

      <SelectField
        label="Shelf / category"
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
        <p
          role="alert"
          className="border-[3px] border-blood bg-paper px-3 py-2 font-mono text-xs text-blood uppercase tracking-[0.12em]"
        >
          ✕ {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between pt-6 mt-2 border-t-[3px] border-ink">
        <Button type="button" variant="paper" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <Button type="submit" variant="ink" disabled={pending}>
          {pending ? 'Inscribing…' : 'Inscribe entry ✎'}
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
    <div className="flex flex-col gap-1.5">
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
    <div className="flex flex-col gap-1.5">
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
