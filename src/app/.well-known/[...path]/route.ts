import { getAuth } from '@/lib/auth/server';

/** Forwards issuer and resource discovery to Better Auth's standards-based metadata handlers. */
export async function GET(request: Request) {
  return getAuth().handler(request);
}
