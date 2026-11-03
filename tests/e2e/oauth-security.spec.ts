import { createHash } from 'node:crypto';
import { decodeJwt } from 'jose';
import { test, expect } from '../helpers/fixtures';
import { authorizeMcp, beginMcpAuthorization } from '../helpers/oauth';

const origin = process.env.BETTER_AUTH_URL!;
const resource = `${origin}/api/mcp/mcp`;

/** Sends a real MCP initialization with an arbitrary credential. */
function rpc(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json, text/event-stream',
    },
    data: {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'security-test', version: '1' },
      },
    },
  };
}

test('advertises OAuth discovery and rejects legacy password-derived credentials', async ({
  request,
}) => {
  const metadata = await request.get(
    '/.well-known/oauth-protected-resource/api/mcp/mcp',
  );
  expect(metadata.ok()).toBe(true);
  expect(await metadata.json()).toMatchObject({
    resource,
    authorization_servers: [`${origin}/api/auth`],
  });
  const server = await request.get(
    '/.well-known/oauth-authorization-server/api/auth',
  );
  expect(server.ok()).toBe(true);
  expect(await server.json()).toMatchObject({
    code_challenge_methods_supported: ['S256'],
  });
  const token = createHash('sha256')
    .update('dev-password::old-secret')
    .digest('hex');
  const response = await request.post(resource, rpc(token));
  expect(response.status()).toBe(401);
  expect(response.headers()['www-authenticate']).toContain(
    'resource_metadata=',
  );
});

test('issues short-lived resource-bound tokens and rejects tampering and authorization-code replay', async ({
  page,
  request,
}) => {
  const grant = await authorizeMcp(page);
  expect(grant.expires_in).toBe(900);
  const claims = decodeJwt(grant.access_token);
  expect(claims.aud).toBe(resource);
  expect(claims.iss).toBe(`${origin}/api/auth`);
  const [header, payload, signature] = grant.access_token.split('.');
  const modified = Buffer.from(
    JSON.stringify({
      ...JSON.parse(Buffer.from(payload, 'base64url').toString()),
      exp: 9999999999,
    }),
  ).toString('base64url');
  expect(
    (
      await request.post(resource, rpc(`${header}.${modified}.${signature}`))
    ).status(),
  ).toBe(401);
  const replay = await request.post('/api/auth/oauth2/token', {
    form: grant.exchange,
  });
  expect(replay.status()).toBe(400);
  expect(await replay.json()).toMatchObject({ error: 'invalid_grant' });
});

test('rotates refresh tokens and immediately revokes access through Connected apps', async ({
  page,
  request,
}) => {
  const grant = await authorizeMcp(page);
  const renewed = await request.post('/api/auth/oauth2/token', {
    form: {
      grant_type: 'refresh_token',
      client_id: grant.clientId,
      refresh_token: grant.refresh_token,
      resource,
    },
  });
  expect(renewed.ok(), await renewed.text()).toBe(true);
  const tokens = await renewed.json();
  expect(tokens.refresh_token).not.toBe(grant.refresh_token);
  expect(
    (await request.post(resource, rpc(tokens.access_token))).status(),
  ).toBe(200);
  await page.goto('/skill');
  const connection = page
    .locator('form')
    .filter({ has: page.locator(`input[value="${grant.clientId}"]`) });
  await connection.getByRole('button', { name: 'Disconnect' }).click();
  await expect(connection).toHaveCount(0);
  expect(
    (await request.post(resource, rpc(tokens.access_token))).status(),
  ).toBe(401);
  const denied = await request.post('/api/auth/oauth2/token', {
    form: {
      grant_type: 'refresh_token',
      client_id: grant.clientId,
      refresh_token: tokens.refresh_token,
      resource,
    },
  });
  expect(denied.status()).toBe(400);
  expect(await denied.json()).toMatchObject({ error: 'invalid_client' });
});

test('rejects cross-site sign-out and forged or revoked sessions', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.AUTH_OWNER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.PASSWORD!);
  await page.getByRole('button', { name: 'Unlock' }).click();
  await expect(page).toHaveURL(/\/books$/);
  const cookies = await page.context().cookies();
  const attack = await page.request.post('/api/logout', {
    headers: { Origin: 'https://attacker.example' },
  });
  expect(attack.status()).toBe(403);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.context().addCookies(cookies);
  await page.goto('/books');
  await expect(page).toHaveURL(/\/login$/);
});

test('denies consent without issuing a code and rejects authorization without PKCE', async ({
  page,
  request,
}) => {
  const flow = await beginMcpAuthorization(page);
  await page.getByRole('button', { name: 'Deny', exact: true }).click();
  await page.waitForURL(`${flow.callback}**`);
  const denied = new URL(page.url());
  expect(denied.searchParams.get('error')).toBe('access_denied');
  expect(denied.searchParams.has('code')).toBe(false);
  flow.params.delete('code_challenge');
  flow.params.delete('code_challenge_method');
  const noPkce = await request.get(
    `/api/auth/oauth2/authorize?${flow.params}`,
    { maxRedirects: 0 },
  );
  expect(noPkce.status()).toBe(302);
  expect(new URL(noPkce.headers().location).searchParams.get('error')).toBe(
    'invalid_request',
  );
});

test('limits repeated login attempts in the shared database', async ({
  page,
}) => {
  const statuses: number[] = [];
  for (let attempt = 0; attempt < 11; attempt++) {
    const response = await page.request.post('/api/auth/sign-in/email', {
      data: {
        email: 'unknown@example.test',
        password: 'definitely-wrong-password',
      },
    });
    statuses.push(response.status());
  }
  expect(statuses.slice(0, 10)).toEqual(Array(10).fill(401));
  expect(statuses[10]).toBe(429);
});
