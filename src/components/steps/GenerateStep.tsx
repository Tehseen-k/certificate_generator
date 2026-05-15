'use client';

import React, { useState } from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCertificateStore } from '@/lib/store';
import { generateCertificateNumber } from '@/lib/certificate-helpers';
import { saveCertificateToFirestore } from '@/lib/firestore-service';

interface GenerationStatus {
  total: number;
  completed: number;
  failed: number;
  currentUser: string;
  errors: string[];
}

export const GenerateStep = () => {
  const store = useCertificateStore();
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleGenerateCertificates = async () => {
    if (store.data.users.length === 0) {
      alert('No participants to generate certificates for');
      return;
    }

    setIsGenerating(true);
    setStatus({
      total: store.data.users.length,
      completed: 0,
      failed: 0,
      currentUser: '',
      errors: [],
    });

    const errors: string[] = [];
    let completed = 0;

    for (let i = 0; i < store.data.users.length; i++) {
      const user = store.data.users[i];
      const issueDate = user.issueDateOverride || store.data.globalIssueDate;
      const courseName = user.courseName?.trim() || store.data.globalCourseName || 'IOSH Managing Safely';

      setStatus((prev) =>
        prev
          ? {
              ...prev,
              currentUser: user.fullName,
              completed,
            }
          : null
      );

      try {
        const certificateNumber = generateCertificateNumber();
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const qrCodeValue = `${baseUrl}/verify/${certificateNumber}`;

        // Call API to generate PDF
        const response = await fetch('/api/generate-certificate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: user.fullName,
            courseName,
            certificateNumber,
            issueDate,
            qrCodeValue,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate certificate for ${user.fullName}`);
        }

        // Download the PDF
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${certificateNumber}_${user.fullName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        await saveCertificateToFirestore(certificateNumber, user.fullName, courseName, issueDate, qrCodeValue);

        completed++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${user.fullName}: ${errorMsg}`);
      }

      setStatus((prev) =>
        prev
          ? {
              ...prev,
              completed,
              failed: errors.length,
              errors,
            }
          : null
      );
    }

    setStatus((prev) =>
      prev
        ? {
            ...prev,
            completed,
            failed: errors.length,
            errors,
          }
        : null
    );

    setIsGenerating(false);
    setIsComplete(true);
  };

  if (!status) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Generate Certificates</CardTitle>
            <CardDescription>
              Ready to generate {store.data.users.length} certificate{store.data.users.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Certificate Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">{store.data.users.length}</p>
                <p className="text-sm text-indigo-700">Total Certificates</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{store.data.globalIssueDate}</p>
                <p className="text-sm text-blue-700">Global Issue Date</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">PDF</p>
                <p className="text-sm text-green-700">Format</p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 text-sm">Important Notes:</p>
                <ul className="text-sm text-amber-800 mt-2 list-disc list-inside space-y-1">
                  <li>Each certificate will get a unique certificate number</li>
                  <li>QR codes will be embedded for verification</li>
                  <li>This may take a few minutes for large batches</li>
                  <li>Ensure all participant names are correct before proceeding</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={handleGenerateCertificates}
              disabled={isGenerating || store.data.users.length === 0}
              size="lg"
              className="w-full flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate & Download Certificates
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className={isGenerating ? '' : status.failed === 0 ? 'border-green-200' : 'border-amber-200'}>
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              {status.failed === 0 ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600" />
              )}
              <div>
                <CardTitle>{status.failed === 0 ? 'Generation Complete!' : 'Generation Complete (With Errors)'}</CardTitle>
                <CardDescription>
                  {status.failed === 0
                    ? 'All certificates generated successfully'
                    : `${status.failed} certificate(s) failed to generate`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{status.completed}</p>
                <p className="text-sm text-green-700">Generated</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{status.failed}</p>
                <p className="text-sm text-red-700">Failed</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-slate-600">{status.total}</p>
                <p className="text-sm text-slate-700">Total</p>
              </div>
            </div>

            {/* Errors */}
            {status.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="font-semibold text-red-900 text-sm mb-3">Errors:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {status.errors.map((error, i) => (
                    <p key={i} className="text-xs text-red-800">
                      • {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setStatus(null);
                  setIsComplete(false);
                  store.reset();
                  store.setStep(1);
                }}
                variant="outline"
                className="flex-1"
              >
                Start Over
              </Button>
              <Button
                onClick={() => {
                  // Download as ZIP would be here if needed
                  alert('All certificates have been downloaded individually to your device');
                }}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generation in progress
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Certificates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold">
                {status.completed} / {status.total}
              </span>
              <span className="text-sm text-slate-600">
                {Math.round((status.completed / status.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${(status.completed / status.total) * 100}%` }}
              />
            </div>
          </div>

          {/* Current User */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Currently generating:</p>
            <p className="font-semibold text-lg">{status.currentUser}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
