'use client';

import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCertificateStore } from '@/lib/store';
import { parseFile, removeDuplicates } from '@/lib/certificate-helpers';
import { downloadExcelTemplate, downloadTxtTemplate } from '@/lib/template-helpers';

export const UploadStep = () => {
  const store = useCertificateStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError('');

    try {
      const users = await parseFile(file);

      if (users.length === 0) {
        setError('No names found in the file. Please check the file format.');
        setIsLoading(false);
        return;
      }

      // Remove duplicates
      const uniqueUsers = removeDuplicates(users);

      // Update store
      store.updateUsers(uniqueUsers);

      // Move to next step
      store.setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Participants List</CardTitle>
          <CardDescription>Upload an Excel or TXT file containing participant names and optional course names</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Download Templates */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-3">Download Sample Templates:</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => downloadExcelTemplate().catch(() => {})}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Excel Template
              </Button>
              <Button
                onClick={downloadTxtTemplate}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Text Template
              </Button>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
              isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg font-semibold mb-2">Drag and drop your file</p>
            <p className="text-sm text-slate-600 mb-4">or click to browse</p>

            <input
              type="file"
              accept=".xlsx,.xls,.txt,.csv"
              onChange={handleFileInput}
              disabled={isLoading}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('file-input')?.click();
                }}
                disabled={isLoading}
              >
                Browse Files
              </Button>
            </label>

            <p className="text-xs text-slate-500 mt-4">Supported formats: Excel (.xlsx, .xls), Text (.txt, .csv)</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded p-3">
              <X className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> The system will intelligently detect names regardless of column names (name,
              full name, first name, last name, etc.) and also detects course fields when available.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
