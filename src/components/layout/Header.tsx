'use client';

import React from 'react';
import { useCertificateStore } from '@/lib/store';

export const Header = () => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-6 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold">Certificate Generator</h1>
        <p className="text-indigo-100 mt-1">Generate bulk certificates in minutes</p>
      </div>
    </header>
  );
};
