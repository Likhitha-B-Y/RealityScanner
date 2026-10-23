/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { X, Sparkles, CheckCircle, AlertTriangle, AlertCircle, Ban } from 'lucide-react';
import { api } from '../../services/api.ts';

interface DemoSelectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

export const DemoSelectorSheet: React.FC<DemoSelectorSheetProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
}) => {
  const [scenarios, setScenarios] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.getDemoScenarios().then((data) => {
        if (data?.scenarios) {
          setScenarios(data.scenarios);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'duplicate_test':
        return <span className="text-[10px] text-purple-400">DUPLICATE MOAT</span>;
      case 'emergency':
        return <span className="text-[10px] text-red-400">P1 LIFE HAZARD</span>;
      case 'sanitation':
        return <span className="text-[10px] text-lime-400">SANITATION</span>;
      case 'electrical':
        return <span className="text-[10px] text-sky-400">ELECTRICAL</span>;
      case 'refusal_test':
        return <span className="text-[10px] text-amber-400">RETAKE GUIDANCE</span>;
      case 'fraud_test':
        return <span className="text-[10px] text-orange-400">ANTI-FRAUD AUDIT</span>;
      case 'rejection_test':
        return <span className="text-[10px] text-rose-400">NON-CIVIC REJECTION</span>;
      default:
        return <span className="text-[10px] text-cyan-400">CIVIC ROAD</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'duplicate_test':
        return <CheckCircle className="w-4 h-4 text-purple-400" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'refusal_test':
      case 'rejection_test':
        return <Ban className="w-4 h-4 text-amber-400" />;
      case 'fraud_test':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Grab Handle */}
        <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto my-3 shrink-0" />

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Judge Demo Scenarios (8)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant 1-tap testing of all pipeline stages & edge cases
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="p-4 space-y-2.5 overflow-y-auto">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSelectScenario(s.id);
                onClose();
              }}
              className="w-full text-left p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 transition-all flex items-start gap-3 active:scale-[0.99]"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                {getCategoryIcon(s.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-100 truncate">{s.label}</span>
                  {getCategoryBadge(s.category)}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{s.subtitle}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-mono">
                  <span>{s.address}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
