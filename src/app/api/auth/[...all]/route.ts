import { getAuth } from '@/lib/auth/server';

export const runtime = 'nodejs';

/** Dispatches authentication requests to the lazily initialized Better Auth handler. */
async function handle(request: Request) {
  return getAuth().handler(request);
}

export { handle as GET, handle as POST };
