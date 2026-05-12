'use client';

import React from 'react';
import { useCertificateStore } from '@/lib/store';

const STEPS = [
  { number: 1, name: 'Upload' },
  { number: 2, name: 'Manage' },
  { number: 3, name: 'Preview' },
  { number: 4, name: 'Generate' },
];

export const ProgressBar = () => {
  const currentStep = useCertificateStore((state) => state.currentStep);

  return (
    <div className="bg-white border-b px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.number}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
                    step.number <= currentStep
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step.number}
                </div>
                <p
                  className={`text-sm font-semibold mt-2 ${
                    step.number <= currentStep ? 'text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  {step.name}
                </p>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    step.number < currentStep ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
