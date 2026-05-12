'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCertificateStore } from '@/lib/store';
import type { CertificateUser } from '@/types/certificate';

export const PreviewStep = () => {
  const store = useCertificateStore();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const getIssueDate = (user: CertificateUser): string => {
    return user.issueDateOverride || store.data.globalIssueDate;
  };

  const handleDateChange = (userId: string, date: string) => {
    store.updateUser(userId, { issueDateOverride: date });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Certificate Settings & Preview</CardTitle>
          <CardDescription>Configure issue dates and review certificate details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Issue Date */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <label className="block text-sm font-semibold mb-3 text-indigo-900">Global Issue Date</label>
            <p className="text-xs text-indigo-700 mb-3">
              This date will be applied to all certificates unless individually overridden
            </p>
            <Input
              type="date"
              value={store.data.globalIssueDate}
              onChange={(e) => store.setGlobalIssueDate(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Participants Preview */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Participants Certificate Details</h3>
            <div className="space-y-2">
              {store.data.users.map((user, index) => (
                <div key={user.id} className="border rounded-lg">
                  <button
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    className="w-full p-4 text-left hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {index + 1}. {user.fullName}
                      </p>
                      <p className="text-xs text-slate-600">Date: {getIssueDate(user)}</p>
                    </div>
                    <span className="text-slate-400">{expandedUser === user.id ? '▼' : '▶'}</span>
                  </button>

                  {expandedUser === user.id && (
                    <div className="border-t bg-slate-50 p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Individual Issue Date Override</label>
                        <Input
                          type="date"
                          value={user.issueDateOverride || ''}
                          onChange={(e) => handleDateChange(user.id, e.target.value || '')}
                          className="max-w-xs"
                          placeholder="Leave empty to use global date"
                        />
                        <p className="text-xs text-slate-600 mt-2">
                          {user.issueDateOverride
                            ? `Using custom date: ${user.issueDateOverride}`
                            : `Using global date: ${store.data.globalIssueDate}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-900">
              <strong>Summary:</strong> You will generate <strong>{store.data.users.length}</strong> certificates.
              Each certificate will have a unique number and QR code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
