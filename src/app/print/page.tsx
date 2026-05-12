'use client';

import React, { useEffect, useRef } from 'react';
import { CertificateTemplate } from '@/components/certificate-templates/CertificateTemplate';

interface PrintPageProps {
  searchParams: Promise<{
    name?: string;
    certificateNumber?: string;
    issueDate?: string;
    qrCodeValue?: string;
  }>;
}

export default function PrintPage({ searchParams }: PrintPageProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [params, setParams] = React.useState<any>(null);

  useEffect(() => {
    searchParams.then(p => {
      setParams(p);
      // Auto-print when page loads
      setTimeout(() => {
        window.print();
      }, 500);
    });
  }, [searchParams]);

  if (!params) {
    return <div className="text-center py-12">Loading certificate...</div>;
  }

  return (
    <div ref={certificateRef} className="print:m-0 print:p-0">
      <CertificateTemplate
        userName={params.name || 'Certificate Holder'}
        certificateNumber={params.certificateNumber || 'CERT-000000'}
        issueDate={params.issueDate || new Date().toISOString().split('T')[0]}
        qrCodeValue={params.qrCodeValue || 'https://example.com'}
      />
    </div>
  );
}
