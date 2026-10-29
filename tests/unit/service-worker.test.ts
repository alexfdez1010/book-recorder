import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const ORIGIN = 'https://library.example';
const CACHE = 'book-recorder-public-v1';
const source = readFileSync(
  new URL('../../public/sw.js', import.meta.url),
  'utf8',
);
const offlineHtml = `<h1>A little pause</h1>
<link rel="stylesheet" href="/_next/static/chunks/library.css" />
<link rel="stylesheet" href="https://outside.example/track.css" />
<link rel="stylesheet" href="/api/private.css" />`;

type Resource = string | { url: string };
type Listener = (event: Record<string, unknown>) => void;

/** Normalizes cache keys like browser Cache Storage, without exposing response bodies. */
function key(resource: Resource): string {
  return new URL(typeof resource === 'string' ? resource : resource.url, ORIGIN)
    .href;
}

/** Creates a fresh worker execution with isolated browser-boundary fakes. */
function worker() {
  const listeners = new Map<string, Listener>();
  const stores = new Map<string, Map<string, Response>>();
  const claim = vi.fn(async () => undefined);
  const fetch = vi.fn<
    (resource: Resource, options?: RequestInit) => Promise<Response>
  >(async (resource) => {
    const url = new URL(key(resource));
    return new Response(
      url.pathname === '/offline' ? offlineHtml : 'public asset',
      {
        headers: {
          'content-type':
            url.pathname === '/offline' ? 'text/html' : 'text/css',
        },
      },
    );
  });
  const caches = {
    open: async (name: string) => {
      const store = stores.get(name) ?? new Map<string, Response>();
      stores.set(name, store);
      return {
        put: async (resource: Resource, response: Response) => {
          store.set(key(resource), response.clone());
        },
        match: async (resource: Resource) => store.get(key(resource))?.clone(),
      };
    },
    keys: async () => [...stores.keys()],
    delete: async (name: string) => stores.delete(name),
  };
  runInNewContext(source, {
    URL,
    Response,
    fetch,
    caches,
    self: {
      location: { origin: ORIGIN },
      clients: { claim },
      addEventListener: (name: string, listener: Listener) =>
        listeners.set(name, listener),
    },
  });
  return {
    stores,
    fetch,
    claim,
    /** Runs a lifecycle event and waits for its install/activation work. */
    lifecycle: async (name: string) => {
      let result: Promise<unknown> | undefined;
      listeners.get(name)!({
        waitUntil: (pending: Promise<unknown>) => {
          result = pending;
        },
      });
      await result;
    },
    /** Returns an intercepted response, or undefined when the browser must use its network. */
    request: async (
      path: string,
      options: {
        method?: string;
        mode?: string;
        headers?: Record<string, string>;
      } = {},
    ) => {
      let result: Promise<Response> | undefined;
      const request = {
        url: new URL(path, ORIGIN).href,
        method: options.method ?? 'GET',
        mode: options.mode ?? 'cors',
        headers: new Headers(options.headers),
      };
      listeners.get('fetch')!({
        request,
        respondWith: (pending: Promise<Response>) => {
          result = pending;
        },
      });
      return result;
    },
  };
}

describe('public offline worker', () => {
  it('prepares only offline HTML, fixed icons and same-origin build CSS without credentials', async () => {
    const runtime = worker();
    await runtime.lifecycle('install');
    const paths = [...runtime.stores.get(CACHE)!.keys()]
      .map((url) => new URL(url).pathname)
      .sort();
    expect(paths).toEqual([
      '/_next/static/chunks/library.css',
      '/apple-touch-icon.png',
      '/brand-mark.svg',
      '/icons/icon-192.png',
      '/icons/icon-512.png',
      '/icons/icon-maskable-512.png',
      '/offline',
    ]);
    expect(
      runtime.fetch.mock.calls.every(
        (call) => (call[1] as RequestInit).credentials === 'omit',
      ),
    ).toBe(true);
  });

  it('returns live private navigation without storing the private response', async () => {
    const runtime = worker();
    await runtime.lifecycle('install');
    runtime.fetch.mockResolvedValueOnce(new Response('private library data'));
    const response = await runtime.request('/books', { mode: 'navigate' });
    expect(await response?.text()).toBe('private library data');
    expect(runtime.stores.get(CACHE)!.has(`${ORIGIN}/books`)).toBe(false);
  });

  it('returns only the public fallback after a failed navigation', async () => {
    const runtime = worker();
    await runtime.lifecycle('install');
    runtime.fetch.mockRejectedValueOnce(new Error('offline'));
    const response = await runtime.request('/books', { mode: 'navigate' });
    expect(await response?.text()).toContain('A little pause');
    expect(runtime.stores.get(CACHE)!.has(`${ORIGIN}/books`)).toBe(false);
  });

  it.each([
    ['/api/skill?kind=config', { mode: 'navigate' }],
    ['/api/logout', { method: 'POST' }],
    ['/books', { method: 'POST' }],
    ['/books?_rsc=private', {}],
    ['/books', { headers: { RSC: '1' } }],
    ['/_next/image?url=private-cover', {}],
    ['https://outside.example/cover.jpg', {}],
  ])(
    'leaves sensitive or external request %s to the network',
    async (url, options) => {
      const runtime = worker();
      expect(await runtime.request(url, options)).toBeUndefined();
      expect(runtime.fetch).not.toHaveBeenCalled();
      expect(runtime.stores.size).toBe(0);
    },
  );

  it('serves prepared assets offline but never caches a different stylesheet', async () => {
    const runtime = worker();
    await runtime.lifecycle('install');
    const count = runtime.stores.get(CACHE)!.size;
    runtime.fetch.mockClear();
    expect(await (await runtime.request('/brand-mark.svg'))?.text()).toBe(
      'public asset',
    );
    expect(runtime.fetch).not.toHaveBeenCalled();
    await runtime.request('/_next/static/chunks/another.css');
    expect(runtime.stores.get(CACHE)!.size).toBe(count);
  });

  it('removes only obsolete caches owned by this app', async () => {
    const runtime = worker();
    runtime.stores.set('book-recorder-public-v0', new Map());
    runtime.stores.set('unrelated-cache', new Map());
    await runtime.lifecycle('install');
    await runtime.lifecycle('activate');
    expect([...runtime.stores.keys()].sort()).toEqual([
      CACHE,
      'unrelated-cache',
    ]);
    expect(runtime.claim).toHaveBeenCalledOnce();
  });

  it('rejects an authentication redirect instead of saving it as the offline document', async () => {
    const runtime = worker();
    const redirected = new Response('private redirect', {
      headers: { 'content-type': 'text/html' },
    });
    Object.defineProperty(redirected, 'redirected', { value: true });
    runtime.fetch.mockResolvedValueOnce(redirected);
    await expect(runtime.lifecycle('install')).rejects.toThrow('offline page');
    expect(runtime.stores.size).toBe(0);
  });
});
