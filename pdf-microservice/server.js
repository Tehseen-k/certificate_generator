const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      headless: true,
      // Optimized for low-memory environments like Render Free Tier (512MB)
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
    });
  }
  return browserInstance;
}

// Keep-alive route for cron-job.org
app.get('/ping', (req, res) => res.status(200).send('Alive'));

app.post('/generate-pdf', async (req, res) => {
  const { printUrl } = req.body;
  if (!printUrl) return res.status(400).json({ error: 'printUrl is required' });

  let page = null;
  try {
    const browser = await getBrowser();
    const context = await browser.newContext();
    page = await context.newPage();

    // A4 Portrait
    await page.setViewportSize({ width: 794, height: 1123 });
    
    // Navigate to the Vercel-hosted print page
    await page.goto(printUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for QR code canvas if present
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return !canvas || canvas.width > 0;
    }, { timeout: 5000 }).catch(() => {});
    
    await page.waitForTimeout(500);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    await context.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (page) await page.context().close().catch(() => {});
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`PDF Service running on port ${PORT}`));
