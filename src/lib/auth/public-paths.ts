const PUBLIC_PREFIXES = ['/login', '/api/login', '/api/mcp'];
const PUBLIC_ASSETS = new Set([
  '/manifest.webmanifest',
  '/sw.js',
  '/offline',
  '/brand-mark.svg',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
]);

/**
 * Identifies authentication entry points and exact public PWA resources.
 * @param pathname - URL pathname without a query string.
 * @returns Whether cookies may be omitted; asset descendants remain protected.
 */
export function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_ASSETS.has(pathname) ||
    PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}
