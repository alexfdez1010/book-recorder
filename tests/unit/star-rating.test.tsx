import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StarRating } from '@/components/star-rating';

/** Renders the control's accessible HTML without browser or network dependencies. */
function render(props: Parameters<typeof StarRating>[0] = {}) {
  return renderToStaticMarkup(createElement(StarRating, props));
}

describe('StarRating accessibility and form data', () => {
  it('exposes ten half-star values with a single initial Tab stop', () => {
    const html = render({ name: 'rating' });
    expect(html.match(/role="radio"/g)).toHaveLength(10);
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="0.5 stars"');
    expect(html).toContain('aria-label="1 star"');
    expect(html).toContain('aria-label="5 stars"');
    expect(html).toContain('name="rating" value=""');
    expect(html).not.toContain('aria-checked="true"');
  });

  it('enters on the checked value and submits its half-star precision', () => {
    const html = render({ name: 'rating', defaultValue: 3.5 });
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(html).toMatch(
      /aria-checked="true" aria-label="3.5 stars"[^>]+tabindex="0"/,
    );
    expect(html).toContain('name="rating" value="3.5"');
  });

  it('gives controlled values precedence over defaults', () => {
    const html = render({ name: 'rating', defaultValue: 2, value: null });
    expect(html).not.toContain('aria-checked="true"');
    expect(html).toContain('name="rating" value=""');
  });

  it('disables editing and form submission during a pending save', () => {
    const html = render({ name: 'rating', value: 4, disabled: true });
    expect(html.match(/aria-disabled="true"/g)).toHaveLength(11);
    expect(html.match(/disabled=""/g)).toHaveLength(1);
    expect(html).toContain('role="radiogroup"');
  });

  it('renders read-only ratings as descriptive images without controls', () => {
    const html = render({ name: 'rating', value: 4.5, readOnly: true });
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Rating: 4.5 stars"');
    expect(html).not.toContain('<button');
    expect(html).not.toContain('disabled');
    expect(html).toContain('name="rating" value="4.5"');
    expect(render({ readOnly: true })).toContain('Rating: Not rated');
  });
});
