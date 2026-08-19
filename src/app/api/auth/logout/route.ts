import { NextResponse } from 'next/server';
import { COOKIE_NAME, sessionCookieOptions } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const cookie = sessionCookieOptions();
  response.cookies.set(COOKIE_NAME, '', { ...cookie, maxAge: 0 });
  return response;
}
