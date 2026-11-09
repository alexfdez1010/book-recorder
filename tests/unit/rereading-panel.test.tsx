import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RereadingPanel } from '@/components/graphs/rereading-panel';

describe('rereading chart summaries and accessible figures', () => {
  it('explains an empty reread history without hiding the first-reading baseline', () => {
    const html = renderToStaticMarkup(
      <RereadingPanel data={[{ year: '2026', firstReads: 3, rereads: 0 }]} />,
    );
    expect(html).toContain('No rereads recorded yet');
    expect(html).toContain('Annual first readings and rereads');
    expect(html).toMatch(/<td[^>]*>3<\/td>/);
    expect(html).toMatch(/<td[^>]*>0<\/td>/);
  });

  it('reports the reread share using all completed readings and handles no readings', () => {
    const html = renderToStaticMarkup(
      <RereadingPanel
        data={[
          { year: '2020', firstReads: 2, rereads: 0 },
          { year: '2026', firstReads: 1, rereads: 1 },
        ]}
      />,
    );
    expect(html).toContain('1 reread (25% of all readings)');
    expect(renderToStaticMarkup(<RereadingPanel data={[]} />)).not.toContain(
      'NaN',
    );
  });
});
