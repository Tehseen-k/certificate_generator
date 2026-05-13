import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(request: NextRequest) {
  let browser;
  try {
    const { userName, courseName, certificateNumber, issueDate, qrCodeValue } = await request.json();

    if (!userName || !courseName || !certificateNumber || !issueDate || !qrCodeValue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the base URL for the print page
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // Build the print page URL with certificate data
    const printUrl = `${baseUrl}/print?name=${encodeURIComponent(userName)}&courseName=${encodeURIComponent(courseName)}&certificateNumber=${certificateNumber}&issueDate=${issueDate}&qrCodeValue=${encodeURIComponent(qrCodeValue)}`;

    // Launch browser and generate PDF
    browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage({
      viewport: { width: 794, height: 1123 }, // A4 portrait @ 96dpi
    });
    
    // Navigate to the print page and wait for it to fully load
    await page.goto(printUrl, { 
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for QR code canvas to render
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0;
    }, { timeout: 5000 }).catch(() => {});

    // Wait a moment for any final rendering
    await page.waitForTimeout(500);

    // Generate PDF with proper A4 portrait settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: false,
      printBackground: true,
      margin: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
      scale: 1,
    });

    // Close the browser
    await browser.close();

    const pdfBytes = new Uint8Array(pdfBuffer);

    // Return PDF as binary file
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
    
    // Make sure browser is closed on error
    if (browser) {
      await browser.close().catch(() => {});
    }

    return NextResponse.json(
      { error: 'Failed to generate certificate: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
