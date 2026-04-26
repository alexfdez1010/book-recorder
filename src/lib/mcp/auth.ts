import 'server-only';
import { getAuthConfig } from '@/lib/auth/config';
import { hashToken, timingSafeEqual } from '@/lib/auth/token';

/**
 * Bearer token expected by the MCP route. Derived deterministically from
 * `PASSWORD` and `AUTH_SECRET`, so no extra storage is needed — the same hash
 * is used for the browser session cookie.
 */
export async function expectedMcpToken(): Promise<string> {
  const cfg = getAuthConfig();
  return hashToken(cfg.password, cfg.secret);
}

export async function isValidMcpToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await expectedMcpToken();
  return timingSafeEqual(token, expected);
}
