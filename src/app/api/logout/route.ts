import { getAuth } from '@/lib/auth/server';

/** Normalizes the legacy empty-body POST while retaining cookies and Origin for Better Auth's HTTP protections. */
export async function POST(request: Request) {
  const headers = new Headers(request.headers);
  headers.set('content-type', 'application/json');
  return getAuth().handler(
    new Request(new URL('/api/auth/sign-out', request.url), {
      method: 'POST',
      headers,
      body: '{}',
    }),
  );
}
