import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { expectedMcpToken, isValidMcpToken } from '@/lib/mcp/auth';
import { hashToken } from '@/lib/auth/token';

const PASSWORD = 'unit-password';
const SECRET = 'unit-secret-0123456789abcdef';

describe('mcp auth', () => {
  let originalPassword: string | undefined;
  let originalSecret: string | undefined;

  beforeEach(() => {
    originalPassword = process.env.PASSWORD;
    originalSecret = process.env.AUTH_SECRET;
    process.env.PASSWORD = PASSWORD;
    process.env.AUTH_SECRET = SECRET;
  });

  afterEach(() => {
    process.env.PASSWORD = originalPassword;
    process.env.AUTH_SECRET = originalSecret;
  });

  it('expectedMcpToken matches hashToken(PASSWORD::AUTH_SECRET)', async () => {
    const token = await expectedMcpToken();
    expect(token).toBe(await hashToken(PASSWORD, SECRET));
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('isValidMcpToken rejects empty, wrong, and accepts the derived token', async () => {
    expect(await isValidMcpToken(undefined)).toBe(false);
    expect(await isValidMcpToken('')).toBe(false);
    expect(await isValidMcpToken('deadbeef'.repeat(8))).toBe(false);
    expect(await isValidMcpToken(await expectedMcpToken())).toBe(true);
  });
});
