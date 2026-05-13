'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white py-4 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Certificate Generator</h1>
              <p className="text-indigo-100 text-sm">Professional certificate creation made easy</p>
            </div>
          </div>

          <Link href="/">
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
