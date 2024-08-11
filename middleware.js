import { NextResponse } from 'next/server';
import { verifyToken } from './src/lib/auth';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Only check authentication for /admin routes
  if (path.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value;
    const isLoggedIn = token && verifyToken(token);

    if (!isLoggedIn) {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',  // Match all paths starting with /admin
  ],
};