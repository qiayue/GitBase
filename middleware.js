import { NextResponse } from 'next/server';
import { i18n } from './src/lib/i18n-config';

// Simple token verification for Edge Runtime
// Note: This is a basic check. For production, consider using jose library.
function verifyTokenSimple(token) {
  if (!token) return false;

  try {
    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode payload (without verification for Edge Runtime compatibility)
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf8')
    );

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }

    // Check if authenticated
    return payload.authenticated === true;
  } catch (error) {
    return false;
  }
}

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  console.log('[Middleware] Processing:', pathname);

  // Handle /en redirect to / (301 permanent redirect)
  if (pathname.startsWith('/en')) {
    const newPath = pathname.replace(/^\/en/, '') || '/';
    const searchParams = request.nextUrl.searchParams.toString();
    const redirectUrl = new URL(
      `${newPath}${searchParams ? `?${searchParams}` : ''}`,
      request.url
    );
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  // Extract locale from pathname
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Get the path without locale
  let pathWithoutLocale = pathname;
  if (pathnameHasLocale) {
    const segments = pathname.split('/');
    pathWithoutLocale = '/' + segments.slice(2).join('/');
  }

  console.log('[Middleware] Path without locale:', pathWithoutLocale);

  // Check authentication for /admin routes (locale-aware)
  // This prevents any admin page from rendering before authentication
  if (pathWithoutLocale.startsWith('/admin')) {
    console.log('[Middleware] Admin route detected');
    const token = request.cookies.get('auth_token')?.value;
    console.log('[Middleware] Token exists:', !!token);
    const isLoggedIn = token && verifyTokenSimple(token);
    console.log('[Middleware] Is logged in:', isLoggedIn);

    if (!isLoggedIn) {
      console.log('[Middleware] Redirecting to /login');
      // Always redirect to root /login (admin pages don't need locale)
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Check authentication for protected API routes
  const protectedApiRoutes = [
    '/api/articles/create',
    '/api/articles',
    '/api/resources',
    '/api/categories',
  ];

  const isProtectedApi = protectedApiRoutes.some(route => {
    if (route === '/api/articles' || route === '/api/resources') {
      // Only protect POST/PUT/DELETE/PATCH methods, allow GET
      return pathWithoutLocale === route && !['GET', 'HEAD'].includes(request.method);
    }
    if (route === '/api/categories') {
      // Only protect POST/PUT/DELETE/PATCH methods for categories
      return pathWithoutLocale.startsWith(route) && !['GET', 'HEAD'].includes(request.method);
    }
    return pathWithoutLocale.startsWith(route);
  });

  if (isProtectedApi) {
    const token = request.cookies.get('auth_token')?.value;
    const isLoggedIn = token && verifyTokenSimple(token);

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
    // Match all paths except static files and api routes that don't need locale handling
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).)*',
  ],
};
