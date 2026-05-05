'use client';

import { useId, useState } from 'react';
import { Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const STARS = [1, 2, 3, 4, 5] as const;

export type StarRatingValue = number | null;

/**
 * Interactive 1–5 star picker with hover preview and a hidden input for form submission.
 * Pass `name` to expose the value as form data; otherwise control via `value` + `onChange`.
 */
export function StarRating({
  name,
  value,
  defaultValue = null,
  onChange,
  size = 'md',
  readOnly = false,
  ariaLabel = 'Rating',
}: {
  name?: string;
  value?: StarRatingValue;
  defaultValue?: StarRatingValue;
  onChange?: (v: StarRatingValue) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  ariaLabel?: string;
}) {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<StarRatingValue>(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const groupId = useId();
  const current = isControlled ? value : inner;
  const display = hover ?? current ?? 0;
  const px = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';

  function set(v: StarRatingValue) {
    if (readOnly) return;
    if (!isControlled) setInner(v);
    onChange?.(v);
  }

  return (
    <div
      className="lib-rating"
      role="radiogroup"
      aria-label={ariaLabel}
      onMouseLeave={() => setHover(null)}
    >
      {name ? <input type="hidden" name={name} value={current ?? ''} /> : null}
      {STARS.map((n) => {
        const filled = n <= display;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={current === n}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            id={`${groupId}-${n}`}
            disabled={readOnly}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(null)}
            onClick={() => set(current === n ? null : n)}
            className={cn(
              'lib-rating__star',
              filled && 'lib-rating__star--on',
              readOnly && 'lib-rating__star--ro',
            )}
          >
            <Star
              className={px}
              strokeWidth={2.5}
              fill={filled ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
      {!readOnly && current !== null ? (
        <button
          type="button"
          aria-label="Clear rating"
          className="lib-rating__clear"
          onClick={() => set(null)}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  );
}
