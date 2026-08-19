import { NextResponse } from 'next/server';
import { validateAdminLogin } from '@/lib/admin-auth';
import { COOKIE_NAME, createSessionToken, sessionCookieOptions } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || '').trim();
    const password = String(body.password || '');

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const result = await validateAdminLogin(username, password);
    if (!result.ok || !result.username) {
      const status = result.error ? 503 : 401;
      return NextResponse.json(
        { error: result.error || 'Invalid username or password.' },
        { status }
      );
    }

    const token = await createSessionToken(result.username);
    const response = NextResponse.json({ ok: true, username: result.username });
    const cookie = sessionCookieOptions();
    response.cookies.set(COOKIE_NAME, token, cookie);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }
}
