# Certificate Generator - Setup & Configuration Guide

## Quick Start

### 1. Install Dependencies

```bash
cd certificate_generator
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the `certificate_generator` root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Add Certificate Assets

Create folders and add files to `public/`:

```
public/
├── certificate-bg.jpg          # Certificate background image
└── logos/
    ├── 1.png                   # IOSH logo (top-left)
    ├── 2.png                   # Top logo (top-right)
    ├── 3.png                   # QR code logo (center-bottom)
    ├── 4.png                   # Signature 1 (bottom-left)
    └── 5.png                   # Signature 2 (bottom-right)
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to start the application.

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name and follow setup steps
4. Enable Firestore Database

### Step 2: Get Firebase Credentials

1. In Firebase Console, go to Project Settings
2. Under "Service accounts", click "Generate new private key"
3. Copy the credentials from the JSON file
4. Add them to your `.env.local`

### Step 3: Set Up Firestore Collection

1. In Firebase Console, go to Firestore Database
2. Create a new collection called `certificates`
3. Add the following fields (can be auto-generated):
   - `certificateNumber` (string)
   - `userName` (string)
   - `issueDate` (string)
   - `qrCodeUrl` (string)
   - `createdAt` (timestamp)
   - `updatedAt` (timestamp)
   - `verified` (boolean)

### Step 4: Configure Security Rules

In Firestore Security Rules, set:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /certificates/{document=**} {
      allow read: if true;  // Allow anyone to read (for verification)
      allow write: if request.auth != null;  // Only authenticated users can write
    }
  }
}
```

## File Upload Format Guide

### Excel Format (.xlsx, .xls)

Create a spreadsheet with participant names. Column header can be any of these:

```
| Full Name      | Certificate Date |
| John Doe       | 2026-05-12       |
| Jane Smith     | 2026-05-12       |
```

Or:

```
| First Name | Last Name  | Date       |
| John       | Doe        | 2026-05-12 |
| Jane       | Smith      | 2026-05-12 |
```

### Text Format (.txt)

Simple format with one name per line:

```
John Doe
Jane Smith
Robert Johnson
Mary Williams
```

Or CSV format:

```
Name,Date
John Doe,2026-05-12
Jane Smith,2026-05-12
```

## Certificate Generation Workflow

### Phase 1: Upload
- Select and upload file with participant names
- System automatically parses and detects names
- Duplicates are automatically removed
- Review parsed results

### Phase 2: Manage
- Edit individual names if needed
- Add missing participants
- Remove invalid entries
- Verify all names are correct

### Phase 3: Preview
- Set global issue date (applied to all certificates)
- Override individual dates if needed
- Review certificate details
- Confirm participant count

### Phase 4: Generate
- Generate PDF certificates with unique numbers
- Each certificate gets a QR code
- Data saved to Firestore
- PDFs available for download
- Progress tracking for large batches

## Certificate Features

### Unique Certificate Numbers

Format: `CERT-{timestamp}-{randomString}`

Example: `CERT-1684156200000-ABC123`

### QR Codes

Each QR code encodes:
- Verification URL: `https://your-domain.com/verify/{certificateNumber}`
- Points to a verification page showing certificate details

### Verification Process

1. User scans QR code
2. Opens `/verify/[certificateNumber]` page
3. System fetches certificate from Firestore
4. Displays certificate with authenticity badge
5. Shows full certificate design

## Certificate Customization

### Modify Design

Edit `src/components/certificate-templates/CertificateTemplate.tsx`:

```tsx
// Change certificate title
<h1 className="text-5xl font-bold">YOUR TITLE</h1>

// Change colors
className="text-indigo-900"  // Change indigo to other colors

// Adjust layout
// Modify spacing, positioning, and styling
```

### Available Colors

- `indigo` - Primary color (blue-purple)
- `slate` - Gray colors
- `green` - Success/validation
- `red` - Errors/warnings
- `amber` - Warnings/alerts

### Custom Backgrounds

Replace `certificate-bg.jpg` in `public/` folder with your image.

Image specifications:
- Format: JPG, PNG
- Recommended size: 1920x1440px (4:3 ratio)
- Optimize for web (compressed)

## PDF Generation

