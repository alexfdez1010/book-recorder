import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  owner: vi.fn(),
  client: vi.fn(),
  consent: vi.fn(),
  claims: { sub: 'owner', azp: 'app' } as Record<string, unknown>,
}));
vi.mock('@/lib/auth/server', () => ({ getAuth: () => ({}) }));
vi.mock('@better-auth/mcp', () => ({
  requireMcpAuth: vi.fn(
    (_auth, handler) => (request: Request) => handler(request, mocks.claims),
  ),
}));
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: { findUnique: mocks.owner },
    oauthClient: { findUnique: mocks.client },
    oauthConsent: { findFirst: mocks.consent },
  },
}));
import { protectMcp } from '@/lib/mcp/auth';
import { requireMcpAuth } from '@better-auth/mcp';

beforeEach(() => {
  mocks.claims = { sub: 'owner', azp: 'app' };
  mocks.owner.mockResolvedValue({ id: 'owner' });
  mocks.client.mockResolvedValue({ disabled: false });
  mocks.consent.mockResolvedValue({ scopes: ['books:rw'] });
});

const request = new Request('http://localhost/api/mcp/mcp');
/** Exercises the application policy after the library verifies the OAuth token. */
function call() {
  return protectMcp(async () => new Response('ok'))(request);
}

describe('MCP OAuth policy', () => {
  it('delegates signature, issuer, expiry, audience and scopes to Better Auth', async () => {
    expect((await call()).status).toBe(200);
    expect(requireMcpAuth).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      {
        resource: expect.stringContaining('/api/mcp/mcp'),
        requiredScopes: ['books:rw'],
      },
    );
  });
  it.each([{ azp: 'app' }, { sub: 'owner' }, { sub: 42, azp: 'app' }])(
    'rejects a token without user/client identity %j',
    async (claims) => {
      mocks.claims = claims;
      expect((await call()).status).toBe(401);
    },
  );
  it('rejects deleted owners', async () => {
    mocks.owner.mockResolvedValue(null);
    expect((await call()).status).toBe(401);
  });
  it('rejects disabled and unknown clients', async () => {
    for (const client of [null, { disabled: true }]) {
      mocks.client.mockResolvedValue(client);
      expect((await call()).status).toBe(401);
    }
  });
  it('rejects revoked or insufficient consent immediately', async () => {
    for (const consent of [null, { scopes: ['offline_access'] }]) {
      mocks.consent.mockResolvedValue(consent);
      expect((await call()).status).toBe(401);
    }
  });
});
