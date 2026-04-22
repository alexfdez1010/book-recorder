import 'server-only';
import { cookies } from 'next/headers';
import { AUTH_COOKIE, COOKIE_MAX_AGE_SECONDS } from './constants';
import { getAuthConfig } from './config';
import { hashToken, timingSafeEqual } from './token';

export async function createSession(password: string): Promise<boolean> {
  const cfg = getAuthConfig();
  if (password !== cfg.password) return false;
  const token = await hashToken(cfg.password, cfg.secret);
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return true;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cfg = getAuthConfig();
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return false;
  const expected = await hashToken(cfg.password, cfg.secret);
  return timingSafeEqual(token, expected);
}
