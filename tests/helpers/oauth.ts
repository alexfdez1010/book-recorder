import { createHash, randomBytes } from 'node:crypto';
import { expect, request, type Page } from '@playwright/test';

/** Registers a public client and opens the signed consent screen through a real browser login. */
export async function beginMcpAuthorization(page: Page) {
  const origin = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
  const resource = `${origin}/api/mcp/mcp`;
  const callback = 'http://127.0.0.1:18765/callback';
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const registration = await page.request.post(
    `${origin}/api/auth/oauth2/register`,
    {
      data: {
        client_name: 'Book Recorder E2E',
        redirect_uris: [callback],
        token_endpoint_auth_method: 'none',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        scope: 'books:rw offline_access',
      },
    },
  );
  expect(registration.ok(), await registration.text()).toBe(true);
  const client = await registration.json();
  const params = new URLSearchParams({
    client_id: client.client_id,
    redirect_uri: callback,
    response_type: 'code',
    scope: 'books:rw offline_access',
    resource,
    state: randomBytes(16).toString('hex'),
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  await page.route(`${callback}**`, (route) =>
    route.fulfill({ body: 'Authorized' }),
  );
  await page.goto(`${origin}/api/auth/oauth2/authorize?${params}`);
  if (new URL(page.url()).pathname === '/login') {
    await page
      .getByLabel('Email')
      .fill(process.env.AUTH_OWNER_EMAIL ?? 'owner@example.test');
    await page
      .getByLabel('Password')
      .fill(process.env.PASSWORD ?? 'dev-password');
    await page.getByRole('button', { name: 'Unlock' }).click();
  }
  await expect(
    page.getByRole('heading', { name: 'Connect your library' }),
  ).toBeVisible();
  for (const [label, width, height] of [
    ['mobile', 390, 844],
    ['desktop', 1440, 900],
  ] as const) {
    await page.setViewportSize({ width, height });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `.impeccable/review/oauth-consent-${label}.png`,
      fullPage: true,
    });
  }
  return { callback, params, origin, resource, verifier, client };
}

/** Completes browser approval and exchanges its single-use code with the original S256 verifier. */
export async function authorizeMcp(page: Page) {
  const { callback, params, origin, resource, verifier, client } =
    await beginMcpAuthorization(page);
  await page.getByRole('button', { name: 'Allow access' }).click();
  await page.waitForURL(`${callback}**`);
  const redirect = new URL(page.url());
  expect(redirect.searchParams.get('state')).toBe(params.get('state'));
  const code = redirect.searchParams.get('code');
  expect(code).toBeTruthy();
  const exchange = {
    grant_type: 'authorization_code',
    client_id: client.client_id,
    code: code!,
    redirect_uri: callback,
    code_verifier: verifier,
    resource,
  };
  const anonymous = await request.newContext();
  const token = await anonymous.post(`${origin}/api/auth/oauth2/token`, {
    form: exchange,
  });
  expect(token.ok(), await token.text()).toBe(true);
  const tokens = await token.json();
  await anonymous.dispose();
  return {
    ...(tokens as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }),
    clientId: client.client_id as string,
    resource,
    exchange,
    origin,
  };
}
