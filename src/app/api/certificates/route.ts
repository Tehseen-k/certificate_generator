import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/lib/auth-server';
import { restListCertificates } from '@/lib/firestore-rest';
import type { CertificateSearchField } from '@/lib/firestore-service';

export async function GET(request: NextRequest) {
  const session = await getRequestSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const field = (searchParams.get('field') || 'all') as CertificateSearchField;
  const search = searchParams.get('search') || '';
  const cursorId = searchParams.get('cursor') || undefined;
  const pageSize = Number(searchParams.get('pageSize') || 20);

  try {
    const result = await restListCertificates({
      field,
      search,
      cursorId,
      pageSize: Number.isFinite(pageSize) ? Math.min(Math.max(pageSize, 5), 50) : 20,
    });

    return NextResponse.json({
      ...result,
      items: result.items.map((item) => ({
        ...item,
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
        updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
      })),
    });
  } catch (error) {
    console.error('List certificates error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to load certificates. Firebase may be offline.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
