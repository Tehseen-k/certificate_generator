import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, readPrintToken, readSessionToken } from '@/lib/session';

const MAIN_DOMAINS = new Set(['vary-iosh.org', 'www.vary-iosh.org']);
const APP_HOST = 'certificate.vary-iosh.org';

function getHostname(host: string): string {
  return host.split(':')[0].toLowerCase();
}

function isMainDomain(host: string): boolean {
  return MAIN_DOMAINS.has(getHostname(host));
}

function isPublicPath(pathname: string): boolean {
  if (pathname === '/login') return true;
  if (pathname === '/verify' || pathname.startsWith('/verify/')) return true;
  if (pathname === '/api/auth/login') return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const { pathname, search } = request.nextUrl;

  if (isMainDomain(host)) {
    if (pathname === '/verify' || pathname.startsWith('/verify/')) {
      return NextResponse.next();
    }

    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/verify';
      return NextResponse.redirect(url);
    }

    const redirectUrl = new URL(`https://${APP_HOST}${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (isPublicPath(pathname)) {
    if (pathname === '/login') {
      const session = await readSessionToken(request.cookies.get(COOKIE_NAME)?.value);
      if (session) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  if (pathname === '/print' || pathname.startsWith('/print/')) {
    const session = await readSessionToken(request.cookies.get(COOKIE_NAME)?.value);
    const printOk = await readPrintToken(request.nextUrl.searchParams.get('printToken'));
    if (session || printOk) {
      return NextResponse.next();
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await readSessionToken(request.cookies.get(COOKIE_NAME)?.value);
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('next', `${pathname}${search}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logos/|certificate-bg.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
