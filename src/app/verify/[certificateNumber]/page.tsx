'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CertificateTemplate } from '@/components/certificate-templates/CertificateTemplate';
import { buildQrCodeValue } from '@/lib/certificate-generation';
import { getCertificateByNumber } from '@/lib/firestore-service';

interface VerifyPageProps {
  params: Promise<{
    certificateNumber: string;
  }>;
}

function formatDisplayDate(isoDate: string): string {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(isoDate)
    ? new Date(`${isoDate}T00:00:00`)
    : new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Header matching the IOSH SmartVerify+ design ────────────────────────────
function VerifyHeader({ userName, issueDate }: { userName: string; issueDate: string }) {
  return (
    <div className="font-sans">
      {/* Top logo bar */}
      <div className="flex items-center justify-between gap-2 overflow-hidden border-b border-gray-200 bg-white px-3 py-3 sm:gap-3 sm:px-5 sm:py-3.5">
        {/* Left: iosh Training */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <img
            src="/logos/1.png"
            alt="IOSH"
            className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11 md:h-[52px] md:w-[52px]"
          />
          <span className="truncate text-sm font-bold tracking-tight text-[#3b2a8c] sm:text-lg md:text-xl">
            Training
          </span>
        </div>

        {/* Right: Smart Verify+ */}
        <div className="flex min-w-0 flex-1 items-center justify-end">
          <img
            src="/logos/smart-verify.png"
            alt="Smart Verify+"
            className="h-9 w-auto shrink-0 object-contain sm:h-11 md:h-[52px]"
          />
        </div>
      </div>

      {/* Green validity banner */}
      <div className="flex items-start gap-2.5 bg-[#1a6b3c] px-3 py-3 sm:gap-3 sm:px-5 sm:py-3.5">
        {/* Checkmark circle */}
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white sm:h-7 sm:w-7">
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8l4 4 6-7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="m-0 min-w-0 flex-1 text-xs leading-relaxed text-white sm:text-sm md:text-[15px]">
          This document is valid and was issued by IOSH (Institution of Occupational Safety and
          Health) to <strong>{userName}</strong> on {formatDisplayDate(issueDate)}
        </p>
      </div>
    </div>
  );
}

// ── Responsive certificate scaler ────────────────────────────────────────────
const CERT_WIDTH_MM = 210;
const MM_TO_PX = 3.7795275591; // 1mm = 3.7795px at 96dpi

function ResponsiveCertificate({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function computeScale() {
      if (!wrapperRef.current) return;
      const containerWidth = wrapperRef.current.offsetWidth;
      const certNativePx = CERT_WIDTH_MM * MM_TO_PX;
      const s = Math.min(1, containerWidth / certNativePx);
      setScale(s);
    }
    computeScale();
    const ro = new ResizeObserver(computeScale);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const certNativePx = CERT_WIDTH_MM * MM_TO_PX;
  // Height of the scaled certificate so the wrapper collapses correctly
  const certNativeHeightPx = 297 * MM_TO_PX;
  const scaledHeight = certNativeHeightPx * scale;

  return (
    <div ref={wrapperRef} style={{ width: '100%', overflow: 'hidden' }}>
      <div
        style={{
          width: `${certNativePx}px`,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          height: `${certNativeHeightPx}px`,
          marginBottom: `${scaledHeight - certNativeHeightPx}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
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
      fetchCertificate(resolvedParams.certificateNumber);
    });
    return () => { active = false; };
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
      setCertificate(null);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not reach Firebase. Check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #4f46e5',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: '#64748b', fontSize: '15px' }}>Verifying certificate...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: '16px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', maxWidth: '440px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '52px', height: '52px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>Certificate Not Verified</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.6 }}>
            {error || 'Certificate not found'}
          </p>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
            Certificate Number: <strong style={{ color: '#374151' }}>{certificateNumber}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Header */}
      <VerifyHeader userName={certificate.userName} issueDate={certificate.issueDate} />

      {/* Certificate */}
      <div style={{ padding: '20px 16px 40px' }}>
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            overflow: 'hidden',
          }}
        >
          <ResponsiveCertificate>
            <CertificateTemplate
              userName={certificate.userName}
              courseName={certificate.courseName || 'IOSH Managing Safely'}
              certificateNumber={certificate.certificateNumber}
              issueDate={certificate.issueDate}
              qrCodeValue={certificate.qrCodeUrl || buildQrCodeValue(certificate.certificateNumber)}
            />
          </ResponsiveCertificate>
        </div>
      </div>
    </div>
  );
}