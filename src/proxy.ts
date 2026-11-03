import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/server';
import { isPublicPath } from '@/lib/auth/public-paths';

/** Validates private requests against database sessions; OAuth endpoints validate their own credentials. */
export async function proxy(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) return NextResponse.next();
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
