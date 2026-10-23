/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MultilingualToggleProps {
  currentLanguage: 'en' | 'hi' | 'kn';
  onChange: (lang: 'en' | 'hi' | 'kn') => void;
}

export const MultilingualToggle: React.FC<MultilingualToggleProps> = ({
  currentLanguage,
  onChange,
}) => {
  const options: Array<{ code: 'en' | 'hi' | 'kn'; label: string; native: string }> = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
      {options.map((opt) => (
        <button
          key={opt.code}
          onClick={() => onChange(opt.code)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentLanguage === opt.code
              ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {opt.native}
        </button>
      ))}
    </div>
  );
};
