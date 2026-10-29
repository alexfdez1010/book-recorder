/* Public offline support only: authenticated documents and APIs are never cached. */
const CACHE_PREFIX = 'book-recorder-public-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const OFFLINE_URL = '/offline';
const PUBLIC_ASSETS = [
  '/brand-mark.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/apple-touch-icon.png',
];

/** Returns a same-origin build stylesheet URL, or null for every other resource. */
function publicStylesheet(value) {
  const url = new URL(value, self.location.origin);
  return url.origin === self.location.origin &&
    url.pathname.startsWith('/_next/static/') &&
    url.pathname.endsWith('.css')
    ? url.href
    : null;
}

/** Fetches one public resource without cookies; redirects and failures abort installation. */
async function storePublicResource(cache, url) {
  const response = await fetch(url, { cache: 'reload', credentials: 'omit' });
  if (!response.ok || response.redirected) {
    throw new Error('The public offline resources could not be prepared');
  }
  await cache.put(url, response);
}

/** Prepares the public offline document, its referenced styles and fixed icon assets. */
async function prepareOffline() {
  const response = await fetch(OFFLINE_URL, {
    cache: 'reload',
    credentials: 'omit',
  });
  if (
    !response.ok ||
    response.redirected ||
    !response.headers.get('content-type')?.includes('text/html')
  ) {
    throw new Error('The public offline page could not be prepared');
  }
  const html = await response.clone().text();
  const styles = [
    ...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi),
  ]
    .map((match) => publicStylesheet(match[1].replaceAll('&amp;', '&')))
    .filter(Boolean);
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    [...new Set([...PUBLIC_ASSETS, ...styles])].map((url) =>
      storePublicResource(cache, url),
    ),
  );
  await cache.put(OFFLINE_URL, response);
}

/** Deletes only this app's obsolete public caches and controls newly opened pages. */
async function activateOffline() {
  const names = await caches.keys();
  await Promise.all(
    names
      .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)),
  );
  await self.clients.claim();
}

/** Uses live navigation responses; a network failure returns only the public fallback. */
async function navigate(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

/** Reuses an already prepared public asset; misses pass through without being stored. */
async function preparedAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  return (await cache.match(request)) || fetch(request);
}

self.addEventListener('install', (event) => event.waitUntil(prepareOffline()));
self.addEventListener('activate', (event) =>
  event.waitUntil(activateOffline()),
);
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    request.headers.has('RSC') ||
    url.searchParams.has('_rsc')
  )
    return;
  if (request.mode === 'navigate') {
    event.respondWith(navigate(request));
  } else if (
    (!url.search && PUBLIC_ASSETS.includes(url.pathname)) ||
    publicStylesheet(url.href)
  ) {
    event.respondWith(preparedAsset(request));
  }
});
