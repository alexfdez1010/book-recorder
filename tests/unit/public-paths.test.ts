import { describe, expect, it } from 'vitest';
import { isPublicPath } from '@/lib/auth/public-paths';

describe('public route boundary', () => {
  it.each([
    '/manifest.webmanifest',
    '/sw.js',
    '/offline',
    '/brand-mark.svg',
    '/favicon.ico',
    '/apple-touch-icon.png',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-maskable-512.png',
  ])('permits the exact public PWA resource %s without a session', (path) => {
    expect(isPublicPath(path)).toBe(true);
  });

  it.each([
    '/books',
    '/authors',
    '/graphs',
    '/to-read',
    '/skill',
    '/api/logout',
    '/api/skill',
    '/api/private',
    '/sw.js/private',
    '/offline/private',
    '/icons/other.png',
    '/manifest.webmanifest/private',
  ])('keeps private or lookalike resource %s protected', (path) => {
    expect(isPublicPath(path)).toBe(false);
  });

  it.each(['/login', '/api/login', '/api/mcp', '/api/mcp/mcp'])(
    'preserves the existing authentication and MCP entry point %s',
    (path) => {
      expect(isPublicPath(path)).toBe(true);
    },
  );

  it.each(['/login-extra', '/api/login-admin', '/api/mcprivate'])(
    'does not allow partial prefix matches %s',
    (path) => {
      expect(isPublicPath(path)).toBe(false);
    },
  );
});
