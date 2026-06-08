'use client';

import { useId, useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const STARS = [1, 2, 3, 4, 5] as const;

export type StarRatingValue = number | null;

type Fill = 'full' | 'half' | 'none';

/** Label a half-star value like `2.5 stars` / `1 star` for screen readers. */
function ratingLabel(v: number): string {
  return `${v} star${v === 1 ? '' : 's'}`;
}

/**
 * One star: a muted outline overlaid by a brass fill clipped to the active
 * fraction (full, left-half, or empty). Purely presentational.
 */
function StarIcon({ px, fill }: { px: string; fill: Fill }) {
  return (
    <span className="lib-rating__icon" aria-hidden>
      <Star
        className={cn(px, 'lib-rating__base')}
        strokeWidth={2.5}
        fill="none"
      />
      {fill !== 'none' ? (
        <span
          className="lib-rating__fill"
          style={fill === 'half' ? { width: '50%' } : undefined}
        >
          <Star className={px} strokeWidth={2.5} fill="currentColor" />
        </span>
      ) : null}
    </span>
  );
}

/**
 * Interactive 0.5–5 star picker with half-star precision, hover preview and a
 * hidden input for form submission. Each star exposes a left hit-area (n − 0.5)
 * and a right hit-area (n); clicking the currently selected value clears it.
 * Pass `name` to expose the value as form data; otherwise control via `value`
 * + `onChange`.
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
        const fill: Fill =
          display >= n ? 'full' : display >= n - 0.5 ? 'half' : 'none';
        return (
          <span key={n} className="lib-rating__star">
            <StarIcon px={px} fill={fill} />
            {[n - 0.5, n].map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={current === v}
                aria-label={ratingLabel(v)}
                id={`${groupId}-${v * 2}`}
                disabled={readOnly}
                onMouseEnter={() => setHover(v)}
                onFocus={() => setHover(v)}
                onBlur={() => setHover(null)}
                onClick={() => set(current === v ? null : v)}
                className={cn(
                  'lib-rating__hit',
                  v < n ? 'lib-rating__hit--l' : 'lib-rating__hit--r',
                  readOnly && 'lib-rating__hit--ro',
                )}
              />
            ))}
          </span>
        );
      })}
    </div>
  );
}
