# Certificate Generator - Quick Start Checklist

## Pre-Setup Requirements

- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Firebase account created
- [ ] Firestore database enabled
- [ ] Certificate asset files ready (logos, background image)

## Setup (5-10 minutes)

- [ ] Run `npm install` in certificate_generator folder
- [ ] Create `.env.local` with Firebase credentials
- [ ] Copy `.env.example` to `.env.local` and fill in values
- [ ] Add certificate assets to `public/` folder
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:3000` in browser

## Asset Setup (Required)

Create `public/` structure:
```
public/
├── certificate-bg.jpg          ← Certificate background
└── logos/
    ├── 1.png                   ← IOSH logo
    ├── 2.png                   ← Top logo
    ├── 3.png                   ← QR code logo
    ├── 4.png                   ← Signature 1
    └── 5.png                   ← Signature 2
```

## Firebase Setup (Optional but Recommended)

- [ ] Create Firestore collection: `certificates`
- [ ] Set Firebase security rules
- [ ] Verify credentials in `.env.local`
- [ ] Test connection to Firestore

## First Test Run

1. **Go to Upload Step**
   - Download sample template
   - Create test file with 3-5 names
   - Upload file
   - System should parse names automatically

2. **Go to Manage Step**
   - Review parsed names
   - Edit a name to test functionality
   - Add a new participant
   - Remove a participant

3. **Go to Preview Step**
   - Set issue date
   - Override a date for one certificate
   - Review certificate settings

4. **Go to Generate Step**
   - Review summary
   - Click "Generate & Download Certificates"
   - Should start generation process
   - Should show progress
   - PDFs should download

## Troubleshooting Initial Setup

### Issue: Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Issue: Module not found errors
```bash
rm -rf node_modules
npm install
npm run dev
```

### Issue: Firebase credentials not working
- Double-check `.env.local` spelling
- Verify values are not quoted
- Restart dev server after adding env vars
- Check Firebase console is accessible

### Issue: Assets not loading
- Ensure files are in `public/` folder
- Check file names match exactly (case-sensitive)
- Use correct file paths (relative to public/)
- Try with absolute paths if needed

## File Upload Examples

### Excel Format
```
| Full Name      | Issue Date |
| John Doe       | 2026-05-12 |
| Jane Smith     | 2026-05-12 |
| Robert Johnson | 2026-05-12 |
```

### Text Format
```
John Doe
Jane Smith
Robert Johnson
Mary Williams
```

## Next Steps After Basic Testing

1. **Customize Certificate Design**
   - Edit `src/components/certificate-templates/CertificateTemplate.tsx`
   - Change title, colors, layout
   - Add/modify logos and signatures

2. **Configure Firestore**
   - Set up security rules
   - Test certificate storage
   - Implement verification

3. **Add Production Features**
   - Implement Playwright for PDF generation
   - Add email delivery
   - Implement batch download as ZIP
   - Add analytics

4. **Deploy**
   - Test production build: `npm run build`
   - Deploy to Vercel or other platform
   - Set up environment variables
   - Monitor in production

## Common Tasks

### Change Certificate Title
Edit `src/components/certificate-templates/CertificateTemplate.tsx`:
```tsx
<h1 className="text-5xl font-bold text-indigo-900">YOUR TITLE HERE</h1>
```

### Change Colors
Replace `indigo` with color:
- `blue`, `green`, `red`, `purple`, `yellow`, `pink`, etc.

### Change Background Image
1. Save new image as `public/certificate-bg.jpg`
2. Should be 1920x1440px or similar ratio

### Change Logos
1. Replace images in `public/logos/` folder
2. Keep same file names
3. Update file extensions if needed in component

## Performance Tips

- Start with small batches (10-20) for testing
- Use modern browser for best performance
- Close unused tabs/applications
- Test on target deployment platform early
- Monitor Firebase usage in console

## Documentation Files

- **README.md** - Project overview and features
- **SETUP_GUIDE.md** - Detailed setup and configuration
- **DEVELOPMENT.md** - Development workflow and architecture
- **This file** - Quick start checklist

## Support Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand Store](https://github.com/pmndrs/zustand)

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server

# Maintenance
npm install             # Install dependencies
npm update              # Update packages
npm audit               # Security check
npm run lint            # Lint code

# Cleanup
rm -rf node_modules    # Remove dependencies
rm -rf .next           # Clear Next.js cache
```

## Success Criteria

✅ All setup steps completed  
✅ Dev server running at http://localhost:3000  
✅ Can upload and parse test file  
✅ Can edit names in manage step  
✅ Can set dates in preview step  
✅ Can generate certificates (if assets ready)  
✅ No errors in browser console  
✅ No errors in terminal  

## Next Meeting Preparation

Before the next development session:
- [ ] All assets are in `public/` folder
- [ ] Firebase credentials are configured
- [ ] Test file uploads work
- [ ] Identify desired customizations
- [ ] List any additional features needed

## Notes

Use this checklist for:
- ✓ Initial setup
- ✓ Onboarding new developers
- ✓ Troubleshooting common issues
- ✓ Quick reference guide

For detailed information, see:
- SETUP_GUIDE.md for configuration details
- DEVELOPMENT.md for code architecture
- README.md for feature overview
