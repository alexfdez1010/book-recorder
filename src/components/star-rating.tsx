'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const STARS = [1, 2, 3, 4, 5] as const;
const VALUES = STARS.flatMap((star) => [star - 0.5, star]);

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
 * Arrow keys select and wrap; Tab enters once. Read-only renders a labelled image;
 * disabled temporarily blocks editing and form submission. `onChange` receives
 * the selected value or null on clearing. `name` adds a hidden form value.
 */
export function StarRating({
  name,
  value,
  defaultValue = null,
  onChange,
  size = 'md',
  readOnly = false,
  disabled = false,
  ariaLabel = 'Rating',
}: {
  name?: string;
  value?: StarRatingValue;
  defaultValue?: StarRatingValue;
  onChange?: (v: StarRatingValue) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<StarRatingValue>(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const groupId = useId();
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const current = isControlled ? value : inner;
  const display = (!disabled && !readOnly ? hover : null) ?? current ?? 0;
  const px = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';

  /** Updates the selected value and notifies its owner; blocked controls do nothing. */
  function set(v: StarRatingValue) {
    if (readOnly || disabled) return;
    setHover(null);
    if (current === v) return;
    if (!isControlled) setInner(v);
    onChange?.(v);
  }

  /** Selects and focuses an adjacent value; prevents arrow keys from scrolling. */
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, v: number) {
    const index = VALUES.indexOf(v);
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % VALUES.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (index + VALUES.length - 1) % VALUES.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = VALUES.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    if (readOnly || disabled) return;
    buttons.current[next]?.focus();
    set(VALUES[next]);
  }

  return (
    <div
      className="lib-rating"
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={
        readOnly
          ? `${ariaLabel}: ${current ? ratingLabel(current) : 'Not rated'}`
          : ariaLabel
      }
      aria-disabled={!readOnly && disabled ? true : undefined}
      data-readonly={readOnly ? '' : undefined}
      onMouseLeave={() => setHover(null)}
    >
      {name ? (
        <input
          type="hidden"
          name={name}
          value={current ?? ''}
          disabled={disabled}
        />
      ) : null}
      {STARS.map((n) => {
        const fill: Fill =
          display >= n ? 'full' : display >= n - 0.5 ? 'half' : 'none';
        return (
          <span key={n} className="lib-rating__star">
            <StarIcon px={px} fill={fill} />
            {!readOnly &&
              [n - 0.5, n].map((v) => (
                <button
                  ref={(button) => {
                    buttons.current[v * 2 - 1] = button;
                  }}
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={current === v}
                  aria-label={ratingLabel(v)}
                  id={`${groupId}-${v * 2}`}
                  aria-disabled={disabled ? true : undefined}
                  tabIndex={(current ?? 0.5) === v ? 0 : -1}
                  onMouseEnter={() => {
                    if (!disabled) setHover(v);
                  }}
                  onFocus={() => {
                    if (!disabled) setHover(v);
                  }}
                  onBlur={() => setHover(null)}
                  onClick={() => set(current === v ? null : v)}
                  onKeyDown={(event) => handleKeyDown(event, v)}
                  className={cn(
                    'lib-rating__hit',
                    v < n ? 'lib-rating__hit--l' : 'lib-rating__hit--r',
                  )}
                />
              ))}
          </span>
        );
      })}
    </div>
  );
}
