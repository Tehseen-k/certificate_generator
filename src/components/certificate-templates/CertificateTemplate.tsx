'use client';

import React from 'react';
import QRCode from 'qrcode.react';

interface CertificateTemplateProps {
  userName: string;
  courseName: string;
  certificateNumber: string;
  issueDate: string;
  qrCodeValue: string;
}

function formatIssueDate(issueDate: string): string {
  const parsed =
    /^\d{4}-\d{2}-\d{2}$/.test(issueDate)
      ? new Date(`${issueDate}T00:00:00`)
      : new Date(issueDate);
  if (Number.isNaN(parsed.getTime())) return issueDate;
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export const CertificateTemplate = React.forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ userName, courseName, certificateNumber, issueDate, qrCodeValue }, ref) => {
    const issuedDateText = formatIssueDate(issueDate);

    return (
      <div
        ref={ref}
        style={{
          width: '210mm',
          height: '260mm',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden',
          margin: 0,
          padding: 0,
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#1a1a1a',
          backgroundImage: 'url(/certificate-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Single blue border with margin from edge */}
        <div
          style={{
            position: 'absolute',
            inset: '12px',
            border: '2px solid #6bc8dc',
            boxSizing: 'border-box',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* ── ALL CONTENT inside border padding ── */}
        <div
          style={{
            position: 'absolute',
            top: '22px',
            left: '22px',
            right: '22px',
            bottom: '22px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          {/* IOSH Crest — bigger */}
          <img
            src="/logos/2.png"
            alt="IOSH Crest"
            style={{
              height: '230px',
              objectFit: 'contain',
              display: 'block',
              marginTop: '6px',
            }}
          />

          {/* "This is a certificate awarded to" */}
          <p style={{ margin: '24px 0 0', fontSize: '16px', textAlign: 'center', lineHeight: 1.5 }}>
            This is a certificate awarded to
          </p>

          {/* Recipient Name */}
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '32px',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '90%',
              wordBreak: 'break-word',
            }}
          >
            {userName}
          </p>

          {/* "on successfully completing" */}
          <p style={{ margin: '20px 0 0', fontSize: '16px', textAlign: 'center', lineHeight: 1.5 }}>
            on successfully completing
          </p>

          {/* Course Name */}
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '30px',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '90%',
              wordBreak: 'break-word',
            }}
          >
            {courseName}
          </p>

          {/* "a course approved and validated by the" */}
          <p style={{ margin: '20px 0 0', fontSize: '16px', textAlign: 'center', lineHeight: 1.5 }}>
            a course approved and validated by the
          </p>

          {/* Institution name */}
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '22px',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 1.3,
              maxWidth: '75%',
            }}
          >
            Institution of Occupational Safety and Health
          </p>

          {/* "in association with" */}
          <p style={{ margin: '20px 0 0', fontSize: '16px', textAlign: 'center', lineHeight: 1.5 }}>
            in association with
          </p>

          {/* Kaspar line */}
          <p style={{ margin: '8px 0 0', fontSize: '16px', textAlign: 'center', lineHeight: 1.4 }}>
            Kaspar International Training Services Private Ltd
          </p>

          {/* Approved Centre */}
          <p
            style={{
              margin: '3px 0 0',
              fontSize: '14px',
              fontWeight: 'bold',
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            Approved Centre: 5264
          </p>

          {/* ── Signature block: IOSH logo LEFT | signatures CENTERED in remaining space ── */}
          <div
            style={{
              marginTop: '22px',
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              flexShrink: 0,
            }}
          >
            {/* Left: IOSH circular logo */}
            <div
              style={{
                width: '105px',
                flexShrink: 0,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                paddingTop: '36px',
              }}
            >
              <img
                src="/logos/1.png"
                alt="IOSH Logo"
                style={{ width: '90px', objectFit: 'contain' }}
              />
            </div>

            {/* Center: fully centered signature block */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <p style={{ margin: '0', fontSize: '14px', textAlign: 'center', lineHeight: 1.5 }}>
                Signed on behalf of IOSH
              </p>

              {/* Chief Executive Signature */}
              <img
                src="/logos/5.png"
                alt="Chief Executive Signature"
                style={{
                  height: '120px',
                  objectFit: 'contain',
                  marginTop: '0px',
                  display: 'block',
                }}
              />
              <p style={{ margin: '0px 0 0', fontSize: '14px', textAlign: 'center' }}>
                Chief Executive
              </p>

              {/* Course Organiser Signature */}
              <img
                src="/logos/4.png"
                alt="Course Organiser Signature"
                style={{
                  height: '120px',
                  objectFit: 'contain',
                  marginTop: '0px',
                  display: 'block',
                }}
              />
              <p style={{ margin: '0px 0 0', fontSize: '14px', textAlign: 'center' }}>
                Course Organiser
              </p>
            </div>

            {/* Right spacer to balance the IOSH logo on the left */}
            <div style={{ width: '105px', flexShrink: 0 }} />
          </div>

          {/* ── FOOTER: QR bottom-left, cert info bottom-right ── */}
          <div
            style={{
              marginTop: 'auto',
              width: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              paddingBottom: '4px',
              boxSizing: 'border-box',
            }}
          >
            {/* Left: QR in SmartVerify frame */}
            <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
              <img
                src="/logos/3.png"
                alt="SmartVerify frame"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'fill',
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '18px',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                }}
              >
                <QRCode
                  value={qrCodeValue}
                  size={52}
                  level="H"
                  includeMargin={false}
                  renderAs="canvas"
                />
              </div>
            </div>

            {/* Right: cert number + date */}
            <div
              style={{
                textAlign: 'right',
                fontSize: '12px',
                color: '#1a1a1a',
                lineHeight: 2,
                paddingBottom: '6px',
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>IOSH certificate number:</span>{' '}
                {certificateNumber}
              </div>
              <div>
                <span style={{ fontWeight: 600 }}>Issued Date:</span>{' '}
                {issuedDateText}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
