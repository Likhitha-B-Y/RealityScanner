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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
        {/* Animated Radar Pulse */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-cyan-500/20 animate-pulse" />
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shadow-lg">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white tracking-tight mb-1">
          Reality Scanner Active
        </h3>
        <p className="text-xs text-slate-400 mb-6">Autonomous Civic Perception Pipeline</p>

        {/* Step Items */}
        <div className="w-full space-y-3">
          {STAGES.map((s) => {
            const Icon = s.icon;
            const isCompleted = activeStage > s.step;
            const isCurrent = activeStage === s.step;

            return (
              <div
                key={s.step}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 border ${
                  isCurrent
                    ? `${s.border} bg-slate-800/80 shadow-md`
                    : isCompleted
                    ? 'border-slate-800/50 bg-slate-900/50 opacity-60'
                    : 'border-transparent opacity-30'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isCurrent ? 'bg-slate-800 ' + s.color : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">{s.title}</span>
                    {isCompleted && (
                      <span className="text-[10px] text-emerald-400 font-mono">DONE</span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] text-cyan-400 font-mono animate-pulse">
                        RUNNING
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{s.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Latency Guarantee Notice */}
        <div className="mt-6 text-[10px] text-slate-500 font-mono text-center">
          SUB-4s INFERENCE · EXPLAINABLE WEIGHTS · ZERO FORMS
        </div>
      </div>
    </div>
  );
};
