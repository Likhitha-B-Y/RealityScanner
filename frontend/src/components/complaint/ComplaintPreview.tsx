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
    <div className="w-full card-surface-elevated overflow-hidden fade-in-up flex flex-col">
      <div className="relative px-6 pt-6 pb-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
        {/* Header with Language switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/40">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/10 border border-emerald-400/40 flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.4em] text-emerald-300">Stage E Output</span>
              <h3 className="text-sm font-semibold text-white mt-1">Generated Grievance Package</h3>
            </div>
          </div>
          <MultilingualToggle currentLanguage={language} onChange={setLanguage} />
        </div>
      </div>

      {/* Format Selector Tabs */}
      <div className="mx-6 flex items-center gap-1 p-1 bg-slate-950/60 rounded-full border border-slate-700/50">
        <button
          onClick={() => setActiveTab('letter')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${activeTab === 'letter'
            ? 'bg-gradient-to-r from-cyan-400/90 to-emerald-400/90 text-slate-950 shadow-[0_30px_60px_-40px_rgba(52,211,153,0.9)]'
            : 'text-slate-400 hover:text-slate-100'
            }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Formal Letter</span>
        </button>

        <button
          onClick={() => setActiveTab('portal')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${activeTab === 'portal'
            ? 'bg-gradient-to-r from-cyan-400/90 to-emerald-400/90 text-slate-950 shadow-[0_30px_60px_-40px_rgba(52,211,153,0.9)]'
            : 'text-slate-400 hover:text-slate-100'
            }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Portal Form</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex-1 py-2 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${activeTab === 'social'
            ? 'bg-gradient-to-r from-cyan-400/90 to-emerald-400/90 text-slate-950 shadow-[0_30px_60px_-40px_rgba(52,211,153,0.9)]'
            : 'text-slate-400 hover:text-slate-100'
            }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Post</span>
        </button>
      </div>

      {/* Content Viewer */}
      <div className="mx-6 relative bg-slate-950/60 rounded-2xl p-5 border border-slate-700/50 font-mono text-xs text-slate-300 max-h-80 overflow-y-auto leading-relaxed select-text whitespace-pre-wrap">
        <button
          onClick={handleCopy}
          className="sticky top-0 float-right px-3 py-1.5 rounded-full bg-slate-950/70 text-slate-300 hover:text-white text-[11px] font-sans flex items-center gap-1.5 border border-slate-700/50 backdrop-blur-sm transition-all hover:border-cyan-400/40"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
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
      <div className="px-6 pb-6 pt-2">
        <button
          onClick={() => onSubmit(currentBundle.formal_letter)}
          disabled={isSubmitting}
          className="w-full py-3.5 px-5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_40px_80px_-60px_rgba(52,211,153,0.9)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Submitting to Municipal Portal...' : 'Submit Grievance to Municipal Authority'}</span>
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-3 font-mono uppercase tracking-[0.4em]">
          Routes to civic portal · Assigns ticket ID · Enforces SLA
        </p>
      </div>
    </div>
  );
};