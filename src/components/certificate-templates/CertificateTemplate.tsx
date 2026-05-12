'use client';

import React from 'react';
import QRCode from 'qrcode.react';

interface CertificateTemplateProps {
  userName: string;
  certificateNumber: string;
  issueDate: string;
  qrCodeValue: string;
}

export const CertificateTemplate = React.forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ userName, certificateNumber, issueDate, qrCodeValue }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-full h-screen bg-white overflow-hidden print:h-auto"
        style={{
          backgroundImage: 'url(/certificate-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Certificate Layout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-16">
          {/* Top Logo */}
          <div className="absolute top-8 right-8 w-24 h-24">
            <img src="/logos/2.png" alt="Top Logo" className="w-full h-full object-contain" />
          </div>

          {/* IOSH Logo */}
          <div className="absolute top-8 left-8 w-24 h-24">
            <img src="/logos/1.png" alt="IOSH Logo" className="w-full h-full object-contain" />
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-indigo-900 mb-2">CERTIFICATE</h1>
            <p className="text-2xl text-indigo-700 font-semibold">of Achievement</p>
          </div>

          {/* "This is to certify" text */}
          <p className="text-center text-lg text-gray-700 mb-8">This is to certify that</p>

          {/* Name */}
          <div className="text-center mb-12 border-b-4 border-indigo-900 pb-4 w-3/4">
            <p className="text-4xl font-bold text-indigo-900">{userName}</p>
          </div>

          {/* Main Certificate Text */}
          <p className="text-center text-lg text-gray-700 mb-6 max-w-2xl">
            has successfully completed the training course in
            <br />
            <span className="font-bold text-xl text-indigo-900">IOSH Managing Safely</span>
          </p>

          {/* Date and Certificate Number */}
          <div className="flex justify-between w-full max-w-2xl mb-16 text-gray-700">
            <div className="text-center">
              <p className="text-sm mb-2">Issue Date</p>
              <p className="text-lg font-semibold">{issueDate}</p>
            </div>
            <div className="text-center">
              <p className="text-sm mb-2">Certificate Number</p>
              <p className="text-lg font-semibold">{certificateNumber}</p>
            </div>
          </div>

          {/* Signatures and QR Code */}
          <div className="flex justify-between items-end w-full max-w-4xl">
            {/* Signature 1 */}
            <div className="text-center">
              <img src="/logos/4.png" alt="Signature 1" className="w-32 h-16 object-contain mb-2" />
              <p className="text-sm text-gray-700 border-t border-gray-400 pt-2">Authorized Signatory 1</p>
            </div>

            {/* QR Code Center */}
            <div className="text-center">
              <div className="mb-4 bg-white p-4 rounded">
                <QRCode
                  value={qrCodeValue}
                  size={100}
                  level="H"
                  includeMargin={true}
                  renderAs="canvas"
                />
              </div>
              <img src="/logos/3.png" alt="QR Logo" className="w-16 h-16 object-contain mx-auto" />
            </div>

            {/* Signature 2 */}
            <div className="text-center">
              <img src="/logos/5.png" alt="Signature 2" className="w-32 h-16 object-contain mb-2" />
              <p className="text-sm text-gray-700 border-t border-gray-400 pt-2">Authorized Signatory 2</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
