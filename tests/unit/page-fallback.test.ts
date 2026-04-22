import { describe, expect, it, vi } from 'vitest';
import { fetchOpenLibraryPages } from '@/lib/books/openlibrary';
import { fetchGoogleBooksPages } from '@/lib/books/googlebooks';
import { enrichPages } from '@/lib/books/search';
import type { BookCandidate } from '@/lib/books/types';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  }) as unknown as Response;
}

function makeCandidate(over: Partial<BookCandidate>): BookCandidate {
  return {
    source: 'openlibrary',
    externalId: '/works/OL1W',
    title: 'X',
    author: 'Y',
    publicationDate: null,
    pages: null,
    coverUrl: null,
    category: 'Other',
    language: null,
    ...over,
  };
}

describe('fetchOpenLibraryPages', () => {
  it('returns the first numeric number_of_pages from editions', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ entries: [{}, { number_of_pages: 288 }, { number_of_pages: 999 }] }),
    );
    expect(await fetchOpenLibraryPages('/works/OL1W', fetchImpl as unknown as typeof fetch)).toBe(288);
  });

  it('parses textual pagination when number_of_pages absent', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ entries: [{ pagination: '384 p.' }] }));
    expect(await fetchOpenLibraryPages('/works/OL1W', fetchImpl as unknown as typeof fetch)).toBe(384);
  });

  it('returns null for non-work keys', async () => {
    const fetchImpl = vi.fn();
    expect(await fetchOpenLibraryPages('OL1M', fetchImpl as unknown as typeof fetch)).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns null on HTTP error', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, 500));
    expect(await fetchOpenLibraryPages('/works/OL1W', fetchImpl as unknown as typeof fetch)).toBeNull();
  });
});

describe('fetchGoogleBooksPages', () => {
  it('returns volumeInfo.pageCount', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ volumeInfo: { pageCount: 512 } }));
    expect(await fetchGoogleBooksPages('abc123', fetchImpl as unknown as typeof fetch)).toBe(512);
  });

  it('returns null when pageCount missing or zero', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ volumeInfo: { pageCount: 0 } }));
    expect(await fetchGoogleBooksPages('abc123', fetchImpl as unknown as typeof fetch)).toBeNull();
  });

  it('returns null for empty id without calling fetch', async () => {
    const fetchImpl = vi.fn();
    expect(await fetchGoogleBooksPages('', fetchImpl as unknown as typeof fetch)).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('enrichPages', () => {
  it('leaves candidates with known pages untouched', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}));
    try {
      const result = await enrichPages([makeCandidate({ pages: 200 })]);
      expect(result[0].pages).toBe(200);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it('fills pages for candidates missing them', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('openlibrary.org')) {
        return jsonResponse({ entries: [{ number_of_pages: 120 }] });
      }
      if (url.includes('googleapis.com')) {
        return jsonResponse({ volumeInfo: { pageCount: 350 } });
      }
      return jsonResponse({}, 404);
    });
    try {
      const result = await enrichPages([
        makeCandidate({ source: 'openlibrary', externalId: '/works/OL2W' }),
        makeCandidate({ source: 'googlebooks', externalId: 'gbid' }),
      ]);
      expect(result[0].pages).toBe(120);
      expect(result[1].pages).toBe(350);
    } finally {
      spy.mockRestore();
    }
  });

  it('swallows fetch errors and keeps pages null', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('boom'));
    try {
      const result = await enrichPages([makeCandidate({ externalId: '/works/OL3W' })]);
      expect(result[0].pages).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });
});
