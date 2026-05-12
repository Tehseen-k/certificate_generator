# Certificate Generator - Development Instructions

## Architecture Overview

The Certificate Generator is built using Next.js 16 with React 19, following patterns from the CV Generator project but optimized for certificate generation workflows.

### Technology Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **State Management:** Zustand 5
- **Styling:** Tailwind CSS 4, Radix UI components
- **File Parsing:** XLSX library for Excel, custom parser for text
- **PDF Generation:** @react-pdf/renderer (client-side), Playwright (server-side)
- **QR Codes:** qrcode.react
- **Backend:** Next.js API Routes
- **Database:** Firebase Firestore
- **Icons:** Lucide React

### Project Structure

```
certificate_generator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-certificate/route.ts    # PDF generation endpoint
│   │   ├── print/page.tsx                        # Certificate print layout
│   │   ├── verify/[certificateNumber]/page.tsx   # QR verification page
│   │   ├── layout.tsx                            # Root layout
│   │   ├── page.tsx                              # Main wizard
│   │   └── globals.css                           # Global styles
│   ├── components/
│   │   ├── certificate-templates/
│   │   │   └── CertificateTemplate.tsx           # Certificate design
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── steps/
│   │   │   ├── UploadStep.tsx
│   │   │   ├── ManageStep.tsx
│   │   │   ├── PreviewStep.tsx
│   │   │   └── GenerateStep.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── input.tsx
│   ├── lib/
│   │   ├── store.ts                     # Zustand store
│   │   ├── certificate-helpers.ts       # Parsing utilities
│   │   ├── template-helpers.ts          # Template downloads
│   │   ├── firebase.ts                  # Firebase config
│   │   ├── firestore-service.ts         # Firestore operations
│   │   └── utils.ts                     # Utility functions
│   └── types/
│       └── certificate.ts               # TypeScript types
├── public/
│   └── logos/                           # Certificate assets
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.mjs
├── postcss.config.mjs
├── next.config.ts
├── README.md
└── SETUP_GUIDE.md
```

## Development Workflow

### 1. Feature Development

#### Adding a New Step

1. Create new component in `src/components/steps/NewStep.tsx`:

```tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCertificateStore } from '@/lib/store';

export const NewStep = () => {
  const store = useCertificateStore();

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Step Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step content */}
        </CardContent>
      </Card>
    </div>
  );
};
```

2. Import in `src/app/page.tsx`
3. Add case in switch statement
4. Update STEPS array in `ProgressBar.tsx`

#### Adding State Management

```ts
// In src/lib/store.ts, add to CertificateState interface:
newField: SomeType;
setNewField: (value: SomeType) => void;

// In create() function:
setNewField: (value) => set({ newField: value }),
```

#### Adding UI Components

1. Create component in `src/components/ui/component.tsx`
2. Export from component
3. Import and use in steps

### 2. Certificate Design Customization

Edit `src/components/certificate-templates/CertificateTemplate.tsx`:

```tsx
// Modify layout
<div className="absolute inset-0">
  {/* Your design */}
</div>

// Change colors
className="text-indigo-900"  // RGB colors

// Add/remove elements
<img src="/logos/custom.png" />
```

### 3. API Development

Create new API route in `src/app/api/endpoint/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Process request
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

### 4. Firebase Integration

```ts
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Save data
const docRef = await addDoc(collection(db, 'certificates'), {
  // data
});

// Query data
const q = query(
  collection(db, 'certificates'),
  where('field', '==', 'value')
);
const snap = await getDocs(q);
```

## Common Tasks

### Task 1: Change Certificate Title

File: `src/components/certificate-templates/CertificateTemplate.tsx`

```tsx
// Find and change:
<h1 className="text-5xl font-bold text-indigo-900">CERTIFICATE</h1>
<p className="text-2xl text-indigo-700">of Achievement</p>
```

### Task 2: Add Custom Logo

1. Place image in `public/logos/custom.png`
2. Update CertificateTemplate:

```tsx
<div className="absolute top-8 left-8 w-24 h-24">
  <img src="/logos/custom.png" alt="Logo" className="w-full h-full object-contain" />
</div>
```

### Task 3: Modify File Upload Formats

File: `src/lib/certificate-helpers.ts`

- Add new aliases to `NAME_ALIASES`
- Update `parseExcelFile()` or `parseTextFile()`
- Test with sample files

### Task 4: Add Email Notifications

1. Install email service:
```bash
npm install sendgrid @sendgrid/mail
```

2. Update `/api/generate-certificate/route.ts`:

```ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: 'noreply@certificates.com',
  subject: 'Your Certificate',
  html: certificateHtml,
});
```

### Task 5: Implement Batch Download as ZIP

1. Install zip library:
```bash
npm install jszip
```

2. Create new API route `/api/export-certificates`:

```ts
import JSZip from 'jszip';

