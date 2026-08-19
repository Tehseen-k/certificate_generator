import { NextResponse } from 'next/server';
import { getRequestSession } from '@/lib/auth-server';

export async function GET() {
  const session = await getRequestSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, username: session.u });
}
