import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { ProgressBar } from '@/components/layout/ProgressBar';
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
      <body className="min-h-full flex flex-col bg-slate-50">
        <Header />
        <ProgressBar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">{children}</main>
      </body>
    </html>
  );
}
