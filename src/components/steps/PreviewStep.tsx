'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCertificateStore } from '@/lib/store';
import { generateCertificateNumber } from '@/lib/certificate-helpers';
import type { CertificateUser } from '@/types/certificate';
import { CertificateTemplate } from '@/components/certificate-templates/CertificateTemplate';
import { Eye, Download, Calendar, BookOpen, User, CheckCircle, X } from 'lucide-react';

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const PreviewStep = () => {
  const store = useCertificateStore();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [previewUser, setPreviewUser] = useState<CertificateUser | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const getIssueDate = (user: CertificateUser): string => {
    return user.issueDateOverride || store.data.globalIssueDate;
  };

  const getCourseName = (user: CertificateUser): string => {
    return user.courseName?.trim() || store.data.globalCourseName;
  };

  const handleDateChange = (userId: string, date: string) => {
    store.updateUser(userId, { issueDateOverride: date });
  };

  const handleCourseChange = (userId: string, courseName: string) => {
    store.updateUser(userId, { courseName: courseName.trim() || undefined });
  };

  const generateIndividualCertificate = async (user: CertificateUser) => {
    setIsGenerating(true);
    try {
      const certificateNumber = generateCertificateNumber();
      const qrCodeValue = `${window.location.origin}/verify/${certificateNumber}`;
      const issueDate = getIssueDate(user);
      const courseName = getCourseName(user);

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
        throw new Error('Failed to generate certificate');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${certificateNumber}_${user.fullName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Settings & Preview</h1>
        <p className="text-lg text-gray-600">Configure settings and preview individual certificates</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Global Issue Date */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Global Issue Date
              </CardTitle>
              <CardDescription>
                Applied to all certificates unless individually overridden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={store.data.globalIssueDate}
                onChange={(e) => store.setGlobalIssueDate(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Global Course Name */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Global Course Name
              </CardTitle>
              <CardDescription>
                Applied when participants don't have individual courses set
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={store.data.globalCourseName}
                onChange={(e) => store.setGlobalCourseName(e.target.value || 'IOSH Managing Safely')}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Ready to Generate</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Total Certificates:</strong> {store.data.users.length}</p>
                <p><strong>Global Date:</strong> {store.data.globalIssueDate}</p>
                <p><strong>Global Course:</strong> {store.data.globalCourseName}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants List */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Participants ({store.data.users.length})
              </CardTitle>
              <CardDescription>
                Review and customize individual certificate settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {store.data.users.map((user, index) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">{user.fullName}</p>
                            <p className="text-xs text-gray-600">
                              Date: {getIssueDate(user)} • Course: {getCourseName(user)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPreviewUser(user);
                              setShowPreviewModal(true);
                            }}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Preview
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                          >
                            {expandedUser === user.id ? 'Collapse' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {expandedUser === user.id && (
                      <div className="bg-white p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-900">
                            Individual Course Name
                          </label>
                          <Input
                            value={user.courseName || ''}
                            onChange={(e) => handleCourseChange(user.id, e.target.value)}
                            placeholder={`Leave empty to use global course: ${store.data.globalCourseName}`}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-600 mt-2">
                            {user.courseName?.trim()
                              ? `Using: ${user.courseName}`
                              : `Using global: ${store.data.globalCourseName}`}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-900">
                            Individual Issue Date Override
                          </label>
                          <Input
                            type="date"
                            value={user.issueDateOverride || ''}
                            onChange={(e) => handleDateChange(user.id, e.target.value || '')}
                            placeholder="Leave empty to use global date"
                            className="w-full"
                          />
                          <p className="text-xs text-gray-600 mt-2">
                            {user.issueDateOverride
                              ? `Using: ${user.issueDateOverride}`
                              : `Using global: ${store.data.globalIssueDate}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`Certificate Preview - ${previewUser?.fullName || ''}`}
      >
        {previewUser && (
          <div>
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <CertificateTemplate
                userName={previewUser.fullName}
                courseName={getCourseName(previewUser)}
                certificateNumber={`PREVIEW-${Date.now()}`}
                issueDate={getIssueDate(previewUser)}
                qrCodeValue={`${window.location.origin}/verify/preview`}
              />
            </div>
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => generateIndividualCertificate(previewUser)}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Download Certificate'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
