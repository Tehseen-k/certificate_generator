import { generateCertificateNumber } from '@/lib/certificate-helpers';
import { saveCertificateIfNotExists } from '@/lib/firestore-service';
import type { CertificateUser } from '@/types/certificate';

export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || '';
}

export function getVerifyBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return (
      process.env.NEXT_PUBLIC_VERIFY_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      window.location.origin
    );
  }
  return process.env.NEXT_PUBLIC_VERIFY_URL || process.env.NEXT_PUBLIC_APP_URL || '';
}

export function buildQrCodeValue(certificateNumber: string): string {
  return `${getVerifyBaseUrl()}/verify/${certificateNumber}`;
}

/**
 * Return the user's assigned certificate number, or generate and persist a new one.
 */
export function ensureCertificateNumber(
  user: CertificateUser,
  updateUser: (userId: string, updates: Partial<CertificateUser>) => void
): string {
  if (user.certificateNumber) {
    return user.certificateNumber;
  }

  const certificateNumber = generateCertificateNumber();
  updateUser(user.id, { certificateNumber });
  return certificateNumber;
}

export interface GenerateCertificateParams {
  userName: string;
  courseName: string;
  certificateNumber: string;
  issueDate: string;
}

export interface GenerateCertificateResult {
  certificateNumber: string;
  savedToFirebase: boolean;
}

/**
 * Generate PDF, trigger browser download, and save to Firebase if not already saved.
 * Mirrors the flow used in the Generate Certificates step.
 */
export async function generateAndDownloadCertificate(
  params: GenerateCertificateParams,
  options?: { skipFirebaseSave?: boolean }
): Promise<GenerateCertificateResult> {
  const { userName, courseName, certificateNumber, issueDate } = params;
  const qrCodeValue = buildQrCodeValue(certificateNumber);

  const response = await fetch('/api/generate-certificate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userName,
      courseName,
      certificateNumber,
      issueDate,
      qrCodeValue,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate certificate');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${certificateNumber}_${userName.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);

  let savedToFirebase = false;
  if (!options?.skipFirebaseSave) {
    const result = await saveCertificateIfNotExists(
      certificateNumber,
      userName,
      courseName,
      issueDate,
      qrCodeValue
    );
    savedToFirebase = result.saved;
  }

  return { certificateNumber, savedToFirebase };
}
