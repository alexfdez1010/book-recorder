import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth/constants';
import { hashToken, timingSafeEqual } from '@/lib/auth/token';

const PUBLIC_PATHS = ['/login', '/api/login', '/api/mcp'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  const password = process.env.PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!cookie || !password || !secret) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const expected = await hashToken(password, secret);
  if (!timingSafeEqual(cookie, expected)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
};
