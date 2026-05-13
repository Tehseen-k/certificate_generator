'use client';

import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, Sparkles, Users, FileSpreadsheet, File } from 'lucide-react';
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      await processFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      setUploadedFile(file);
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

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
      case 'txt':
      case 'csv':
        return <File className="w-8 h-8 text-blue-600" />;
      default:
        return <FileText className="w-8 h-8 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 rounded-full shadow-lg">
            <Upload className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Upload Your Participants
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Start by uploading a list of participants. We support Excel and text files with intelligent name detection.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              File Upload
            </CardTitle>
            <CardDescription>
              Drag & drop or click to browse your participant list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50 scale-105 shadow-lg'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-25'
              } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              {isLoading ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-lg font-semibold text-indigo-600">Processing file...</p>
                  <p className="text-sm text-gray-600">This may take a few seconds</p>
                </div>
              ) : uploadedFile ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    {getFileIcon(uploadedFile.name)}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-600 flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      File Uploaded!
                    </p>
                    <p className="text-sm text-gray-600 truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Drop your file here
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      or click to browse your computer
                    </p>
                  </div>

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
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                    >
                      Browse Files
                    </Button>
                  </label>
                </div>
              )}
            </div>

            {/* Supported Formats */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">Supported Formats:</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <FileSpreadsheet className="w-3 h-3" />
                  Excel (.xlsx, .xls)
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  <File className="w-3 h-3" />
                  Text (.txt, .csv)
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">Upload Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Templates & Info Section */}
        <div className="space-y-6">
          {/* Download Templates */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
                Sample Templates
              </CardTitle>
              <CardDescription>
                Download pre-formatted templates to get started quickly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button
                  type="button"
                  onClick={() => downloadExcelTemplate().catch(() => {})}
                  variant="outline"
                  className="justify-start h-auto p-4 hover:bg-indigo-50 hover:border-indigo-300"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                    <div className="text-left">
                      <p className="font-semibold">Excel Template</p>
                      <p className="text-xs text-gray-600">Recommended for most users</p>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={downloadTxtTemplate}
                  variant="outline"
                  className="justify-start h-auto p-4 hover:bg-blue-50 hover:border-blue-300"
                >
                  <div className="flex items-center gap-3">
                    <File className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <p className="font-semibold">Text Template</p>
                      <p className="text-xs text-gray-600">Simple format for basic lists</p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-indigo-600" />
                Smart Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong>Intelligent Detection:</strong> Automatically finds names regardless of column headers
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong>Deduplication:</strong> Removes duplicate entries automatically
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong>Course Detection:</strong> Identifies course names when available
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong>Flexible Formats:</strong> Works with various Excel and text file formats
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900">💡 Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Column Names:</strong> Use any column names like "Name", "Full Name", "Participant", etc.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Course Column:</strong> Add a "Course" or "Training" column for individual course assignments.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Large Files:</strong> Files with up to 1000 participants are processed quickly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
