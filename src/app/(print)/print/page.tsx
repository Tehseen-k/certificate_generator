import React from 'react';
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

export default async function PrintPage({ searchParams }: PrintPageProps) {
  const params = await searchParams;

  return (
    <div style={{ margin: 0, padding: 0, backgroundColor: '#fff' }}>
      <CertificateTemplate
        userName={params.name || 'Certificate Holder'}
        courseName={params.courseName || 'IOSH Managing Safely'}
        certificateNumber={params.certificateNumber || '00000000-00-0000'}
        issueDate={params.issueDate || new Date().toISOString().split('T')[0]}
        qrCodeValue={params.qrCodeValue || 'https://example.com'}
      />
    </div>
  );
}