const zip = new JSZip();

for (const cert of certificates) {
  zip.file(`${cert.number}.pdf`, pdfBlob);
}

const content = await zip.generateAsync({ type: 'blob' });
```

## Testing

### Unit Testing

```bash
npm install --save-dev jest @testing-library/react
```

Create test file: `src/lib/certificate-helpers.test.ts`

```ts
import { removeDuplicates } from '@/lib/certificate-helpers';

describe('removeDuplicates', () => {
  it('removes duplicate names', () => {
    const users = [
      { id: '1', fullName: 'John Doe' },
      { id: '2', fullName: 'john doe' },
    ];
    const result = removeDuplicates(users);
    expect(result).toHaveLength(1);
  });
});
```

### Integration Testing

Test file upload and parsing:

```ts
// Test with sample Excel file
const file = new File(['data'], 'test.xlsx', { type: 'application/vnd.ms-excel' });
const users = await parseFile(file);
expect(users.length).toBeGreaterThan(0);
```

## Performance Tips

### 1. Lazy Load Steps

Already implemented with dynamic imports in `page.tsx`

### 2. Optimize Images

```bash
npm install sharp
```

Compress certificate assets before uploading.

### 3. Use React.memo for Expensive Components

```tsx
const CertificatePreview = React.memo(({ data }) => {
  // Component
});
```

### 4. Implement Virtual Scrolling for Large Lists

```bash
npm install react-window
```

### 5. Cache Firebase Queries

Use React Query:

```bash
npm install @tanstack/react-query
```

## Debugging

### Client-Side Debugging

1. Open DevTools (F12)
2. Check Console for errors
3. Use React DevTools extension
4. Check Network tab for API calls

### Server-Side Debugging

Add logging to API routes:

```ts
console.log('Certificate generation:', { userName, certificateNumber });
```

View logs in terminal or Firebase Cloud Logging.

### Firebase Debugging

1. Use Firebase Emulator for local development
2. Monitor Firestore in Firebase Console
3. Check security rules for access issues

### State Management Debugging

```ts
// In any component
import { useCertificateStore } from '@/lib/store';

export const DebugStore = () => {
  const state = useCertificateStore();
  console.log('Store state:', state);
  return null;
};
```

## Performance Monitoring

### Web Vitals

```bash
npm install web-vitals
```

Track in `app/layout.tsx`:

```ts
import { reportWebVitals } from 'web-vitals';

reportWebVitals(console.log);
```

### Firebase Performance

Use Firebase Performance Monitoring:

```bash
npm install firebase
```

Enable in `lib/firebase.ts`:

```ts
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local`
   - Use `.env.example` for documentation
   - Rotate secrets regularly

2. **Input Validation**
   - Validate file uploads
   - Sanitize user input
   - Check file sizes and types

3. **Firebase Security Rules**
   - Implement proper authentication
   - Use security rules to control access
   - Audit rule violations

4. **CORS Configuration**
   - Only allow trusted origins
   - Set proper headers
   - Implement CSRF protection

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-email-notification

# Make changes
# Commit regularly
git commit -m "Add email notification for certificates"

# Push and create PR
git push origin feature/add-email-notification

# After review, merge to main
git checkout main
git merge feature/add-email-notification
```

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Tag release: `git tag v1.0.0`
4. Build: `npm run build`
5. Deploy to production
6. Verify functionality
7. Monitor error logs

## Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm start                  # Start production server
npm run lint               # Run ESLint
npm test                   # Run tests

# Maintenance
npm update                 # Update dependencies
npm audit                  # Security audit
npm outdated               # Check outdated packages

# Deployment
vercel deploy              # Deploy to Vercel
```

## Resources & References

- [Next.js App Router](https://nextjs.org/docs/app)
- [React 19 Docs](https://react.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Troubleshooting Development Issues

### Hot Reload Not Working

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Node Modules Issues

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Regenerate types
npm run build

# Check for errors
npx tsc --noEmit
```

### Port Already in Use

```bash
# Use different port
npm run dev -- -p 3001
```

## Contributing Guidelines

1. Follow existing code style
2. Use TypeScript for type safety
3. Write clear commit messages
4. Test changes thoroughly
5. Update documentation
6. Ensure responsive design
7. Check accessibility (WCAG 2.1)
8. Optimize performance
9. Consider edge cases
10. Get code review before merging
