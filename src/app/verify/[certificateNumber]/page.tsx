'use client';

import React, { useEffect, useState } from 'react';
import { CertificateTemplate } from '@/components/certificate-templates/CertificateTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCertificateByNumber } from '@/lib/firestore-service';

interface VerifyPageProps {
  params: Promise<{
    certificateNumber: string;
  }>;
}

export default function VerifyPage({ params }: VerifyPageProps) {
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');

  useEffect(() => {
    let active = true;
    params.then((resolvedParams) => {
      if (!active) return;
      setCertificateNumber(resolvedParams.certificateNumber);
      // Fetch certificate from Firestore
      fetchCertificate(resolvedParams.certificateNumber);
    });
    return () => {
      active = false;
    };
  }, [params]);

  const fetchCertificate = async (certNumber: string) => {
    try {
      setLoading(true);
      const cert = await getCertificateByNumber(certNumber);
      if (!cert) {
        setCertificate(null);
        setError('Certificate not yet generated. This certificate has not been saved and cannot be verified.');
        return;
      }
      setCertificate(cert);
      setError('');
    } catch (err) {
      setError('Certificate not yet generated. This certificate has not been saved and cannot be verified.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Verifying certificate...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>Certificate Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error || 'Certificate not found'}</p>
            <p className="text-sm text-slate-600">
              Certificate Number: <strong>{certificateNumber}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">✓ Certificate Verified</CardTitle>
              <CardDescription>
                This certificate is valid and issued by the organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                <strong>Holder:</strong> {certificate.userName}
              </p>
              <p className="text-sm mt-2">
                <strong>Certificate Number:</strong> {certificate.certificateNumber}
              </p>
              <p className="text-sm mt-2">
                <strong>Course:</strong> {certificate.courseName || 'IOSH Managing Safely'}
              </p>
              <p className="text-sm mt-2">
                <strong>Issue Date:</strong> {certificate.issueDate}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <CertificateTemplate
            userName={certificate.userName}
            courseName={certificate.courseName || 'IOSH Managing Safely'}
            certificateNumber={certificate.certificateNumber}
            issueDate={certificate.issueDate}
            qrCodeValue={`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/verify/${certificate.certificateNumber}`}
          />
        </div>
      </div>
    </div>
  );
}
