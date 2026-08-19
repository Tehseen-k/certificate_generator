import { NextResponse } from 'next/server';
import { getRequestSession } from '@/lib/auth-server';
import { changeAdminPassword } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await getRequestSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');
    const confirmPassword = String(body.confirmPassword || '');

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All password fields are required.' }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New passwords do not match.' }, { status: 400 });
    }

    const result = await changeAdminPassword(session.u, currentPassword, newPassword);
    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Could not change password.' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Could not change password.' }, { status: 500 });
  }
}
