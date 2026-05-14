<<<<<<< HEAD
# Certificate Generator

A comprehensive bulk certificate generation system with intelligent name parsing, unique QR codes, and Firebase integration for verification.

## Features

- **📤 File Upload & Parsing**
  - Support for Excel (.xlsx, .xls) and TXT (.txt, .csv) files
  - Intelligent name detection with adaptive column name matching
  - Automatic duplicate removal

- **✏️ Name Management**
  - Edit individual participant names
  - Add new participants manually
  - Remove duplicates or unwanted entries
  - Live validation

- **📅 Flexible Date Configuration**
  - Set global issue date for all certificates
  - Override individual certificate dates
  - Date picker interface

- **🎓 Certificate Generation**
  - Generate bulk certificates in PDF format
  - Unique certificate numbers for each participant
  - QR code integration for verification
  - Professional certificate design

- **🔐 QR Code & Verification**
  - Generate unique QR codes for each certificate
  - Firebase Firestore integration for data storage
  - Verification page when QR codes are scanned
  - Certificate authenticity validation

- **🎨 Professional Design**
  - Customizable certificate template
  - Support for logos and signatures
  - QR code placement for verification
  - Responsive layout

## Installation

### Prerequisites

- Node.js 18+ and npm
- Firebase account with Firestore enabled
- Assets folder with certificate design elements

### Setup Steps

1. **Clone and navigate to the project:**
   ```bash
   cd certificate_generator
   npm install
   ```

2. **Configure Firebase:**
   - Copy `.env.example` to `.env.local`
   - Add your Firebase credentials:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

3. **Add Certificate Assets:**
   - Place assets in `public/` folder:
     - `certificate-bg.jpg` - Background image
     - `logos/1.png` - IOSH logo
     - `logos/2.png` - Top logo
     - `logos/3.png` - QR code logo
     - `logos/4.png` - Signature 1
     - `logos/5.png` - Signature 2

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-certificate/    # PDF generation endpoint
│   ├── print/                       # Certificate print page
│   ├── verify/                      # QR code verification page
│   ├── layout.tsx                   # Main layout with header & progress
│   └── page.tsx                     # Main wizard interface
├── components/
│   ├── certificate-templates/       # Certificate design component
│   ├── layout/                      # Header and progress bar
│   ├── steps/                       # Workflow step components
│   │   ├── UploadStep.tsx
│   │   ├── ManageStep.tsx
│   │   ├── PreviewStep.tsx
│   │   └── GenerateStep.tsx
│   └── ui/                          # Reusable UI components
├── lib/
│   ├── store.ts                     # Zustand state management
│   ├── certificate-helpers.ts       # File parsing utilities
│   ├── firebase.ts                  # Firebase config
│   ├── firestore-service.ts         # Firestore operations
│   └── utils.ts                     # Helper functions
└── types/
    └── certificate.ts               # TypeScript interfaces
```

## Usage

### Step 1: Upload Participant List

- Download sample templates (Excel or TXT)
- Upload file with participant names
- System automatically detects and parses names
- Duplicates are automatically removed

### Step 2: Manage Participants

- Review parsed participant list
- Edit names as needed
- Add missing participants
- Remove duplicates or invalid entries

### Step 3: Preview & Configure

- Set global issue date for all certificates
- Override individual certificate dates if needed
- Review certificate settings

### Step 4: Generate & Download

- Generate certificates for all participants
- Each certificate gets a unique number
- QR codes embedded for verification
- PDFs downloaded to your device
- Data saved to Firestore

## Supported File Formats

### Excel Files (.xlsx, .xls)

Column headers can be:
- `name`, `full name`, `fullname`, `fullName`, `full_name`
- `first name`, `firstname`, `firstName`, `first_name`
- `last name`, `lastname`, `lastName`, `last_name`
- Or any reasonable variation

### Text Files (.txt, .csv)

Supported formats:
- One name per line
- CSV format with names in columns
- Key: Value pairs with [Section] headers

## Certificate Design

The certificate template includes:
- Professional header with logos
- Participant name field
- Certificate title and achievement text
- Issue date and certificate number
- Signature areas
- QR code with verification logo
- Customizable background image

### Customizing the Template

Edit `src/components/certificate-templates/CertificateTemplate.tsx` to:
- Change colors and fonts
- Modify text content
- Adjust logo positions
- Add additional elements

## Firebase Integration

### Setting Up Firestore

1. Create a Firestore database in your Firebase project
2. Create a collection named `certificates`
3. Set up security rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /certificates/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Certificate Data Structure

Each certificate in Firestore contains:

```javascript
{
  certificateNumber: "CERT-1234567890-ABC123",
  userName: "John Doe",
  issueDate: "2026-05-12",
  qrCodeUrl: "https://your-domain.com/verify/CERT-1234567890-ABC123",
  createdAt: timestamp,
  updatedAt: timestamp,
  verified: true
}
```

## QR Code Verification

When a QR code is scanned:

1. Opens the verification page at `/verify/[certificateNumber]`
2. Fetches certificate data from Firestore
3. Displays certificate details with authenticity confirmation
4. Shows the full certificate design

## Build for Production

```bash
npm run build
npm start
```

## Performance Optimization

- Use dynamic imports for step components (already implemented)
- Implement pagination for large participant lists
- Use compression for PDF files
- Cache Firebase data locally
- Implement lazy loading for certificate preview

## Security Considerations

1. **API Security:**
   - Validate all inputs in `/api/generate-certificate`
   - Implement rate limiting for large batches
   - Use authentication for sensitive endpoints

2. **Data Protection:**
   - Use Firestore security rules to restrict access
   - Encrypt sensitive data
   - Implement audit logging

3. **QR Code Security:**
   - Use short-lived QR codes if needed
   - Implement additional verification checks
   - Log all verification attempts

## Troubleshooting

### File Upload Issues

**Problem:** Names not detected properly
- **Solution:** Ensure column headers match expected names
- Check file encoding is UTF-8
- Remove empty rows/columns

**Problem:** Duplicates not removed
- **Solution:** Names must match exactly after normalization
- Check for extra spaces or special characters

### Certificate Generation Issues

**Problem:** QR codes not displaying
- **Solution:** Verify `qrcode.react` package is installed
- Check that qrCodeValue URL is valid

**Problem:** Firebase integration errors
- **Solution:** Verify Firebase credentials in `.env.local`
- Check Firestore security rules
- Ensure collection exists in Firestore

## Future Enhancements

- [ ] Batch download as ZIP
- [ ] Email delivery of certificates
- [ ] Certificate templates customization UI
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Digital signature integration
- [ ] Blockchain certificate verification
- [ ] Integration with certificate management platforms

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
---
title: Certificate Generator
emoji: 💻
colorFrom: yellow
colorTo: red
sdk: docker
pinned: false
license: mit
short_description: Next.js service that generates high-quality A4 PDF certifica
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference
>>>>>>> 707bde2c0d8a4b37c00df598553997260aa6ff42
