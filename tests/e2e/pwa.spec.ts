import { expect, test, type Page } from '@playwright/test';

const PASSWORD = process.env.PASSWORD ?? 'dev-password';

/** Waits for a fully installed worker to claim the page before testing offline behavior. */
async function waitForWorker(page: Page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller?.state))
    .toBe('activated');
}

/** Signs in through the public form without adding or modifying library data. */
async function openLibrary(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Unlock', exact: true }).click();
  await expect(page).toHaveURL(/\/books$/);
  await expect(
    page.getByRole('heading', { name: 'Books', exact: true }),
  ).toBeVisible();
  await waitForWorker(page);
}

test('manifest and installation icons are public and Chrome recognizes the installable app', async ({
  page,
  request,
  context,
}) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.status()).toBe(200);
  const manifest = await response.json();
  expect(manifest.name).toBe('Book Recorder');
  expect(manifest.display).toBe('standalone');
  expect(manifest.scope).toBe('/');
  expect(manifest.start_url).toBe('/books');
  expect(
    manifest.icons.some((icon: { purpose?: string }) =>
      icon.purpose?.includes('maskable'),
    ),
  ).toBe(true);
  for (const icon of manifest.icons) {
    const result = await request.get(icon.src);
    expect(result.status()).toBe(200);
    expect(result.headers()['content-type']).toContain('image/png');
    const body = await result.body();
    const size = Number(icon.sizes.split('x')[0]);
    expect(body.readUInt32BE(16)).toBe(size);
    expect(body.readUInt32BE(20)).toBe(size);
  }
  const script = await request.get('/sw.js');
  expect(script.status()).toBe(200);
  expect(script.headers()['cache-control']).toContain('no-store');
  const fallback = await request.get('/offline');
  expect(fallback.status()).toBe(200);
  expect(await fallback.text()).toContain('A little pause');

  await page.goto('/login');
  await waitForWorker(page);
  const cdp = await context.newCDPSession(page);
  const appManifest = await cdp.send('Page.getAppManifest');
  expect(appManifest.errors).toEqual([]);
  expect(JSON.parse(appManifest.data!)).toMatchObject({
    name: 'Book Recorder',
    display: 'standalone',
  });
  await expect
    .poll(
      async () =>
        (await cdp.send('Page.getInstallabilityErrors')).installabilityErrors,
    )
    .toEqual([]);
  await cdp.detach();
});

test('offline reload after sign out shows only public recovery guidance and caches no private data', async ({
  page,
  context,
}) => {
  await openLibrary(page);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await waitForWorker(page);
  await context.setOffline(true);
  await page.goto('/books');
  await expect(
    page.getByRole('heading', { name: 'A little pause' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Books', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Try again' })).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath('offline-desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('link', { name: 'Try again' })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath('offline-mobile.png'),
    fullPage: true,
  });
  const cachedPaths = await page.evaluate(async () => {
    const names = (await caches.keys()).filter((name) =>
      name.startsWith('book-recorder-public-'),
    );
    const entries = await Promise.all(
      names.map(async (name) =>
        (await (await caches.open(name)).keys()).map(
          (item) => new URL(item.url).pathname,
        ),
      ),
    );
    return entries.flat();
  });
  expect(cachedPaths).toContain('/offline');
  const publicAssets = [
    '/offline',
    '/brand-mark.svg',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-maskable-512.png',
    '/apple-touch-icon.png',
  ];
  expect(
    cachedPaths.every(
      (path) =>
        publicAssets.includes(path) ||
        (path.startsWith('/_next/static/') && path.endsWith('.css')),
    ),
  ).toBe(true);
  expect(cachedPaths).not.toContain('/books');
  expect(cachedPaths.some((path) => path.startsWith('/api/'))).toBe(false);
  await context.setOffline(false);
  await page.getByRole('link', { name: 'Try again' }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('native install offer raised during login survives navigation and is consumed once', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.addEventListener(
      'beforeinstallprompt',
      (event) => {
        if (event.isTrusted) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  });
  await page.goto('/login');
  await waitForWorker(page);
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.defineProperties(event, {
      prompt: {
        value: async () => {
          document.documentElement.dataset.installPromptCalls = String(
            Number(document.documentElement.dataset.installPromptCalls ?? 0) +
              1,
          );
        },
      },
      userChoice: {
        value: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
      },
    });
    window.dispatchEvent(event);
  });
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Unlock', exact: true }).click();
  await expect(page).toHaveURL(/\/books$/);
  const install = page.getByRole('button', {
    name: 'Install app',
    exact: true,
  });
  await expect(install).toBeVisible();
  await install.click();
  await expect(install).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.dataset.installPromptCalls,
    ),
  ).toBe('1');
});
