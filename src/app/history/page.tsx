'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Download, Eye, Loader2, Award } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CertificateTemplate } from '@/components/certificate-templates/CertificateTemplate';
import { generateAndDownloadCertificate, buildQrCodeValue } from '@/lib/certificate-generation';
import { fetchWithTimeout } from '@/lib/async-timeout';
import type { Certificate } from '@/types/certificate';
import type { CertificateSearchField } from '@/lib/firestore-service';

const PAGE_SIZE = 20;

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HistoryPage() {
  const [field, setField] = useState<CertificateSearchField>('all');
  const [search, setSearch] = useState('');
  const [appliedField, setAppliedField] = useState<CertificateSearchField>('all');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [items, setItems] = useState<Certificate[]>([]);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);
  const [nextCursorId, setNextCursorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Certificate | null>(null);

  const requestIdRef = React.useRef(0);

  const loadPage = useCallback(
    async (cursor: string | undefined, nextField: CertificateSearchField, nextSearch: string) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          field: nextField,
          pageSize: String(PAGE_SIZE),
        });
        if (nextSearch) params.set('search', nextSearch);
        if (cursor) params.set('cursor', cursor);

        const response = await fetchWithTimeout(`/api/certificates?${params.toString()}`, {
          timeoutMs: 20000,
        });
        const data = await response.json().catch(() => ({}));
        if (requestId !== requestIdRef.current) return;
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load certificates');
        }
        setItems(data.items || []);
        setNextCursorId(data.nextCursorId || null);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setItems([]);
        setNextCursorId(null);
        setError(err instanceof Error ? err.message : 'Failed to load certificates');
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const term = search.trim();
    let nextField: CertificateSearchField = 'all';
    let nextSearch = '';

    if (field === 'issueDate' && term) {
      nextField = 'issueDate';
      nextSearch = term;
    } else if (field !== 'all' && field !== 'issueDate' && term.length >= 3) {
      nextField = field;
      nextSearch = term;
    }

    const delay = field === 'all' || field === 'issueDate' || term.length < 3 ? 0 : 300;
    const timer = window.setTimeout(() => {
      setAppliedField(nextField);
      setAppliedSearch(nextSearch);
      setCursorStack([undefined]);
      setPageIndex(0);
      loadPage(undefined, nextField, nextSearch);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [field, search, loadPage]);

  const handleFieldChange = (nextField: CertificateSearchField) => {
    setField(nextField);
    if (nextField === 'all') {
      setSearch('');
    }
  };

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const resetFilters = () => {
    setField('all');
    setSearch('');
  };

  const goNext = () => {
    if (!nextCursorId) return;
    const nextIndex = pageIndex + 1;
    const nextStack = cursorStack.slice(0, nextIndex);
    nextStack[nextIndex] = nextCursorId;
    setCursorStack(nextStack);
    setPageIndex(nextIndex);
    loadPage(nextCursorId, appliedField, appliedSearch);
  };

  const goPrev = () => {
    if (pageIndex === 0) return;
    const prevIndex = pageIndex - 1;
    const prevCursor = cursorStack[prevIndex];
    setPageIndex(prevIndex);
    loadPage(prevCursor, appliedField, appliedSearch);
  };

  const downloadAgain = async (cert: Certificate) => {
    setDownloadingId(cert.id);
    try {
      await generateAndDownloadCertificate(
        {
          userName: cert.userName,
          courseName: cert.courseName || 'IOSH Managing Safely',
          certificateNumber: cert.certificateNumber,
          issueDate: cert.issueDate,
        },
        { skipFirebaseSave: true }
      );
    } catch {
      setError('Failed to regenerate this certificate. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-50">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-indigo-600 text-sm font-semibold tracking-wide uppercase mb-1">
              Records
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Certificate history</h1>
            <p className="text-slate-600 text-sm mt-2">
              Search issued certificates, preview them, and download a fresh PDF.
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-indigo-100 px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500">This page</p>
            <p className="text-lg font-semibold text-slate-900">{items.length} shown</p>
          </div>
        </div>

        <Card className="mb-6 border-0 shadow-lg shadow-indigo-100/60 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600" />
          <CardContent className="pt-6">
            <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Filter by</label>
                <select
                  value={field}
                  onChange={(e) => handleFieldChange(e.target.value as CertificateSearchField)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All certificates</option>
                  <option value="certificateNumber">Certificate number</option>
                  <option value="userName">Holder name</option>
                  <option value="courseName">Course name</option>
                  <option value="issueDate">Issue date</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Search</label>
                {field === 'issueDate' ? (
                  <Input
                    type="date"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                ) : (
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={
                      field === 'all'
                        ? 'Choose a filter to search'
                        : 'Type at least 3 characters'
                    }
                    disabled={field === 'all'}
                    className="bg-slate-50 border-slate-200"
                  />
                )}
              </div>
              <div className="flex items-end gap-2">
                <Button type="button" variant="outline" className="w-full" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Holder</th>
                  <th className="px-5 py-3.5 font-semibold">Course</th>
                  <th className="px-5 py-3.5 font-semibold">Certificate number</th>
                  <th className="px-5 py-3.5 font-semibold">Issued</th>
                  <th className="px-5 py-3.5 font-semibold">Created</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                      Loading certificates...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-slate-500">
                      <Award className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No certificates found
                    </td>
                  </tr>
                ) : (
                  items.map((cert) => (
                    <tr key={cert.id} className="border-t border-slate-100 hover:bg-indigo-50/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-900">{cert.userName}</td>
                      <td className="px-5 py-4 text-slate-700">{cert.courseName}</td>
                      <td className="px-5 py-4 font-mono text-xs text-indigo-700">{cert.certificateNumber}</td>
                      <td className="px-5 py-4 text-slate-600">{cert.issueDate}</td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(cert.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setViewing(cert)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => downloadAgain(cert)}
                            disabled={downloadingId === cert.id}
                          >
                            {downloadingId === cert.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-1" />
                            )}
                            Download
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/80">
            <p className="text-sm text-slate-600">Page {pageIndex + 1}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goPrev} disabled={pageIndex === 0 || loading}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={goNext} disabled={!nextCursorId || loading}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden bg-white p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{viewing?.userName}</DialogTitle>
            <DialogDescription>
              {viewing?.certificateNumber} · {viewing?.courseName}
            </DialogDescription>
          </DialogHeader>
          {viewing ? (
            <div className="overflow-auto max-h-[70vh] rounded-lg border bg-slate-100 p-3">
              <div className="mx-auto w-[210mm] origin-top scale-[0.45] sm:scale-[0.55] md:scale-[0.65] h-[134mm] sm:h-[163mm] md:h-[193mm]">
                <CertificateTemplate
                  userName={viewing.userName}
                  courseName={viewing.courseName || 'IOSH Managing Safely'}
                  certificateNumber={viewing.certificateNumber}
                  issueDate={viewing.issueDate}
                  qrCodeValue={buildQrCodeValue(viewing.certificateNumber)}
                />
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
