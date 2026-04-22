/**
 * Edge-safe SHA-256 token utilities.
 *
 * The session cookie stores `sha256(password + secret)`. Both middleware
 * (Edge runtime) and server actions (Node runtime) compute it the same way
 * via Web Crypto, which is available in both.
 */

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

export async function hashToken(
  password: string,
  secret: string,
): Promise<string> {
  const data = new TextEncoder().encode(`${password}::${secret}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
