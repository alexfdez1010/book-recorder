import { createHash, timingSafeEqual } from 'node:crypto';

/** Validates the private setup credential against its server-side hash without storing a plaintext token. */
export function validSetupToken(
  token: string | null,
  expectedHash = process.env.AUTH_SETUP_TOKEN_HASH,
): boolean {
  if (!token || !expectedHash || !/^[a-f0-9]{64}$/.test(expectedHash))
    return false;
  const supplied = createHash('sha256').update(token).digest();
  return timingSafeEqual(supplied, Buffer.from(expectedHash, 'hex'));
}