### Current Implementation

The current version generates PDFs using React PDF on the client side. For better results and more complex designs:

### Recommended Improvements

1. **Playwright Integration** (Recommended for production)

Install Playwright:
```bash
npm install --save-dev playwright
```

Add to `/api/generate-certificate/route.ts`:

```ts
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://localhost:3000/print?data=${encoded}`);
const pdf = await page.pdf({ format: 'A4' });
await browser.close();
```

2. **Puppeteer Integration**

```bash
npm install puppeteer
```

3. **pdfkit for Direct PDF Generation**

```bash
npm install pdfkit
```

## Performance Optimization

### For Large Batches (1000+ certificates)

1. **Implement Job Queue**

```bash
npm install bullmq
```

Use BullMQ to queue certificate generation:

```ts
const queue = new Queue('certificates');

queue.add('generate', {
  users: certificateUsers,
  issueDate: globalIssueDate,
});

queue.process(async (job) => {
  // Generate certificates in batches
});
```

2. **Batch Processing**

Modify `/api/generate-certificate` to:
- Process multiple certificates per request
- Return progress updates
- Store PDFs in Cloud Storage
- Provide download links instead of direct download

3. **Caching**

- Cache certificate designs
- Cache Firebase data locally
- Implement service workers for offline support

### Memory Optimization

```ts
// Process in chunks instead of all at once
const chunkSize = 10;
for (let i = 0; i < users.length; i += chunkSize) {
  const chunk = users.slice(i, i + chunkSize);
  await processCertificates(chunk);
}
```

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables on Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from `.env.local`

### Deploy to Other Platforms

- **Netlify:** Similar to Vercel
- **AWS Amplify:** AWS-native deployment
- **Docker:** Create containerized deployment
- **Self-hosted:** Use Node.js server

## Troubleshooting

### Build Errors

**Error: Module not found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

**Error: Firebase not configured**
- Verify `.env.local` has all Firebase variables
- Restart development server after adding env vars

### File Upload Issues

**Issue:** Names not recognized
- Check file encoding is UTF-8
- Ensure column headers follow naming convention
- Try sample template format

**Issue:** Special characters causing problems
- System normalizes special characters
- If issues persist, manually edit in Manage step

### QR Code Issues

**Issue:** QR codes not scanning
- Ensure sufficient contrast in certificate design
- Test QR code with phone camera
- Verify URL in QR code is accessible

### Firebase Issues

**Issue:** Can't connect to Firestore**
- Check internet connection
- Verify Firebase config in `.env.local`
- Check Firestore is enabled in Firebase Console
- Verify security rules allow read/write

**Issue:** Certificates not saving**
- Check Firestore quota
- Verify security rules
- Check Firebase credentials are valid
- Look at browser console for errors

## Monitoring & Analytics

### Track Certificate Generation

Add Google Analytics:

```bash
npm install next-google-analytics
```

Add to `app/layout.tsx`:
```tsx
import GoogleAnalytics from '@/lib/google-analytics';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
```

### Monitor Firestore Usage

In Firebase Console:
- View read/write operations
- Monitor storage usage
- Set up billing alerts
- Review security rule violations

## Maintenance

### Regular Tasks

1. **Weekly:** Monitor Firebase usage and costs
2. **Monthly:** Update dependencies (`npm update`)
3. **Quarterly:** Review and optimize code
4. **Annually:** Audit security and compliance

### Update Dependencies

```bash
npm outdated        # See outdated packages
npm update          # Update all packages
npm install         # Reinstall after updates
npm run build       # Test build
```

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React PDF](https://react-pdf.org)

## Frequently Asked Questions

**Q: Can I use different certificate designs?**
A: Yes, edit the CertificateTemplate component to create custom designs.

**Q: What's the maximum number of certificates I can generate?**
A: Limited by Firestore (millions) and storage. Implement batch processing for very large quantities.

**Q: Can I modify certificate data after generation?**
A: Yes, update Firestore directly or regenerate with correct data.

**Q: How do I backup certificates?**
A: Use Firestore export feature or implement regular backups.

**Q: Can I integrate email delivery?**
A: Yes, add email service (SendGrid, Mailgun) to certificate generation process.
