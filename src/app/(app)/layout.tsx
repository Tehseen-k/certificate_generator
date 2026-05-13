import { Header } from '@/components/layout/Header';
import { ProgressBar } from '@/components/layout/ProgressBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <Header />
      <ProgressBar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">{children}</main>
    </div>
  );
}

