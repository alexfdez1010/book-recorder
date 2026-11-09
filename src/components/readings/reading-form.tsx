'use client';

import { useId, useRef, useState, useTransition, type FormEvent } from 'react';
import type { ReadingInput } from '@/lib/books/reading-types';
import { LANGUAGE_KEYS, LANGUAGE_NAMES } from '@/lib/books/language';
import { Field, SelectField } from '@/components/form-fields';
import { OpinionField } from '@/components/opinion-field';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ReadingFormProps {
  initial: Omit<ReadingInput, 'finishedOn'> & { finishedOn: string };
  requestId?: string;
  saveLabel: string;
  onSave: (form: FormData) => Promise<{ error?: string }>;
  onSaved: () => void;
  onCancel: () => void;
  onPendingChange: (pending: boolean) => void;
}

/**
 * Edits a completed reading with edition fields disclosed only when needed.
 * Explicit submit handling retains entered text after failed or uncertain saves.
 * A stable request id and synchronous guard protect retries and rapid double taps.
 */
export function ReadingForm({
  initial,
  requestId,
  saveLabel,
  onSave,
  onSaved,
  onCancel,
  onPendingChange,
}: ReadingFormProps) {
  const id = useId();
  const saving = useRef(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  /** Captures values before awaiting persistence; failures leave the form intact. */
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true;
    const data = new FormData(event.currentTarget);
    setError(null);
    onPendingChange(true);
    start(async () => {
      try {
        const result = await onSave(data);
        if (result.error) setError(result.error);
        else onSaved();
      } catch {
        setError(
          'Reading could not be saved. Your changes are still here; please try again.',
        );
      } finally {
        saving.current = false;
        onPendingChange(false);
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="flex min-w-0 flex-col gap-5"
      aria-busy={pending}
    >
      {requestId && <input type="hidden" name="requestId" value={requestId} />}
      <fieldset disabled={pending} className="flex min-w-0 flex-col gap-5">
        <Field
          id={`${id}-date`}
          label="Finished on"
          name="finishedOn"
          type="date"
          defaultValue={initial.finishedOn}
          required
        />
        <div className="lib-field">
          <Label>Rating (optional)</Label>
          <StarRating
            name="rating"
            defaultValue={initial.rating}
            ariaLabel="Reading rating"
            disabled={pending}
          />
        </div>
        <OpinionField defaultValue={initial.opinion} showHint={false} />
        <details className="min-w-0">
          <summary className="min-h-11 cursor-pointer py-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2">
            Edition and language
          </summary>
          <div className="mt-3 grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              id={`${id}-pages`}
              label="Pages"
              name="pages"
              type="number"
              min={1}
              defaultValue={initial.pages}
              required
            />
            <SelectField
              id={`${id}-language`}
              label="Language"
              name="language"
              defaultValue={initial.language}
              options={LANGUAGE_KEYS.map((key) => ({
                value: key,
                label: LANGUAGE_NAMES[key],
              }))}
            />
          </div>
        </details>
      </fieldset>
      {error && (
        <p role="alert" className="lib-field-error">
          {error}
        </p>
      )}
      <div className="lib-form-actions sticky bottom-0 border-0 bg-bone py-3">
        <Button
          variant="ghost"
          type="button"
          disabled={pending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : saveLabel}
        </Button>
      </div>
    </form>
  );
}
