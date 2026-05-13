'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { useCertificateStore } from '@/lib/store';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Dynamically import steps to avoid SSR issues
const UploadStep = dynamic(() => import('@/components/steps/UploadStep').then(m => ({ default: m.UploadStep })), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});

const ManageStep = dynamic(() => import('@/components/steps/ManageStep').then(m => ({ default: m.ManageStep })), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});

const PreviewStep = dynamic(() => import('@/components/steps/PreviewStep').then(m => ({ default: m.PreviewStep })), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});

const GenerateStep = dynamic(() => import('@/components/steps/GenerateStep').then(m => ({ default: m.GenerateStep })), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});

export default function AppPage() {
  const store = useCertificateStore();

  // Ensure hydration
  if (!store.hasHydrated) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const renderStep = () => {
    switch (store.currentStep) {
      case 1:
        return <UploadStep />;
      case 2:
        return <ManageStep />;
      case 3:
        return <PreviewStep />;
      case 4:
        return <GenerateStep />;
      default:
        return <UploadStep />;
    }
  };

  const canGoBack = store.currentStep > 1;
  const canGoForward = store.currentStep < 4 && store.data && store.data.users && store.data.users.length > 0;

  const handleBack = () => {
    if (canGoBack) {
      store.setStep(store.currentStep - 1);
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      store.setStep(store.currentStep + 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Content */}
      <div>{renderStep()}</div>

      {/* Navigation Buttons */}
      {store.currentStep < 4 && (
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleBack}
            disabled={!canGoBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleForward}
            disabled={!canGoForward}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}