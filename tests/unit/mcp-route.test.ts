import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    book: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const PASSWORD = 'route-password';
const SECRET = 'route-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

async function loadRoute() {
  const mod = await import('@/app/api/mcp/[transport]/route');
  return mod;
}

async function bearerToken(): Promise<string> {
  const { hashToken } = await import('@/lib/auth/token');
  return hashToken(PASSWORD, SECRET);
}

function jsonRpc(method: string, params: unknown = {}, id = 1) {
  return JSON.stringify({ jsonrpc: '2.0', id, method, params });
}

describe('MCP route handler', () => {
  let originalPassword: string | undefined;
  let originalSecret: string | undefined;

  beforeEach(() => {
    originalPassword = process.env.PASSWORD;
    originalSecret = process.env.AUTH_SECRET;
    process.env.PASSWORD = PASSWORD;
    process.env.AUTH_SECRET = SECRET;
    vi.resetModules();
  });

  afterEach(() => {
    process.env.PASSWORD = originalPassword;
    process.env.AUTH_SECRET = originalSecret;
  });

  it('returns 401 without a bearer token', async () => {
    const { POST } = await loadRoute();
    const req = new Request('http://localhost/api/mcp/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jsonRpc('tools/list'),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 with a wrong bearer token', async () => {
    const { POST } = await loadRoute();
    const req = new Request('http://localhost/api/mcp/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer not-the-real-token',
      },
      body: jsonRpc('tools/list'),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('lists every registered tool when authenticated', async () => {
    const { POST } = await loadRoute();
    const token = await bearerToken();
    const req = new Request('http://localhost/api/mcp/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        Authorization: `Bearer ${token}`,
      },
      body: jsonRpc('initialize', {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'vitest', version: '0.0.0' },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
