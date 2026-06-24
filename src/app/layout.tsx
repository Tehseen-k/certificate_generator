import '@fontsource/dejavu-sans/400.css';
import '@fontsource/dejavu-sans/700.css';
import '@fontsource/dejavu-sans/400-italic.css';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Certificate Generator',
  description: 'Generate bulk certificates with unique QR codes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full" suppressHydrationWarning>{children}</body>
    </html>
  );
}
