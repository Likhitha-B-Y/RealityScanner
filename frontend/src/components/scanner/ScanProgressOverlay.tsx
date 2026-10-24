/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Eye, ShieldAlert, GitCompare, FileText } from 'lucide-react';

interface ScanProgressOverlayProps {
  currentStage?: number; // 1 to 4
}

export const ScanProgressOverlay: React.FC<ScanProgressOverlayProps> = ({ currentStage = 1 }) => {
  const [internalStage, setInternalStage] = useState(1);

  useEffect(() => {
    // Progressively advance through stages if backend is fast
    const t1 = setTimeout(() => setInternalStage(2), 700);
    const t2 = setTimeout(() => setInternalStage(3), 1500);
    const t3 = setTimeout(() => setInternalStage(4), 2300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const activeStage = Math.max(currentStage, internalStage);

  const STAGES = [
    {
      step: 1,
      title: 'Perception Engine',
      subtitle: 'Multimodal defect classification & dimension extraction...',
      icon: Eye,
      color: 'text-cyan-400',
      border: 'border-cyan-500/50',
    },
    {
      step: 2,
      title: 'Explainable Severity Engine',
      subtitle: 'Calculating life hazard, footfall weight & SLA tier...',
      icon: ShieldAlert,
      color: 'text-amber-400',
      border: 'border-amber-500/50',
    },
    {
      step: 3,
      title: 'Duplicate Moat Check',
      subtitle: 'Geospatial Haversine radius & visual feature matching...',
      icon: GitCompare,
      color: 'text-purple-400',
      border: 'border-purple-500/50',
    },
    {
      step: 4,
      title: 'Complaint Drafting',
      subtitle: 'Generating formal letter, portal form & social post...',
      icon: FileText,
      color: 'text-emerald-400',
      border: 'border-emerald-500/50',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="w-full max-w-md card-surface overflow-hidden flex flex-col items-center fade-in-up">
        <div className="relative w-full h-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-emerald-400/20 animate-pulse" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-emerald-400/20 border border-cyan-300/60 flex items-center justify-center shadow-[0_60px_120px_-80px_rgba(34,211,238,0.9)]">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-[11px] font-mono uppercase tracking-[0.5em] text-cyan-300">Reality Scanner Active</p>
          <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mt-2">
            Autonomous civic perception
          </h3>
          <p className="text-sm text-slate-400 mt-2">Perceiving, classifying, and routing your report with explainable AI.</p>
        </div>

        {/* Step Items */}
        <div className="w-full px-6 space-y-2">
          {STAGES.map((s) => {
            const Icon = s.icon;
            const isCompleted = activeStage > s.step;
            const isCurrent = activeStage === s.step;

            return (
              <div
                key={s.step}
                className={`flex items-start gap-3 p-3 rounded-2xl transition-all duration-500 border ${
                  isCurrent
                    ? `${s.border} bg-slate-950/70 shadow-[0_40px_80px_-70px_rgba(34,211,238,0.9)]`
                    : isCompleted
                    ? 'border-emerald-400/30 bg-emerald-400/5'
                    : 'border-slate-800/70 bg-slate-950/40'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-gradient-to-br from-cyan-400/30 to-emerald-400/20 ' + s.color
                      : isCompleted
                      ? 'bg-emerald-400/15 text-emerald-300'
                      : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-medium ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                      {s.title}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] text-emerald-300 font-mono uppercase tracking-[0.3em]">Done</span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] text-cyan-300 font-mono uppercase tracking-[0.3em] animate-pulse">
                        Running
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>{s.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Latency Guarantee Notice */}
        <div className="mt-6 mb-2 px-6 text-[11px] text-slate-500 font-mono text-center uppercase tracking-[0.4em]">
          Sub-4s inference · Explainable weights · Zero forms
        </div>
      </div>
    </div>
  );
};
