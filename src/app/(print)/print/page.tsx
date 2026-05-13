'use client';

import React, { useEffect, useState } from 'react';
import { CertificateTemplate } from '@/components/certificate-templates/CertificateTemplate';

interface PrintPageProps {
  searchParams: Promise<{
    name?: string;
    courseName?: string;
    certificateNumber?: string;
    issueDate?: string;
    qrCodeValue?: string;
  }>;
}

export default function PrintPage({ searchParams }: PrintPageProps) {
  const certificateRef = React.useRef<HTMLDivElement>(null);
  const [params, setParams] = useState<any>(null);

  useEffect(() => {
    searchParams.then(p => {
      setParams(p);
    });
  }, [searchParams]);

  if (!params) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading certificate...</div>;
  }

  return (
    <div style={{ margin: 0, padding: 0, backgroundColor: '#fff' }}>
      <CertificateTemplate
        ref={certificateRef}
        userName={params.name || 'Certificate Holder'}
        courseName={params.courseName || 'IOSH Managing Safely'}
        certificateNumber={params.certificateNumber || '00000000-00-0000'}
        issueDate={params.issueDate || new Date().toISOString().split('T')[0]}
        qrCodeValue={params.qrCodeValue || 'https://example.com'}
      />
    </div>
  );
}
