import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userName, courseName, certificateNumber, issueDate, qrCodeValue } = data;

    if (!userName || !courseName || !certificateNumber || !issueDate || !qrCodeValue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Print page must be served from the app subdomain (not the verify-only main domain)
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const printUrl = `${baseUrl}/print?name=${encodeURIComponent(userName)}&courseName=${encodeURIComponent(courseName)}&certificateNumber=${certificateNumber}&issueDate=${issueDate}&qrCodeValue=${encodeURIComponent(qrCodeValue)}`;

    const PDF_SERVICE_URL =
      process.env.PDF_SERVICE_URL ||
      'https://itehseenk-certificate-generator.hf.space/generate-pdf';

    const response = await fetch(PDF_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        printUrl,
        bypassToken: process.env.VERCEL_BYPASS_TOKEN,
      }),
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
