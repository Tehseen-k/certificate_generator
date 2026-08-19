import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/lib/auth-server';
import { createPrintToken } from '@/lib/session';

function isLoopbackUrl(value: string): boolean {
  try {
    const { hostname } = new URL(value);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0';
  } catch {
    return true;
  }
}

function getPrintBaseUrl(request: NextRequest): string {
  const candidates = [
    process.env.PRINT_BASE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ];

  for (const candidate of candidates) {
    if (candidate && !isLoopbackUrl(candidate)) {
      return candidate.replace(/\/$/, '');
    }
  }

  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  if (host) {
    const fromRequest = `${proto}://${host}`;
    if (!isLoopbackUrl(fromRequest)) {
      return fromRequest.replace(/\/$/, '');
    }
  }

  return 'https://certificate.vary-iosh.org';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getRequestSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { userName, courseName, certificateNumber, issueDate, qrCodeValue } = data;

    if (!userName || !courseName || !certificateNumber || !issueDate || !qrCodeValue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Playwright runs on the VPS, so this URL must be reachable from there — never localhost.
    const baseUrl = getPrintBaseUrl(request);

    const printToken = await createPrintToken();
    const printUrl = `${baseUrl}/print?name=${encodeURIComponent(userName)}&courseName=${encodeURIComponent(courseName)}&certificateNumber=${certificateNumber}&issueDate=${issueDate}&qrCodeValue=${encodeURIComponent(qrCodeValue)}&printToken=${encodeURIComponent(printToken)}`;

    const PDF_SERVICE_URL =
      process.env.PDF_SERVICE_URL ||
      'http://13.140.168.39:3001/generate-pdf';

    const response = await fetch(PDF_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        printUrl,
        bypassToken: process.env.VERCEL_BYPASS_TOKEN,
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PDF Service Error: ${response.status} - ${errorText}`);
    }

    const pdfBuffer = await response.arrayBuffer();
    const pdfBytes = new Uint8Array(pdfBuffer);

    const filename = `${certificateNumber}_${userName.replace(/\s+/g, '_')}.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Certificate generation error:', error);

    return NextResponse.json(
      {
        error:
          'Failed to generate certificate: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}
