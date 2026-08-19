'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Award, History, Home, KeyRound, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchWithTimeout } from '@/lib/async-timeout';
import { useCertificateStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const setStep = useCertificateStore((state) => state.setStep);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const goToLanding = () => {
    router.push('/');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setSaving(true);
    try {
      const response = await fetchWithTimeout('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
        timeoutMs: 10000,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setPasswordError(data.error || 'Could not change password.');
        return;
      }
      setPasswordSuccess('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not change password.');
    } finally {
      setSaving(false);
    }
  };

  const generateActive = pathname === '/app' || pathname.startsWith('/app/');
  const historyActive = pathname === '/history' || pathname.startsWith('/history/');

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white py-4 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goToLanding}
            className="flex items-center gap-3 min-w-0 text-left cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="bg-white/20 p-2 rounded-lg shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight">Certificate Generator</h1>
              <p className="text-indigo-100 text-sm hidden sm:block">
                Professional certificate creation made easy
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <nav className="flex items-center rounded-full bg-black/15 p-1 shrink-0">
              <Link
                href="/app"
                onClick={() => setStep(1)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  generateActive
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-white/90 hover:bg-white/15'
                )}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Generate</span>
              </Link>
              <Link
                href="/history"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  historyActive
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-white/90 hover:bg-white/15'
                )}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Link>
            </nav>

            <Button
              variant="secondary"
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border-0"
              onClick={() => {
                setPasswordError('');
                setPasswordSuccess('');
                setPasswordOpen(true);
              }}
            >
              <KeyRound className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Password</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border-0"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Update the admin login password for this system.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Current password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">New password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Confirm new password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
            {passwordSuccess ? <p className="text-sm text-green-600">{passwordSuccess}</p> : null}
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Update password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
};
