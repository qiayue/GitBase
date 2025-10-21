import { NextResponse } from 'next/server';
import { verifyToken } from './src/lib/auth';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Check authentication for /admin routes
  if (path.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value;
    const isLoggedIn = token && verifyToken(token);

    if (!isLoggedIn) {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Check authentication for protected API routes
  const protectedApiRoutes = [
    '/api/articles/create',
    '/api/articles',
    '/api/resources',
  ];

  const isProtectedApi = protectedApiRoutes.some(route => {
    if (route === '/api/articles' || route === '/api/resources') {
      // Only protect POST/PUT/DELETE methods, allow GET
      return path === route && request.method !== 'GET';
    }
    return path.startsWith(route);
  });

  if (isProtectedApi) {
    const token = request.cookies.get('auth_token')?.value;
    const isLoggedIn = token && verifyToken(token);

    if (!isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',          // Match all admin pages
    '/api/articles/:path*',   // Match all article API routes
    '/api/resources/:path*',  // Match all resource API routes
  ],
};