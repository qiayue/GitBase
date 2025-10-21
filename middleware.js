import { NextResponse } from 'next/server';
import { verifyToken } from './src/lib/auth';
import { i18n } from './src/lib/i18n-config';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

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

  // Check authentication for /admin routes (locale-aware)
  if (pathWithoutLocale.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value;
    const isLoggedIn = token && verifyToken(token);

    if (!isLoggedIn) {
      // Preserve locale in redirect
      const locale = pathnameHasLocale ? pathname.split('/')[1] : '';
      const loginPath = locale ? `/${locale}/login` : '/login';
      return NextResponse.redirect(new URL(loginPath, request.url));
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
      return pathWithoutLocale === route && request.method !== 'GET';
    }
    return pathWithoutLocale.startsWith(route);
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
    // Match all paths except static files and api routes that don't need locale handling
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).)*',
  ],
};
