import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';
import { i18n } from './src/lib/i18n-config';

export function middleware(request: NextRequest) {
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

  // Check authentication for /admin routes
  if (pathWithoutLocale.startsWith('/admin')) {
    console.log('[Middleware] Admin route detected:', pathWithoutLocale);
    const token = request.cookies.get('auth_token')?.value;
    console.log('[Middleware] Token exists:', !!token);

    const isLoggedIn = token ? verifyToken(token) : false;
    console.log('[Middleware] Is logged in:', isLoggedIn);

    if (!isLoggedIn) {
      console.log('[Middleware] Redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    console.log('[Middleware] Access granted to admin');
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
    const isLoggedIn = token ? verifyToken(token) : false;

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
    '/api/categories/:path*', // Match all category API routes
    '/en/:path*',             // Match /en routes for redirect
  ],
};
