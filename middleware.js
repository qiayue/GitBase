import { NextResponse } from 'next/server';
import { i18n } from './src/lib/i18n-config';

// Base64 decode function that works in Edge Runtime
function base64UrlDecode(str) {
  // Replace URL-safe characters
  str = str.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if needed
  while (str.length % 4) {
    str += '=';
  }

  try {
    // Use atob which is available in Edge Runtime
    const decoded = atob(str);
    return decoded;
  } catch (e) {
    return null;
  }
}

// Simple token verification for Edge Runtime
function verifyTokenSimple(token) {
  if (!token) {
    console.log('[Auth] No token provided');
    return false;
  }

  try {
    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('[Auth] Invalid token structure');
      return false;
    }

    // Decode payload using Edge Runtime compatible method
    const payloadJson = base64UrlDecode(parts[1]);
    if (!payloadJson) {
      console.log('[Auth] Failed to decode token');
      return false;
    }

    const payload = JSON.parse(payloadJson);
    console.log('[Auth] Token payload:', { authenticated: payload.authenticated, exp: payload.exp });

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.log('[Auth] Token expired');
      return false;
    }

    // Check if authenticated
    const isAuth = payload.authenticated === true;
    console.log('[Auth] Is authenticated:', isAuth);
    return isAuth;
  } catch (error) {
    console.log('[Auth] Token verification error:', error.message);
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
