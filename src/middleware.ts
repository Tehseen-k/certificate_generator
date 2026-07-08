import { NextRequest, NextResponse } from 'next/server';

const MAIN_DOMAINS = new Set(['vary-iosh.org', 'www.vary-iosh.org']);
const APP_HOST = 'certificate.vary-iosh.org';

function getHostname(host: string): string {
  return host.split(':')[0].toLowerCase();
}

function isMainDomain(host: string): boolean {
  return MAIN_DOMAINS.has(getHostname(host));
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  if (!isMainDomain(host)) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
