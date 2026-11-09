'use client';

import { useId } from 'react';
import { TextArea } from '@heroui/react';
import { Label } from '@/components/ui/label';

/** Renders an optional opinion input; submits plain text and treats empty as clearing. */
export function OpinionField({
  defaultValue,
  showHint = true,
}: {
  defaultValue?: string | null;
  showHint?: boolean;
}) {
  const id = useId();
  return (
    <div className="lib-field">
      <Label htmlFor={id}>Opinion (optional)</Label>
      <TextArea
        id={id}
        name="opinion"
        defaultValue={defaultValue ?? ''}
        maxLength={10000}
        rows={4}
        placeholder="What did you think of this book?"
        className="lib-input w-full min-w-0 resize-y text-base"
        aria-describedby={showHint ? `${id}-hint` : undefined}
      />
      {showHint && (
        <p id={`${id}-hint`} className="text-xs text-ink-soft">
          Your thoughts, favourite passages, or what stayed with you.
        </p>
      )}
    </div>
  );
}
