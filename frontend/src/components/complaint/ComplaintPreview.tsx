/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Send, Copy, Check, Share2, Building2, Globe } from 'lucide-react';
import { ComplaintBundle } from '../../types/realityScanner.ts';
import { MultilingualToggle } from './MultilingualToggle.tsx';

interface ComplaintPreviewProps {
  complaints: Record<'en' | 'hi' | 'kn', ComplaintBundle>;
  onSubmit: (finalText: string) => void;
  isSubmitting?: boolean;
}

export const ComplaintPreview: React.FC<ComplaintPreviewProps> = ({
  complaints,
  onSubmit,
  isSubmitting = false,
}) => {
  const [activeTab, setActiveTab] = useState<'letter' | 'portal' | 'social'>('letter');
  const [language, setLanguage] = useState<'en' | 'hi' | 'kn'>('en');
  const [copied, setCopied] = useState(false);

  const currentBundle = complaints[language] || complaints.en;

  const handleCopy = () => {
    let textToCopy = '';
    if (activeTab === 'letter') textToCopy = currentBundle.formal_letter;
    else if (activeTab === 'social') textToCopy = currentBundle.social_post;
    else textToCopy = JSON.stringify(currentBundle.portal_fields, null, 2);

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header with Language switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase">Stage E Output</span>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Generated Grievance Package
          </h3>
        </div>
        <MultilingualToggle currentLanguage={language} onChange={setLanguage} />
      </div>

      {/* Format Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setActiveTab('letter')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'letter'
              ? 'bg-slate-800 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Formal Letter</span>
        </button>

        <button
          onClick={() => setActiveTab('portal')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'portal'
              ? 'bg-slate-800 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>Portal Form</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'social'
              ? 'bg-slate-800 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Social Post</span>
        </button>
      </div>

      {/* Content Viewer */}
      <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800/80 font-mono text-xs text-slate-300 max-h-72 overflow-y-auto leading-relaxed select-text whitespace-pre-wrap">
        <button
          onClick={handleCopy}
          className="sticky top-0 float-right px-2.5 py-1.5 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white text-[11px] font-sans flex items-center gap-1 border border-slate-700 backdrop-blur-sm"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {activeTab === 'letter' && currentBundle.formal_letter}

        {activeTab === 'portal' && (
          <div className="space-y-2">
            {Object.entries(currentBundle.portal_fields).map(([key, val]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-slate-900 gap-1">
                <span className="text-slate-500 uppercase text-[10px]">{key.replace(/_/g, ' ')}:</span>
                <span className="text-slate-200 font-medium break-all">{val}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'social' && currentBundle.social_post}
      </div>

      {/* Submit Action Button */}
      <div className="pt-2">
        <button
          onClick={() => onSubmit(currentBundle.formal_letter)}
          disabled={isSubmitting}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Submitting to Municipal Portal...' : 'Submit Grievance to Municipal Authority'}</span>
        </button>
        <p className="text-[10px] text-slate-500 text-center mt-2 font-mono">
          ROUTES TO BBMP SAKALA API · ASSIGNS OFFICIAL TICKET ID · ENFORCES SLA
        </p>
      </div>
    </div>
  );
};
