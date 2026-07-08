export default function VerifyLandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9] px-4 font-sans">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <h1 className="mb-3 text-2xl font-bold text-[#1e1656]">Certificate Verification</h1>
        <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
          Scan the QR code on your IOSH certificate to verify it, or open the verification link
          printed on your certificate.
        </p>
      </div>
    </div>
  );
}
